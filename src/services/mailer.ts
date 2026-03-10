import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  return transporter.sendMail({
    from: `"My App" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
