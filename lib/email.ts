import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Brevo uses TLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  });

  console.log("✅ Email sent:", info.messageId);
}
