import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { aiPrompts } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session?.user ||
    (session.user.role !== "instructor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    await db.delete(aiPrompts).where(eq(aiPrompts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE AI Prompt Error:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session?.user ||
    (session.user.role !== "instructor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { title, prompt, imageUrl } = body;

    const updatedPrompt = await db
      .update(aiPrompts)
      .set({
        title,
        prompt,
        imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(aiPrompts.id, id))
      .returning();

    return NextResponse.json(updatedPrompt[0]);
  } catch (error) {
    console.error("PUT AI Prompt Error:", error);
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const prompt = await db
      .select()
      .from(aiPrompts)
      .where(eq(aiPrompts.id, id))
      .limit(1);

    if (prompt.length === 0) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    return NextResponse.json(prompt[0]);
  } catch (error) {
    console.error("GET AI Prompt Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 },
    );
  }
}
