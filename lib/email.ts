import Brevo from "@getbrevo/brevo";

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
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
  };

  try {
    const result = await client.sendTransacEmail(email);
    console.log("✅ Email sent:", result.body.messageId);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}
