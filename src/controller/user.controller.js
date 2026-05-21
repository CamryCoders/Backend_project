
import { ApiError } from '../utils/Apierror.js'
import {asyncHandler} from '../utils/asynchandler.js'
import { ApiResponse } from '../utils/Apiresponse.js'
import  {uploadOnCloudinary,removeFromCloudinary} from '../utils/cloudinary.js'
import {User} from '../models/user.model.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken=async (userId)=>{
try{
    
const user=await User.findById(userId)
console.log(user)
    const accesstoken= await user.generateAccessToken()
    const refreshtoken= await user.generateRefreshToken()
    console.log("this is tokens",accesstoken,refreshtoken)
 user.refreshToken=refreshtoken
    await user.save({validateBeforeSave:false})

    return {accesstoken,refreshtoken}



}
catch(error){
    console.log(error)
    throw new ApiError(500,"Something went wrong while generating refresh and access token");
}
}




const registerUser =asyncHandler( async (req,res)=>{

    const {full_name,email,password,username}=req.body

    if([full_name,email,password,username].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"all fields are compulsory")
    }
    const user_exist=await User.findOne({
        $or:[{username},{email}]
    })
    if(user_exist){
        throw new ApiError(400,"User with this email or username already exist");
    }
    const avatarlocalpath=req.files?.avatar[0]?.path

    if(!avatarlocalpath){
        throw new ApiError(402,"avatar is required");
    }
    const upload_avatar=await uploadOnCloudinary(avatarlocalpath);

    if(!upload_avatar){
        throw new ApiError(500,"avatar has not saved")
    }

    const new_user=await User.create({
        username,
        full_name,
        email,
        password,
        avatar:upload_avatar?.url,
        public_id:upload_avatar.public_id
    })

   const created_user=await User.findById(new_user.id).select(
    "-password -refreshToken"   )

    if(!created_user){
        throw new ApiError(500,"something went wrong while registering user")

    }

    return res.status(201).json(
        new ApiResponse(200,created_user,"user registered successfully")
    )



})

const loginUser=asyncHandler(async(req,res)=>{
    
        const{email,password}=req.body
console.log(email,password)
        if(
            [email,password].some((field)=>field.trim()==="")
        ){
           throw new ApiError(400,"Please complete all fields")
        }

        if(!email.includes('@')){
            throw new ApiError(402,"Please fill valid email")
        }

        const user_exist=await User.findOne({
        email,
        }).select(
            "-refreshToken"
        )
        if(!user_exist){
           throw new ApiError(402,"User not found ")
        }

        const isPasswordValid= await user_exist.isPasswordCorrect(password)
        if(!isPasswordValid){
            throw new ApiError(404,"Wrong Password")
        }
      const {accesstoken,refreshtoken}=await generateAccessAndRefreshToken(user_exist._id)
      
   const loggedInUser=await User.findById(user_exist._id).select("-password -refreshToke")
    const options={
        httpOnly:true,
        secure:false,
    }
        
        return res
        .status(200)
        .cookie("accessToken",accesstoken,options)
        .cookie("refreshToken",refreshtoken,options)
        .json(
            new ApiResponse(200,{
                user:loggedInUser,accesstoken,refreshtoken
            },"User logged succesfully")
        )



})

const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(req.user._id,
    {
        
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    }
)
   const options={
        httpOnly:true,
        secure:false,
    }

return res.status(200)
.clearCookie("accessToken")
.clearCookie("refreshToken")
.json(new ApiResponse(200,"User loggedOut successfully"))

})


const refreshAccessToken=asyncHandler(async(req,res)=>{
    const refToken_incoming=req.cookies?.refreshtoken||req.body.refreshtoken
    if(!refToken_incoming){
        throw new ApiError(401,"unauthorized request")
    }
   try {
     const refToken_exist=await jwt.verify(refToken_incoming,process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(refToken_exist?._id)
     if(!user){
         throw new ApiError(401,"unauthorized request")
     }
     if(refToken_exist===user.refreshToken){
        const {accesstoken,refreshtoken}=generateAccessAndRefreshToken(user._id)
         
     }
     else{
 throw new ApiError(401,"refresh token is expired")
     }
 
     res
     .status(200)
     .cookies("accesstoken",accesstoken,options)
     .cookies("refreshtoken",refreshtoken,options)
     .json(
         new ApiResponse(200,"New session activated")
     )
   } catch (error) {
    console.log("Token refresh error",error)
    throw new ApiError(409,"unauthorized access")
    
   }
        
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=User.findById(req.body._id);
    if(!user){
        throw new ApiError(400,"User does not exist")
    }
const isPasswordValid=await user.isPasswordCorrect(oldPassword)

if(!isPasswordValid){
    throw new ApiError(400,"Password Incorrect");
}
    
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    res.status(200).json(
        new ApiResponse(200,"Password Changed Successfully")
    )
})
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"Current user fetched Successfully")
})

const updateAvatar=asyncHandler(async(req,res)=>{
    const new_avatar=req.files?.avatar[0].path
    if(!new_avatar){
        throw new ApiError(400,"Please upload new avatar")
    }


    const new_avatarUpload=await uploadOnCloudinary(new_avatar)
    const user=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:new_avatarUpload.url
            }
        },
        {new:true}
    ).select("-password")

   const deleted=await removeFromCloudinary(user.public_id)


res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar changed Successfully")
    )
})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
   const {username}=req.params

if(!username){
    throw new ApiError(400,"User not found")
}
        const channel= await User.aggregate([{
            $match:{
                username:username
            }
         },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
         },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
         },{
            $addFields:{
                subscribercount:{$size:"$subscribers"},
                subscribedToCount:{$size:"$subscribedTo"}
            }
         },{
            isSubscribed:{
                $cond:{
                    if:{$in:[user._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
         },{
            $project:{
                username:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                full_name:1

            }
         }])
console.log(channel)

if(!channel?.length){
    throw new ApiError(404,"channel does not exist");
}
   return res.status(200).json(
    new ApiResponse(200,channel,"Profile fetched successfully")
   )

})

const getUserWatchHistory=asyncHandler(async(req,res)=>{

    const user=await User.aggregate([{
$match:{
    _id:new mongoose.Types.ObjectId(req.user._id)
}

    },{
        $lookup:{
            from :"videos",
            localField:"watch_history",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[{
                $lookup:{
                    from:"Users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"Owner",
                    pipeline:[{
                        $project:{
                             Username:1,
                             full_name:1,
                             avatar:1

                        }
                    }]
                }
            }]
        }
    },{}])
 return res.status(200).json(
    new ApiResponse(
        200,user[0].wath_istory,"watchHistory got successfully"
    )
 )

})

export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAvatar,
    getUserChannelProfile,
    getUserWatchHistory
}