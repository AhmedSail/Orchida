import { db } from "@/src/db";
import { contactMessages } from "@/src/db/schema";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Save to Database
    const newMessage = {
      id: uuidv4(),
      name,
      email,
      message,
      status: "new" as const,
    };

    await db.insert(contactMessages).values(newMessage);

    // 2. Send Email to Admin
    await sendEmail({
      to: "admin@orchida-ods.com",
      fromName: `اوكيدة - ${name}`,
      replyTo: { email: email, name: name },
      subject: `رسالة تواصل جديدة من: ${name}`,
      text: `
لديك رسالة تواصل جديدة:

الاسم: ${name}
البريد: ${email}
الرسالة: ${message}
  `,
      html: `
    <div dir="rtl" style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4460AA; margin-bottom: 15px;">📩 رسالة تواصل جديدة</h2>
      
      <p style="margin: 5px 0;">
        <strong>الاسم:</strong> ${name}
      </p>
      
      <p style="margin: 5px 0;">
        <strong>البريد:</strong> ${email}
      </p>
      
      <p style="margin: 10px 0;">
        <strong>الرسالة:</strong>
      </p>
      
      <div style="
        background: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #ddd;
        line-height: 1.6;
      ">
        ${message.replace(/\n/g, "<br>")}
      </div>
    </div>
  `,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
