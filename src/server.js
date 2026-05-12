import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
const App=express()

App.get('/',(req,res)=>{
    res.send("i am here what are you finding");
})


App.listen(process.env.PORT,()=>{
    console.log(`this server is hosted on ${process.env.PORT}`)
})

