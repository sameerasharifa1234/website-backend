import { Router } from "express"
import {
register,
login,
sendOTP,
verifyOTP,
forgotPassword
} from "@/controllers/authController"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)

export default router
