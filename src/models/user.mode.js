import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const user_schema=new Schema({
     username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
      },
      name:{
        type:String,
        required:true,
        unique:true
      },
      email:{
        type:String,
        required:true,
        unique:true
      },
      Image:{
        type:String,// cloudinary url
      },
      password:{
        type:String,
        required:[true,"Password is required"]
      },
      watch_history:{
        type:Schema.Types.ObjectId,
        ref:videos
      }
},{timestamps:true})
user_schema.pre("save",async function(next){
if(!this.isModified("password")) return next()

this.password=bcrypt.hash(this.password,10)
next()
})
user_schema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password)
}
user_schema.methods.generateAccessToken=function(){
  jwt.sign(
    {
      _id:this._id,
      name:this.username,
      email:this.email

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
user_schema.methods.generateRefreshToken=function(){
  jwt.sign(
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