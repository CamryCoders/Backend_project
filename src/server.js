






import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { DB_NAME } from './constants.js';
import express from 'express'
import Connect_DB from './db/connect.js';
import cors from 'cors'
import {app} from './index.js'


dotenv.config()
app.use(cors())


app.get('/',(req,res)=>{
    console.log("req",req.url)
    res.send("i am here where are you searching me?");
})
Connect_DB()
.then(()=>{
app.listen(process.env.PORT||8000,()=>{
    console.log(`this is hosted on port ${process.env.PORT}`)
    
})

})
.catch((error)=>{
    console.log("MONGO_DB connection failed!!",error)
})














// /*
//     ; (async () => {
//         try {
//             await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//             App.on("error", (error) => {
//                 console.log("ERROR:", error);
//                 throw error
//             })

//             App.listen(process.env.PORT,()=>{
//                 console.log(`this server is hosted on ${ process.env.PORT}`)
//             })
//         } catch (error) {
//             throw error
//         }


//     })()*/