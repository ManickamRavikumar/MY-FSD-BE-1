import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// If local, use Gmail
let transporter = null;
if (!isProd) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("📧 Using Gmail SMTP for local development");
}

// Resend client (for Render / production)
const resend = new Resend(process.env.RESEND_API_KEY);

export { transporter, resend, isProd };
