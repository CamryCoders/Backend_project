import {Router} from 'express'
import { loginUser, registerUser,logoutUser, getCurrentUser, getUserChannelProfile, getUserWatchHistory } from '../controller/user.controller.js'
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
userRouter.route("/change-avatar").patch(
    upload.fields(verifyJwt,[
        {name:"avatar",
            maxCount:1
        }
        
    ]),
    registerUser)
userRouter.route("/Current-user").get(verifyJwt,getCurrentUser)

    userRouter.route("/c/:username").get(verifyJwt,getUserChannelProfile)
    userRouter.route("/watch_history").get(verifyJwt,getUserWatchHistory)
export default userRouter