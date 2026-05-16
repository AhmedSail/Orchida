"use server";

import { db } from "@/src/db";
import { aiGenerations } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkAndDeductCredits, getGeminiGenApiKey } from "./ai-common";
import { API_BASE } from "./ai-constants";
import { getAiPricingAction } from "./ai-pricing";


export async function generateVideoAction(clientFormData: FormData) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");

    const provider = clientFormData.get("provider") as string;
    const model = clientFormData.get("model") as string;
    const prompt = clientFormData.get("prompt") as string;
    const durationStr = clientFormData.get("duration") as string;
    const resolution = clientFormData.get("resolution") as string;
    const aspectRatio = clientFormData.get("aspectRatio") as string;
    const duration = parseInt(durationStr) || 0;

    // Fetch dynamic cost from DB
    const safeResolution = resolution || "480p";
    const resQuality = safeResolution.includes("720") ? "720p" : safeResolution.includes("1080") ? "1080p" : "480p";
    
    // إذا تم إرسال تكلفة 0 من الواجهة (FreeTrial)، نعتمدها مباشرة
    const clientCost = clientFormData.get("cost");
    let cost = 0;
    
    if (clientCost === "0") {
      cost = 0;
    } else {
      const dynamicCost = await getAiPricingAction("video", provider, resQuality, duration);
      cost = dynamicCost !== null ? dynamicCost : Math.ceil(Number(clientCost) || 5);
    }

    if (cost > 0) {
      await checkAndDeductCredits(sessionData.session.userId, cost, `Video Generation: ${provider} (${resQuality}, ${duration}s)`);
    }


    const apiKey = await getGeminiGenApiKey();
    if (!apiKey) throw new Error("API Key configuration error.");

    const endpointMap: Record<string, string> = {
      "Veo": "veo",
      "Grok": "grok",
      "Sora": "sora",
      "Bytedance": "seedance"
    };
    
    const endpointProvider = endpointMap[provider] || (provider ? provider.toLowerCase() : "veo");

    const apiFormData = new FormData();
    apiFormData.append("prompt", prompt);
    apiFormData.append("model", model || `${endpointProvider}-2`);
    
    const numResults = clientFormData.get("numResults");
    if (numResults) {
      apiFormData.append("num_results", numResults);
    }
    
    if (resolution) {
      const safeRes = resolution || "480p";
      apiFormData.append("resolution", safeRes.includes("720") ? "720p" : safeRes.includes("1080") ? "1080p" : "480p");
    }
    
    if (duration > 0) {
      apiFormData.append("duration", duration.toString());
      apiFormData.append("video_duration", duration.toString()); // Some providers use this name
    }
    
    if (provider === "Grok") {
      const grokRatioMap: Record<string, string> = {
        "Landscape (16:9)": "landscape",
        "Portrait (9:16)": "portrait",
        "Square (1:1)": "square",
        "Vertical (2:3)": "vertical",
        "Horizontal (3:2)": "horizontal"
      };
      if (aspectRatio) {
        apiFormData.append("aspect_ratio", grokRatioMap[aspectRatio] || "landscape");
      }
      apiFormData.append("mode", clientFormData.get("mode") as string || "custom");
    } else {
      const aspectRatioMap: Record<string, string> = {
        "Landscape (16:9)": "16:9", "Portrait (9:16)": "9:16", "Square (1:1)": "1:1", "Vertical (2:3)": "2:3", "Horizontal (3:2)": "3:2"
      };
      if (aspectRatio) {
         apiFormData.append("aspect_ratio", aspectRatioMap[aspectRatio] || "16:9");
      }
    }

    if (endpointProvider === "veo") {
      const firstImage = clientFormData.get("firstImage") as File;
      const lastImage = clientFormData.get("lastImage") as File;
      
      if (firstImage && firstImage.size > 0) apiFormData.append("ref_images", firstImage);
      if (lastImage && lastImage.size > 0) apiFormData.append("ref_images", lastImage);
      
      apiFormData.append("mode_image", "frame");
    } else if (endpointProvider === "grok") {
      const grokImage = clientFormData.get("image") as File;
      if (grokImage && grokImage.size > 0) apiFormData.append("files", grokImage);
    }

    console.log(`[AI Video Action] Outgoing Request:`, {
      provider: endpointProvider,
      model: apiFormData.get("model"),
      duration: apiFormData.get("duration"),
      resolution: apiFormData.get("resolution")
    });

    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

    try {
      response = await fetch(`${API_BASE}/video-gen/${endpointProvider}`, {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: apiFormData,
        signal: controller.signal
      });
    } catch (networkError: any) {
      if (networkError.name === 'AbortError') {
        await checkAndDeductCredits(sessionData.session.userId, -cost, `Refund: Timeout Error (${provider})`);
        throw new Error("استغرقت العملية وقتاً طويلاً من خادم الفيديو. تم إعادة الرصيد، يرجى المحاولة لاحقاً.");
      }
      await checkAndDeductCredits(sessionData.session.userId, -cost, `Refund: Network Error (${provider})`);
      throw new Error("فشل الاتصال بخادم الـ AI. تم إعادة الرصيد بأمان.");
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const rawText = await response.text();
      await checkAndDeductCredits(sessionData.session.userId, -cost, `Refund: GeminiGen API Error (${provider})`);
      throw new Error(`AI Video Generation Error: ${rawText || response.statusText}. Your credits have been refunded.`);
    }

    const result = await response.json();
    console.log("[GeminiGen API Response]:", result);

    const taskUuid = result.uuid || result.id?.toString() || result.data?.uuid || result.data?.id?.toString();

    if (!taskUuid) {
      console.error("[Error] Could not find task UUID/ID in response:", result);
      if (cost > 0) {
        await checkAndDeductCredits(sessionData.session.userId, -cost, `Refund: Invalid API Response (${provider})`);
      }
      throw new Error("فشل السيرفر في إصدار رقم للمهمة. تم إعادة الرصيد.");
    }

    await db.insert(aiGenerations).values({
      userId: sessionData.session.userId,
      taskUuid: taskUuid,
      type: "video",
      provider,
      model: model || `${endpointProvider}-2`,
      prompt,
      status: "pending",
      resolution,
      duration: parseInt(durationStr) || 0,
      creditCost: cost,
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
