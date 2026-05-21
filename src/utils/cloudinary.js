import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'
import { ApiError } from './Apierror';
dotenv.config()
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary=async (localFilePath)=>{
    try{
if(!localFilePath)  return null

const response=await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto"
})


console.log("file has been uploaded on cloudinary",response)
await fs.unlinkSync(localFilePath)
return response
    }
    catch(error){
        console.log(error)
        throw error
       // remove the locally saved temporary file as the upload operation got failed

    }
}
const removeFromCloudinary=async(public_id)=>{

    try {
        const response=await cloudinary.uploader.destroy(public_id)
        console.log(response)
        
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Old avatar has not deleted")
    }

    
}
export {uploadOnCloudinary,removeFromCloudinary}