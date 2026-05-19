import {Router} from 'express'
import { loginUser, registerUser,logoutUser } from '../controller/user.controller.js'
import {upload} from '../middleware/multer_middleware.js'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { refreshAccessToken } from '../controller/user.controller.js'



const userRouter=Router()

userRouter.route("/register").post(
    upload.fields([
        {name:"avatar",
            maxCount:1
        }
        
    ]),
    registerUser)
userRouter.route("/login").post(upload.none(),loginUser)
//secured routes
userRouter.route("/logout").post(verifyJwt,logoutUser)
userRouter.route("/Refresh-token").post(refreshAccessToken)
export default userRouter