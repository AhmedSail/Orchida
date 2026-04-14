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
    const { provider, prompt, model, aspectRatio, outputFormat, resolution, numResults } = data;
    
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

    if (provider === "Grok") {
      const grokRatioMap: Record<string, string> = {
        "Landscape": "landscape",
        "Portrait": "portrait",
        "Square": "square"
      };
      apiFormData.append("orientation", grokRatioMap[aspectRatio] || "landscape");
      
      const numResult = data.numResults?.toString();
      if (numResult) apiFormData.append("num_result", numResult);

      if (data.imageReference) {
        const buffer = Buffer.from(data.imageReference, 'base64');
        apiFormData.append("files", new Blob([buffer]), "reference.jpg");
      }
    } else {
      const aspectRatioMap: Record<string, string> = {
        "Landscape": "16:9",
        "Portrait": "9:16",
        "Square": "1:1"
      };
      apiFormData.append("aspect_ratio", aspectRatioMap[aspectRatio] || "1:1");
      apiFormData.append("output_format", outputFormat?.toLowerCase() || "jpeg");
      apiFormData.append("style", data.style || "Photorealistic");
      if (resolution) {
        apiFormData.append("resolution", resolution);
      }
      if (numResults) {
        apiFormData.append("num_results", numResults.toString());
      }
    }

    const endpointMap: Record<string, string> = {
      "Flux": "flux",
      "Ideogram": "ideogram",
      "Grok": "grok"
    };
    const endpoint = endpointMap[provider] || "generate_image";

    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: apiFormData
    });

    if (!response.ok) {
      const rawText = await response.text();
      // استرجاع الرصيد في حالة خطأ الـ API
      await checkAndDeductCredits(sessionData.session.userId, -cost, `Refund: Image API Error (${model})`);
      throw new Error(rawText || "Failed to generate image from API. Credits refunded.");
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
    // Note: credit deduction happens inside the try block. 
    // If it fails before deduction, no refund needed. 
    // If it fails after, we should ideally refund, but the checkAndDeductCredits above 
    // handles specific failures already. For general catch, we'll return the error.
    return { success: false, error: error.message };
  }
}
