"use server";

import { db } from "@/src/db";
import { userCredits, creditTransactions, aiGenerations, companies } from "@/src/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadFromUrl } from "@/lib/r2-server";

import { API_BASE } from "./ai-constants";

export async function getGeminiGenApiKey() {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, "orchid-company"),
    columns: { geminiGenApiKey: true }
  });
  return company?.geminiGenApiKey || process.env.GEMINIGEN_API_KEY;
}

// 1. دالة فحص وتحديث الرصيد الداخلي
export async function checkAndDeductCredits(userId: string, cost: number, description: string) {
  if (cost === 0) {
    // إذا كان التكلفة 0، لا داعي للقيام بأي عملية
    return;
  }

  const creditsRecord = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  });

  if (!creditsRecord || creditsRecord.balance < cost) {
    throw new Error("عذراً، رصيدك غير كافٍ. يرجى شحن الأرصدة.");
  }

  await db.update(userCredits)
    .set({ balance: creditsRecord.balance - cost })
    .where(eq(userCredits.userId, userId));

  await db.insert(creditTransactions).values({
    userId,
    amount: -cost,
    description,
  });
}

// 2. دالة استرجاع الرصيد في حالة الفشل (النسخة الداخلية للاستخدام في الخلفية أو الـ Cron)
export async function internalRefundFailedTask(taskUuid: string, userId: string, reason: string) {
  // Find the original generation record to get the exact cost
  const record = await db.query.aiGenerations.findFirst({
    where: and(
      eq(aiGenerations.taskUuid, taskUuid),
      eq(aiGenerations.userId, userId)
    )
  });

  if (!record) return { success: false, error: "Record not found" };
  if (record.isRefunded) return { success: true, message: "Already refunded" };

  const cost = record.creditCost || 0;
  if (cost <= 0) {
     await db.update(aiGenerations).set({ isRefunded: true }).where(eq(aiGenerations.id, record.id));
     return { success: true };
  }

  // Refund the exact amount recorded in DB
  await checkAndDeductCredits(userId, -cost, `Refund: ${reason.substring(0, 50)}`);

  // Mark as refunded to prevent double refunds
  await db.update(aiGenerations)
    .set({ isRefunded: true, updatedAt: new Date() })
    .where(eq(aiGenerations.id, record.id));

  return { success: true };
}

