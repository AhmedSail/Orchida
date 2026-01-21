import { db } from "@/src/db";
import { quizzes, quizQuestions, quizOptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
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
    const { title, description, coverImage, questions, userId } = body;

    // 1. Create Quiz
    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title,
        description,
        coverImage,
        creatorId: userId || session.user.id,
      })
      .returning();

    // 2. Insert Questions and Options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const [newQuestion] = await db
        .insert(quizQuestions)
        .values({
          quizId: newQuiz.id,
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

    return NextResponse.json(newQuiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get("instructorId");

    let query = db.select().from(quizzes);
    if (instructorId) {
      // @ts-ignore
      query = query.where(eq(quizzes.creatorId, instructorId));
    }

    const allQuizzes = await query.orderBy(quizzes.createdAt);
    return NextResponse.json(allQuizzes);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
