import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { aiGenerations } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// تذكر وضع المفتاح العام في ملف .env أو كمتغير بيئة
// GEMINIGEN_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // التحقق من التوقيع (اختياري ولكن ينصح به بشدة للأمان)
    // const isValid = verifySignature(bodyText, signature);
    // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 403 });

    const payload = JSON.parse(bodyText);
    const { event, data } = payload;

    console.log(`[Webhook] Received event: ${event} for UUID: ${data.uuid}`);

    // تحديث حالة الطلب في قاعدة البيانات
    if (event === "VIDEO_GENERATION_COMPLETED" || event === "IMAGE_GENERATION_COMPLETED") {
      await db.update(aiGenerations)
        .set({
          status: "completed",
          resultUrl: data.media_url,
          thumbnailUrl: data.thumbnail_url || null,
          updatedAt: new Date()
        })
        .where(eq(aiGenerations.taskUuid, data.uuid));
    } else if (event === "VIDEO_GENERATION_FAILED" || event === "IMAGE_GENERATION_FAILED") {
      await db.update(aiGenerations)
        .set({
          status: "failed",
          updatedAt: new Date()
        })
        .where(eq(aiGenerations.taskUuid, data.uuid));
        
      // ملاحظة: يمكنك هنا إضافة منطق لإعادة الكريديت للمستخدم تلقائياً إذا فشل الطلب
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * دالة التحقق من التوقيع بناءً على توثيق GeminiGen
 */
function verifySignature(body: string, signatureHex: string): boolean {
  try {
    const publicKey = process.env.GEMINIGEN_PUBLIC_KEY;
    if (!publicKey) return true; // إذا لم يتم ضبط المفتاح، نتجاوز التحقق (للتبسيط مؤقتاً)

    const signature = Buffer.from(signatureHex, "hex");
    
    // بناءً على التوثيق: يتم عمل MD5 للجسم أولاً
    const md5Hash = crypto.createHash("md5").update(body).digest();

    // التحقق باستخدام RSA-SHA256
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(md5Hash);
    
    return verifier.verify(publicKey, signature);
  } catch (e) {
    console.error("Signature verification failed:", e);
    return false;
  }
}
