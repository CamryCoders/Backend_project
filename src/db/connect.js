import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'
import dotenv from 'dotenv'
dotenv.config()


const Connect_DB= async ()=>{
try{
    const connected_response=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

    console.log(`\n MongoDb connected!! DB HOST: ${connected_response.connection.host}`)
  
} catch(error){
console.log("Mongodb connection failed",error)
}
}
export default Connect_DB