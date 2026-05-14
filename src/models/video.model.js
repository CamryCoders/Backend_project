import mongoose,{Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const video_schema= new Schema({
     videoFile:{
        type:String,//cloudinary url
        required:true
     },
     thumbnail:{
        type:String,
        required:true,
     },
     title:{
        type:String,
        required:true
     },
     description:{
        type:String,
        required:true
     },
     title:{
        type:String,
        required:true
     },
     duratin:{
        type:Number,
        required:true
     },
     views:{
        type:Number,
        default:0,
     },
     isPublished:{
        type:Boolean
     },
     owner:{
        type:Schema.Types.ObjectId,
        ref:User
     }
     
})
video_schema.plugin(mongooseAggregatePaginate)
export const Videos=mongoose.model("Video",video_schema)
