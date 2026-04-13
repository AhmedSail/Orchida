"use server";

import { db } from "@/src/db";
import { userCredits, creditTransactions, aiGenerations, companies } from "@/src/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

// 2. دالة استرجاع الرصيد في حالة الفشل
export async function refundFailedTaskAction(cost: number, reason: string) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) return { success: false, error: "Unauthorized" };
    const safeCost = Math.ceil(Math.abs(Number(cost)));
    await checkAndDeductCredits(sessionData.session.userId, -safeCost, `Refund: ${reason.substring(0, 50)}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// 3. فحص حالة المهمة (Polling)
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
    return { success: true, data: await response.json() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. تحديث السجل المحلي
export async function updateGenerationStatusAction(taskUuid: string, status: "completed" | "failed", resultUrl?: string, thumbnailUrl?: string) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");

    await db.update(aiGenerations)
      .set({ 
        status, 
        resultUrl: resultUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        updatedAt: new Date()
      })
      .where(and(
        eq(aiGenerations.taskUuid, taskUuid),
        eq(aiGenerations.userId, sessionData.session.userId)
      ));

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 5. جلب السجل
export async function fetchGenerationHistoryAction(page = 1, pageSize = 12, type: "video" | "image" | "all" = "all") {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");
    const offset = (page - 1) * pageSize;
    let whereClause = eq(aiGenerations.userId, sessionData.session.userId);
    if (type !== "all") {
      whereClause = and(whereClause, eq(aiGenerations.type, type as any)) as any;
    }
    const list = await db.query.aiGenerations.findMany({
      where: whereClause,
      orderBy: [desc(aiGenerations.createdAt)],
      limit: pageSize,
      offset: offset,
    });
    return { success: true, data: list };
  } catch (error: any) {
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
