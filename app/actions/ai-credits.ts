"use server";

import { db } from "@/src/db";
import { userCredits, creditTransactions, aiServicePricing, companies } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth"; // Assuming better-auth setup
import { headers } from "next/headers";
import { getGeminiGenApiKey } from "./ai-common";

// ========================================================
// 1. الدالة الأولى: جلب رصيد الطالب الداخلي (قاعدة البيانات)
// ========================================================
export async function getStudentInternalCredits() {
  const sessionData = await auth.api.getSession({
    headers: await headers()
  });

  if (!sessionData?.session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = sessionData.session.userId;

  try {
    // محاولة جلب رصيد المستخدم
    let creditsRecord = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    });

    // إذا لم يكن لديه رصيد مسجل سابقاً، نقوم بإنشاء رصيد مبدئي له بقيمة الرصيد الترحيبي
    if (!creditsRecord) {
      // جلب قيمة الرصيد الترحيبي من الإعدادات أو استخدام 50 كافتراضي
      const welcomeBonusSetting = await db.query.aiServicePricing.findFirst({
        where: and(
          eq(aiServicePricing.serviceType, "config"),
          eq(aiServicePricing.provider, "welcome_bonus")
        )
      });
      
      const bonusAmount = welcomeBonusSetting?.credits ?? 50;

      const [newCredits] = await db.insert(userCredits).values({
        userId,
        balance: bonusAmount,
      }).returning();
      
      // توثيق الحركة
      await db.insert(creditTransactions).values({
        userId,
        amount: bonusAmount,
        description: "Welcome Bonus Credits",
      });

      creditsRecord = newCredits;
    }

    return { 
      success: true, 
      balance: creditsRecord.balance 
    };
  } catch (error) {
    console.error("Error fetching internal credits:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

// ========================================================
// 2. الدالة الثانية: جلب تفاصيل الرصيد من اشتراكك في موقع GeminiGen
// ========================================================
export async function getGeminiGenAccountAPI() {
  const apiKey = await getGeminiGenApiKey();

  if (!apiKey) {
    return { success: false, error: "Missing GeminiGen API Key" };
  }

  try {
    const response = await fetch("https://api.geminigen.ai/uapi/v1/account", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "x-api-key": apiKey
      },
      // لا نحتاج لعمل كاش لهذه الدالة لأن الرصيد يتغير باستمرار
      cache: "no-store" 
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        availableCredit: data.user_credit?.available_credit || 0,
        lockedCredit: data.user_credit?.locked_credit || 0,
        planId: data.plan_id,
        email: data.email,
        benefits: data.user_benefits || []
      }
    };
  } catch (error) {
    console.error("Error fetching GeminiGen API:", error);
    return { success: false, error: "Failed to fetch account info from GeminiGen." };
  }
}

// ========================================================
// 3. الدالة الثالثة: تحديث رصيد مستخدم (للمديرين)
// ========================================================
export async function updateUserCreditsAction(userId: string, amount: number, description: string) {
  try {
     const sessionData = await auth.api.getSession({
      headers: await headers()
    });

    // تأكد أن القائم بالعملية هو أدمن
    if (sessionData?.user?.role !== "admin") {
      return { success: false, error: "Only admins can manage credits" };
    }

    // 1. جلب السجل الحالي أو إنشاؤه
    let creditsRecord = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    });

    if (!creditsRecord) {
      await db.insert(userCredits).values({
        userId,
        balance: amount,
      });
    } else {
      await db.update(userCredits)
        .set({ 
          balance: creditsRecord.balance + amount,
          updatedAt: new Date()
        })
        .where(eq(userCredits.userId, userId));
    }

    // 2. توثيق الحركة
    await db.insert(creditTransactions).values({
      userId,
      amount,
      description: description || "Admin Manual adjustment",
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating credits:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

// ========================================================
// 4. الدالة الرابعة: جلب وتحديث الرصيد الترحيبي الافتراضي
// ========================================================
export async function getWelcomeBonusAction() {
  try {
    const setting = await db.query.aiServicePricing.findFirst({
      where: and(
        eq(aiServicePricing.serviceType, "config"),
        eq(aiServicePricing.provider, "welcome_bonus")
      )
    });
    return { success: true, amount: setting?.credits ?? 50 };
  } catch (error) {
    return { success: false, amount: 50 };
  }
}

export async function updateWelcomeBonusAction(amount: number) {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers()
    });

    if (sessionData?.user?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await db.query.aiServicePricing.findFirst({
      where: and(
        eq(aiServicePricing.serviceType, "config"),
        eq(aiServicePricing.provider, "welcome_bonus")
      )
    });

    if (existing) {
      await db.update(aiServicePricing)
        .set({ credits: amount, updatedAt: new Date() })
        .where(eq(aiServicePricing.id, existing.id));
    } else {
      await db.insert(aiServicePricing).values({
        serviceType: "config",
        provider: "welcome_bonus",
        quality: "system",
        credits: amount,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating welcome bonus:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getWhatsAppAction() {
  try {
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, "orchid-company"),
    });
    return { success: true, whatsappUrl: company?.whatsappUrl ?? "" };
  } catch (error) {
    return { success: false, whatsappUrl: "" };
  }
}

export async function updateGeminiGenApiKeyAction(apiKey: string) {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers()
    });

    if (sessionData?.user?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db.update(companies)
      .set({ geminiGenApiKey: apiKey, updatedAt: new Date() })
      .where(eq(companies.id, "orchid-company"));

    return { success: true };
  } catch (error) {
    console.error("Error updating GeminiGen API Key:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