// دالة استرجاع الرصيد في حالة الفشل (للاستدعاء من قبل المستخدم)
export async function refundFailedTaskAction(taskUuid: string, reason: string) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) return { success: false, error: "Unauthorized" };

    return await internalRefundFailedTask(taskUuid, sessionData.session.userId, reason);
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// 3. فحص حالة المهمة (Polling من السيرفر الخارجي)
export async function checkGenerationStatus(uuid: string) {
  try {
    const apiKey = await getGeminiGenApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const response = await fetch(`${API_BASE}/history/${uuid}`, {
      method: "GET",
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Error fetching status");
    const json = await response.json();
    // لوج كامل لفهم بنية البيانات
    console.log(`[checkGenerationStatus] UUID: ${uuid}`);
    console.log(`[checkGenerationStatus] Full Response:`, JSON.stringify(json, null, 2));
    return { success: true, data: json };
  } catch (error: any) {
    console.error(`[checkGenerationStatus] Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// 3.1 فحص حالة المهمة من قاعدة البيانات المحلية (أكثر دقة مع الـ Webhook)
export async function getInternalStatusAction(taskUuid: string) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");

    const record = await db.query.aiGenerations.findFirst({
      where: and(
        eq(aiGenerations.taskUuid, taskUuid),
        eq(aiGenerations.userId, sessionData.session.userId)
      )
    });

    if (!record) return { success: false, error: "Record not found" };

    return { 
      success: true, 
      status: record.status, 
      resultUrl: record.resultUrl,
      resultsJson: record.resultsJson,
      thumbnailUrl: record.thumbnailUrl
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. تحديث السجل المحلي (النسخة الداخلية للاستخدام في الخلفية أو الـ Cron)
export async function internalUpdateGenerationStatus(
  taskUuid: string, 
  userId: string,
  status: "completed" | "failed", 
  resultUrl?: string, 
  thumbnailUrl?: string,
  resultsJson?: string
) {
  let finalResultUrl = resultUrl;
  let finalThumbnailUrl = thumbnailUrl;
  let finalResultsJson = resultsJson;

  // 1. رفع للسحابة (R2)
  if (resultsJson) {
    try {
      const urls: string[] = JSON.parse(resultsJson);
      if (Array.isArray(urls) && urls.length > 0) {
        const cloudUrls = await Promise.all(
          urls.map(u => uploadFromUrl(u, "ai-temp"))
        );
        const filtered = cloudUrls.filter(u => u !== null) as string[];
        if (filtered.length > 0) {
          finalResultsJson = JSON.stringify(filtered);
          finalResultUrl = filtered[0]; // أول رابط = الرابط الرئيسي
        }
      }
    } catch (e) {
      console.error("Error processing resultsJson for cloud upload:", e);
    }
  } else if (resultUrl) {
    // صورة واحدة فقط
    const cloudUrl = await uploadFromUrl(resultUrl, "ai-temp");
    if (cloudUrl) finalResultUrl = cloudUrl;
  }

  if (thumbnailUrl) {
    const cloudThumb = await uploadFromUrl(thumbnailUrl, "ai-temp");
    if (cloudThumb) finalThumbnailUrl = cloudThumb;
  }

  await db.update(aiGenerations)
    .set({ 
      status, 
      resultUrl: finalResultUrl || null,
      thumbnailUrl: finalThumbnailUrl || null,
      resultsJson: finalResultsJson || null,
      updatedAt: new Date()
    })
    .where(and(
      eq(aiGenerations.taskUuid, taskUuid),
      eq(aiGenerations.userId, userId)
    ));

  return { 
    success: true, 
    finalResultUrl: finalResultUrl || null,
    finalThumbnailUrl: finalThumbnailUrl || null,
    finalResultsJson: finalResultsJson || null,
  };
}

// تحديث السجل المحلي (للاستدعاء من قبل المستخدم)
export async function updateGenerationStatusAction(
  taskUuid: string, 
  status: "completed" | "failed", 
  resultUrl?: string, 
  thumbnailUrl?: string,
  resultsJson?: string
) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");

    return await internalUpdateGenerationStatus(
      taskUuid, 
      sessionData.session.userId, 
      status, 
      resultUrl, 
      thumbnailUrl, 
      resultsJson
    );
  } catch (error: any) {
    console.error("updateGenerationStatus error:", error);
    return { success: false, error: error.message };
  }
}

// 5. جلب السجل
export async function fetchGenerationHistoryAction(page = 1, pageSize = 20, type: "video" | "image" | "all" = "all") {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");

    const userId = sessionData.session.userId;
    const offset = (page - 1) * pageSize;

    // Direct select only required columns for faster speed
    const list = await db.select({
      id: aiGenerations.id,
      taskUuid: aiGenerations.taskUuid,
      type: aiGenerations.type,
      model: aiGenerations.model,
      prompt: aiGenerations.prompt,
      status: aiGenerations.status,
      resultUrl: aiGenerations.resultUrl,
      resultsJson: aiGenerations.resultsJson,
      thumbnailUrl: aiGenerations.thumbnailUrl,
      resolution: aiGenerations.resolution,
      duration: aiGenerations.duration,
      createdAt: aiGenerations.createdAt,
    })
      .from(aiGenerations)
      .where(
        and(
          eq(aiGenerations.userId, userId),
          type !== "all" ? eq(aiGenerations.type, type as any) : undefined
        )
      )
      .orderBy(desc(aiGenerations.createdAt))
      .limit(pageSize)
      .offset(offset);
      
    return { success: true, data: list, hasMore: list.length === pageSize };
  } catch (error: any) {
    console.error("Fetch History Error:", error);
    return { success: false, error: error.message };
  }
}
// 6. حذف سجل
export async function deleteGenerationAction(id: string) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");

    await db.delete(aiGenerations)
      .where(and(
        eq(aiGenerations.id, id as any),
        eq(aiGenerations.userId, sessionData.session.userId)
      ));

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 7. تحسين الوصف (ترجمة وتوسيع)
export async function enhancePromptAction(prompt: string, type: "video" | "image" = "video") {
  try {
    const apiKey = await getGeminiGenApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const systemInstruction = `You are an expert AI Prompt Engineer. 
    Translate the user's input to English if it's in another language. 
    Then, expand it into a detailed, professional ${type} generation prompt. 
    Add keywords for high quality: cinematic, 4k, hyper-realistic, detailed textures, professional lighting. 
    Keep the core meaning but make it descriptive. 
    Return ONLY the final English prompt text.`;

    const response = await fetch(`https://api.geminigen.ai/uapi/v1/chat/gemini`, {
      method: "POST",
      headers: { 
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        model: "gemini-1.5-flash"
      })
    });

    if (!response.ok) throw new Error("Enhancement failed");
    const result = await response.json();
    return { success: true, enhancedPrompt: result.choices[0].message.content.trim() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
