"use server";

import { db } from "@/src/db";
import { aiPromptsLibrary } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// 1. Get Prompts by Type (Public or Admin)
export async function getPromptsByTypeAction(type: "image" | "video") {
  try {
    const prompts = await db
      .select()
      .from(aiPromptsLibrary)
      .where(eq(aiPromptsLibrary.type, type))
      .orderBy(desc(aiPromptsLibrary.createdAt));

    return { success: true, data: prompts };
  } catch (error: any) {
    console.error("Error fetching prompts:", error);
    return { success: false, error: "Failed to fetch prompts" };
  }
}

// 2. Create/Add a Prompt (Admin Only)
export async function createPromptAction(data: {
  type: "image" | "video";
  title?: string;
  promptText: string;
  mediaUrl: string;
  category?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const newPrompt = await db.insert(aiPromptsLibrary).values({
      type: data.type,
      title: data.title,
      promptText: data.promptText,
      mediaUrl: data.mediaUrl,
      category: data.category,
    }).returning();

    revalidatePath("/ai/photo-prompts");
    revalidatePath("/ai/video-prompts");
    revalidatePath("/admin/ai-prompts"); // Assuming we'll make an admin page

    return { success: true, data: newPrompt[0] };
  } catch (error: any) {
    console.error("Error creating prompt:", error);
    return { success: false, error: "Failed to create prompt" };
  }
}

// 3. Delete a Prompt (Admin Only)
export async function deletePromptAction(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db.delete(aiPromptsLibrary).where(eq(aiPromptsLibrary.id, id));

    revalidatePath("/ai/photo-prompts");
    revalidatePath("/ai/video-prompts");
    revalidatePath("/admin/ai-prompts");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting prompt:", error);
    return { success: false, error: "Failed to delete prompt" };
  }
}

// 4. Update a Prompt (Admin Only)
export async function updatePromptAction(
  id: string,
  data: {
    type: "image" | "video";
    title?: string;
    promptText: string;
    mediaUrl: string;
    category?: string;
  }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const updatedPrompt = await db
      .update(aiPromptsLibrary)
      .set({
        type: data.type,
        title: data.title,
        promptText: data.promptText,
        mediaUrl: data.mediaUrl,
        category: data.category,
      })
      .where(eq(aiPromptsLibrary.id, id))
      .returning();

    revalidatePath("/ai/photo-prompts");
    revalidatePath("/ai/video-prompts");
    revalidatePath("/admin/ai-prompts");

    return { success: true, data: updatedPrompt[0] };
  } catch (error: any) {
    console.error("Error updating prompt:", error);
    return { success: false, error: "Failed to update prompt" };
  }
}
