import { Request, Response } from "express"
import { AuthService } from "@/services/authService"

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

    const user = await AuthService.register(name, email, password)
    res.status(201).json({
      message: "Registration Successful"
    })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await AuthService.login(email, password)
    res.json({
      message: "Login successful",
      user
    })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const otp = await AuthService.sendOTP(email)
    res.json({
      message: "OTP sent successfully",
    })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    if (!otp) {
      return res.status(400).json({ error: "Enter OTP" })
    }

    await AuthService.verifyOTP(email, otp)
    res.json({ message: "OTP successful" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and new password are required" })
    }

    const user = await AuthService.forgotPassword(email, password)
    res.json({
      message: "Password reset successful",
      user
    })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
