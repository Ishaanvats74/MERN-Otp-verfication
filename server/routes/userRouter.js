import express from "express";
import { register, verifyOTP,login, logout } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

 
const router = express.Router();
router.post("/register",register)
router.post("/otp-verification",verifyOTP)
router.post("/login",login);
router.get("/logout",isAuthenticated,logout);

export default router;    