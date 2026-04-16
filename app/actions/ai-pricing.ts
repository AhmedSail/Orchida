"use server";

import { db } from "@/src/db";
import { aiServicePricing } from "@/src/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function getAiPricingAction(serviceType: "video" | "image", provider: string, quality: string, duration?: number) {
  try {
    let query = db.select()
      .from(aiServicePricing)
      .where(
        and(
          eq(aiServicePricing.serviceType, serviceType),
          eq(aiServicePricing.provider, provider),
          eq(aiServicePricing.quality, quality),
        )
      );

    if (duration !== undefined) {
      // Find exact or closest duration? The user wants different for durations.
      // If we have "Grok" "720p" "5s", we find it.
      // We can search for the exact match.
      const pricing = await db.select()
        .from(aiServicePricing)
        .where(
          and(
            eq(aiServicePricing.serviceType, serviceType),
            eq(aiServicePricing.provider, provider),
            eq(aiServicePricing.quality, quality),
            eq(aiServicePricing.duration, duration)
          )
        );
      
      if (pricing.length > 0) return pricing[0].credits;
      
      // Fallback: look for pricing with null duration (default)
      const defaultPricing = await db.select()
        .from(aiServicePricing)
        .where(
          and(
            eq(aiServicePricing.serviceType, serviceType),
            eq(aiServicePricing.provider, provider),
            eq(aiServicePricing.quality, quality),
          )
        );
      
      return defaultPricing.length > 0 ? defaultPricing[0].credits : null;
    }

    const pricing = await db.select()
        .from(aiServicePricing)
        .where(
          and(
            eq(aiServicePricing.serviceType, serviceType),
            // Use sql helper for case-insensitive if needed, but for simplicity let's assume exact match for now
            // or we can add a simple normalization here. 
            eq(aiServicePricing.provider, provider),
            eq(aiServicePricing.quality, quality)
          )
        );

    return pricing.length > 0 ? pricing[0].credits : null;
  } catch (error) {
    console.error("Error fetching AI pricing:", error);
    return null;
  }
}

export async function upsertAiPricingAction(data: {
  serviceType: "video" | "image";
  provider: string;
  quality: string;
  duration?: number;
  credits: number;
}) {
  try {
    const normalizedProvider = data.provider.trim();
    const normalizedQuality = data.quality.trim();
    const durationVal = data.duration ?? null;

    // Check if exists
    const existing = await db.select()
      .from(aiServicePricing)
      .where(
        and(
          eq(aiServicePricing.serviceType, data.serviceType),
          eq(aiServicePricing.provider, normalizedProvider),
          eq(aiServicePricing.quality, normalizedQuality),
          durationVal !== null 
            ? eq(aiServicePricing.duration, durationVal) 
            : isNull(aiServicePricing.duration)
        )
      );

    if (existing.length > 0) {
      await db.update(aiServicePricing)
        .set({ credits: data.credits, updatedAt: new Date() })
        .where(eq(aiServicePricing.id, existing[0].id));
    } else {
      await db.insert(aiServicePricing).values({
        serviceType: data.serviceType,
        provider: normalizedProvider,
        quality: normalizedQuality,
        duration: durationVal,
        credits: data.credits,
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error upserting AI pricing:", error);
    return { success: false, error: "Failed to save pricing" };
  }
}

export async function getAllAiPricingAction() {
    return await db.select().from(aiServicePricing).orderBy(aiServicePricing.serviceType, aiServicePricing.provider);
}

export async function deleteAiPricingAction(id: string) {
    await db.delete(aiServicePricing).where(eq(aiServicePricing.id, id));
    return { success: true };
}
