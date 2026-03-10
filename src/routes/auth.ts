import { Router, Request, Response } from "express";
import { registerUser, verifyLogin } from "@/services/authService";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const userRecord = await registerUser({ name, email, password });
    res.json({ message: "User registered", uid: userRecord.uid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { idToken } = req.body;
  try {
    const decoded = await verifyLogin({ idToken });
    res.json({ message: "Login successful", uid: decoded.uid, email: decoded.email });
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

import {
  generateAndSendOtp,
  verifyOtp,
  resetPassword,
  generateAndSendRegisterOtp,
  verifyAndRegisterUser
} from "@/services/authService";

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const result = await generateAndSendOtp(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const result = await verifyOtp(email, otp);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  console.log(`Reset password attempt for: ${email}`);
  try {
    const result = await resetPassword(email, otp, newPassword);
    console.log("Reset successful:", result);
    res.json(result);
  } catch (err: any) {
    console.error("Reset error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

router.post("/register-otp", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const result = await generateAndSendRegisterOtp({ name, email, password });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/verify-register", async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const result = await verifyAndRegisterUser(email, otp);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;