import { Router } from "express";
import { sendMail } from "../services/mailer";

const router = Router();

router.post("/send-mail", async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    await sendMail(to, subject, text);
    res.json({ message: "Email sent successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;