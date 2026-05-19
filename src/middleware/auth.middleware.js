import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'



const verifyJwt=asyncHandler(async(req,res,next)=>{
   try {
      const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
      if(!token){
       throw new ApiError(401,"unauthorized request")
      }
   const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   const user =await User.findById(decodedToken?._id).select("-password -refreshToken")
   if(!user){
      throw new ApiError(401,"invalid access token")
   }
   else{
      req.user=user
   }
   } catch (error) {
      throw new ApiError(401,error?.message||"invalid access token")
   }
})
export {verifyJwt}