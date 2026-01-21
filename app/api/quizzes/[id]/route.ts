import { db } from "@/src/db";
import { quizzes, quizQuestions, quizOptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Robust role check from DB
  const { users } = await import("@/src/db/schema");
  const userFromDb = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!userFromDb || userFromDb.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 },
    );
  }

  try {
    await db.delete(quizzes).where(eq(quizzes.id, params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Robust role check from DB
  const { users } = await import("@/src/db/schema");
  const userFromDb = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!userFromDb || userFromDb.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const { title, description, coverImage, questions } = body;

    // 1. Update Quiz details
    await db
      .update(quizzes)
      .set({
        title,
        description,
        coverImage,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, params.id));

    // 2. Simplest way to update questions: Delete and Re-insert (for small quizzes)
    // Or deep update. Let's do delete-insert for now for simplicity in MVP.
    // WARNING: This deletes history if questions IDs change, but for quiz editing it's usually fine.
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, params.id));

    // 3. Re-insert questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const [newQuestion] = await db
        .insert(quizQuestions)
        .values({
          quizId: params.id,
          text: q.text,
          type: q.type,
          mediaUrl: q.mediaUrl,
          mediaType: q.mediaType,
          timer: q.timer,
          points: q.points,
          order: i,
        })
        .returning();

      if (q.options && q.options.length > 0) {
        await db.insert(quizOptions).values(
          q.options.map((o: any) => ({
            questionId: newQuestion.id,
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, params.id),
      with: {
        questions: {
          with: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
