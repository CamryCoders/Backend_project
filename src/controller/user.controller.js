
import { ApiError } from '../utils/Apierror.js'
import {asyncHandler} from '../utils/asynchandler.js'
import { ApiResponse } from '../utils/Apiresponse.js'
import  {uploadOnCloudinary} from '../utils/cloudinary.js'
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
        avatar:upload_avatar?.url
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

export {registerUser,loginUser,logoutUser,refreshAccessToken}