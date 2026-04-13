"use server";

import { db } from "@/src/db";
import { aiGenerations } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkAndDeductCredits, getGeminiGenApiKey } from "./ai-common";
import { API_BASE } from "./ai-constants";
import { getAiPricingAction } from "./ai-pricing";


export async function generateImageAction(formDataStringBase64: string) {
  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.session?.userId) throw new Error("Unauthorized");

    const data = JSON.parse(Buffer.from(formDataStringBase64, 'base64').toString('utf8'));
    const { prompt, model, aspectRatio, outputFormat, resolution, numResults } = data;
    
    // Fetch dynamic cost from DB
    const resQuality = resolution || "Standard";
    const dynamicCost = await getAiPricingAction("image", model || "nano-banana-pro", resQuality);
    const cost = dynamicCost !== null ? dynamicCost : Math.ceil(Number(data.cost) || 2);
    
    // الخصم من الرصيد
    await checkAndDeductCredits(sessionData.session.userId, cost, `Image Generation: ${model} (${resQuality})`);


    const apiKey = await getGeminiGenApiKey();
    if (!apiKey) throw new Error("API Key configuration error.");

    const apiFormData = new FormData();
    apiFormData.append("prompt", prompt);
    apiFormData.append("model", model || "nano-banana-pro");

    // منطق فائق البساطة: فقط الموديلات الرسمية هي التي تأخذ باراميترات إضافية
    const officialModels = ["nano-banana-pro", "nano-banana-2", "imagen-4"];
    const isOfficialModel = officialModels.includes(model);

    if (isOfficialModel) {
      apiFormData.append("aspect_ratio", aspectRatio || "1:1");
      apiFormData.append("output_format", outputFormat?.toLowerCase() || "jpeg");
      apiFormData.append("style", data.style || "Photorealistic");
      if (resolution) {
        apiFormData.append("resolution", resolution);
      }
    }

    // لا نرسل num_results أيضاً إلا للموديلات الرسمية إذا دعمتها
    if (isOfficialModel && numResults) {
      apiFormData.append("num_results", numResults.toString());
    }

    const response = await fetch(`${API_BASE}/generate_image`, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: apiFormData
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Failed to generate image from API");
    }

    const result = await response.json();

    // حفظ في السجل المحلي
    await db.insert(aiGenerations).values({
      userId: sessionData.session.userId,
      taskUuid: result.uuid || result.id?.toString(),
      type: "image",
      model: model || "nano-banana-pro",
      prompt,
      status: "completed",
      resultUrl: result.image_url || result.data?.[0]?.url || result.url,
      creditCost: cost,
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
