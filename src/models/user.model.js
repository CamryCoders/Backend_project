import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {Videos} from './video.model.js'

const user_schema=new Schema({
     username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
      },
      full_name:{
        type:String,
        required:true,
        unique:true
      },
      email:{
        type:String,
        required:true,
        unique:true
      },
      avatar:{
        type:String,// cloudinary url
      },
      password:{
        type:String,
        required:[true,"Password is required"]
      },
      watch_history:{
        type:Schema.Types.ObjectId,
        ref:"Videos"
      },
      refreshToken:{
        type:String,
      }
},{timestamps:true})
user_schema.pre("save",async function(next){
if(!this.isModified("password")) return

this.password=await bcrypt.hash(this.password,10)
next()

})
user_schema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password)
}
user_schema.methods.generateAccessToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      username:this.username,
      email:this.email

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
user_schema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}



export const User =mongoose.model("User",user_schema)