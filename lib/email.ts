import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.hostinger.com
  port: Number(process.env.SMTP_PORT), // 465 أو 587
  secure: Number(process.env.SMTP_PORT) === 465, // true للـ 465, false للـ 587
  auth: {
    user: process.env.SMTP_USER, // بريدك الاحترافي
    pass: process.env.SMTP_PASS, // الباسورد
  },
});

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM, // لازم يكون نفس البريد أو دومينك
      to,
      subject,
      text,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}
