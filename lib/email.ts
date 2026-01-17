import Brevo from "@getbrevo/brevo";

export async function sendEmail({
  to,
  subject,
  text,
  html,
  fromName,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
  replyTo?: { email: string; name: string };
}) {
  const client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY!,
  );

  const email = {
    sender: {
      email: "admin@orchida-ods.com",
      name: fromName || "orchida",
    },
    to: [{ email: to }],
    replyTo: replyTo,
    subject,
    textContent: text,
    htmlContent: html,
  };

  try {
    const result = await client.sendTransacEmail(email);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
}
