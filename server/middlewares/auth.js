import {catchAsyncError} from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import {User} from "../models/userModel.js";


export const isAuthenticated = catchAsyncError(async (req,res,next) => {
    try {
        
        const { token } = req.cookies;
        if (!token){
            return next(new ErrorHandler("User is not authenticaed", 400))
        }
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        
        req.user =  await User.findById(decoded.id);
        
        next();
    } catch (error) {
         next();
    }
})

