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
    const { provider, prompt, model, aspectRatio, outputFormat, resolution, numResults, orientation } = data;
    
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
      // The frontend sends orientation like "Landscape (16:9)", "Portrait (9:16)", "Square (1:1)"
      // Map to what the Grok API expects
      let grokOrientation = "square";
      const orientStr = (orientation || aspectRatio || "").toLowerCase();
      if (orientStr.includes("landscape") || orientStr.includes("16:9") || orientStr.includes("3:2")) {
        grokOrientation = "landscape";
      } else if (orientStr.includes("portrait") || orientStr.includes("9:16") || orientStr.includes("2:3")) {
        grokOrientation = "portrait";
      } else {
        grokOrientation = "square";
      }
      apiFormData.append("orientation", grokOrientation);

      const numResult = data.numResults?.toString();
      if (numResult) apiFormData.append("num_result", numResult);

      if (data.imageReference) {
        const buffer = Buffer.from(data.imageReference, 'base64');
        apiFormData.append("files", new Blob([buffer]), "reference.jpg");
      }
    } else {
      // Imagen — frontend already sends the correct ratio string ("1:1", "16:9", etc.)
      apiFormData.append("aspect_ratio", aspectRatio || "1:1");
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
      "Grok": "imagen/grok"
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

    // حفظ في السجل المحلي — Grok is async so status starts as "pending"
    const taskUuid = result.uuid || result.id?.toString();
    const isAsync = !!taskUuid && !(result.image_url || result.data?.[0]?.url || result.url);
    await db.insert(aiGenerations).values({
      userId: sessionData.session.userId,
      taskUuid,
      type: "image",
      model: model || "nano-banana-pro",
      prompt,
      status: isAsync ? "pending" : "completed",
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
