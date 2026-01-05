import Brevo from "@getbrevo/brevo";

export async function sendEmail({
  to,
  subject,
  text,

  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY!
  );

  const email = {
    sender: { email: "admin@orchida-ods.com", name: "orchida" }, // لازم يكون بريد من دومينك
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
  };

  try {
    const result = await client.sendTransacEmail(email);
    console.log("✅ Email sent:", result.body.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}
