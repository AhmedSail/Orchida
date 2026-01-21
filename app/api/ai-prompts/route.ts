import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { aiPrompts } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId");

  if (!sectionId) {
    return NextResponse.json(
      { error: "sectionId is required" },
      { status: 400 },
    );
  }

  try {
    const prompts = await db
      .select()
      .from(aiPrompts)
      .where(eq(aiPrompts.sectionId, sectionId))
      .orderBy(desc(aiPrompts.createdAt));

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("GET AI Prompts Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session?.user ||
    (session.user.role !== "instructor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sectionId, title, prompt, imageUrl } = body;

    if (!sectionId || !title || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newPrompt = await db
      .insert(aiPrompts)
      .values({
        id: uuidv4(),
        sectionId,
        title,
        prompt,
        imageUrl,
      })
      .returning();

    return NextResponse.json(newPrompt[0]);
  } catch (error) {
    console.error("POST AI Prompt Error:", error);
    return NextResponse.json(
      { error: "Failed to add prompt" },
      { status: 500 },
    );
  }
}
