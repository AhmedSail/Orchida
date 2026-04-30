"use server";

import { db } from "@/src/db";
import { chatSettings, chatUsage, userCredits, creditTransactions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkAndDeductCredits } from "./ai-common";

// ── جلب إعدادات الشات ──────────────────────────────────────────────
export async function getChatSettingsAction() {
  try {
    const settings = await db.query.chatSettings.findFirst({
      where: eq(chatSettings.id, "global"),
    });
    // إذا ما فيه سجل نرجع الافتراضي
    return {
      success: true,
      freeMessages: settings?.freeMessages ?? 5,
      creditsPerMessage: settings?.creditsPerMessage ?? 2,
    };
  } catch (e: any) {
    return { success: false, freeMessages: 5, creditsPerMessage: 2 };
  }
}

// ── حفظ إعدادات الشات (admin) ──────────────────────────────────────
export async function saveChatSettingsAction(data: {
  freeMessages: number;
  creditsPerMessage: number;
}) {
  try {
    const existing = await db.query.chatSettings.findFirst({
      where: eq(chatSettings.id, "global"),
    });

    if (existing) {
      await db
        .update(chatSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(chatSettings.id, "global"));
    } else {
      await db.insert(chatSettings).values({
        id: "global",
        freeMessages: data.freeMessages,
        creditsPerMessage: data.creditsPerMessage,
      });
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── جلب استخدام المستخدم الحالي ────────────────────────────────────
export async function getChatUsageAction() {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) return { success: false, messageCount: 0 };

    const usage = await db.query.chatUsage.findFirst({
      where: eq(chatUsage.userId, sessionData.session.userId),
    });
    return { success: true, messageCount: usage?.messageCount ?? 0 };
  } catch (e: any) {
    return { success: false, messageCount: 0 };
  }
}

// ── فحص الرصيد وخصم الكريدت قبل كل رسالة ──────────────────────────
export async function consumeChatMessageAction() {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) {
      return { success: false, error: "Unauthorized" };
    }
    const userId = sessionData.session.userId;

    // جلب الإعدادات
    const settings = await db.query.chatSettings.findFirst({
      where: eq(chatSettings.id, "global"),
    });
    const freeLimit = settings?.freeMessages ?? 5;
    const costPerMsg = settings?.creditsPerMessage ?? 2;

    // جلب أو إنشاء سجل الاستخدام
    let usage = await db.query.chatUsage.findFirst({
      where: eq(chatUsage.userId, userId),
    });

    const currentCount = usage?.messageCount ?? 0;

    // هل لا يزال في المجاني؟
    if (currentCount < freeLimit) {
      // زيادة العداد فقط
      if (usage) {
        await db
          .update(chatUsage)
          .set({ messageCount: currentCount + 1, updatedAt: new Date() })
          .where(eq(chatUsage.userId, userId));
      } else {
        await db.insert(chatUsage).values({ userId, messageCount: 1 });
      }
      return {
        success: true,
        wasFree: true,
        remaining: freeLimit - currentCount - 1,
        newCount: currentCount + 1,
      };
    }

    // انتهى المجاني — خصم كريدت
    if (costPerMsg <= 0) {
      // المسؤول جعل الكريدت 0 بعد المجاني أيضاً
      await db
        .update(chatUsage)
        .set({ messageCount: currentCount + 1, updatedAt: new Date() })
        .where(eq(chatUsage.userId, userId));
      return { success: true, wasFree: false, newCount: currentCount + 1 };
    }

    // تحقق من الرصيد
    const creditsRecord = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    });

    if (!creditsRecord || creditsRecord.balance < costPerMsg) {
      return {
        success: false,
        error: `رصيدك غير كافٍ. كل رسالة تكلّف ${costPerMsg} كريدت.`,
        needsCredits: true,
      };
    }

    // خصم الكريدت
    await db
      .update(userCredits)
      .set({ balance: creditsRecord.balance - costPerMsg })
      .where(eq(userCredits.userId, userId));

    await db.insert(creditTransactions).values({
      userId,
      amount: -costPerMsg,
      description: `Chat message (GPT-4o)`,
    });

    // تحديث العداد
    if (usage) {
      await db
        .update(chatUsage)
        .set({ messageCount: currentCount + 1, updatedAt: new Date() })
        .where(eq(chatUsage.userId, userId));
    } else {
      await db.insert(chatUsage).values({ userId, messageCount: 1 });
    }

    return {
      success: true,
      wasFree: false,
      creditDeducted: costPerMsg,
      newBalance: creditsRecord.balance - costPerMsg,
      newCount: currentCount + 1,
    };
  } catch (e: any) {
    console.error("consumeChatMessageAction error:", e);
    return { success: false, error: e.message };
  }
}

export async function refundChatMessageAction(reason: string) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) return { success: false, error: "Unauthorized" };

    const userId = sessionData.session.userId;
    const settings = await db.query.chatSettings.findFirst();
    const costPerMsg = settings?.creditsPerMessage || 2;

    await checkAndDeductCredits(userId, -costPerMsg, `Refund Chat: ${reason.substring(0, 50)}`);

    // تقليل العداد
    const usage = await db.query.chatUsage.findFirst({
      where: eq(chatUsage.userId, userId),
    });
    if (usage && usage.messageCount > 0) {
      await db.update(chatUsage)
        .set({ messageCount: usage.messageCount - 1 })
        .where(eq(chatUsage.userId, userId));
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
