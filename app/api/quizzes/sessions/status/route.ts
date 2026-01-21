import { db } from "@/src/db";
import { quizSessions, quizQuestions, quizOptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin");

  if (!pin) {
    return NextResponse.json({ error: "PIN is required" }, { status: 400 });
  }

  try {
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.pin, pin),
      with: {
        quiz: {
          with: {
            questions: {
              with: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Find current question details if active
    let currentQuestion = null;
    if (session.currentQuestionId) {
      const q = session.quiz.questions.find(
        (q) => q.id === session.currentQuestionId,
      );
      if (q) {
        currentQuestion = {
          id: q.id,
          text: q.text,
          type: q.type,
          mediaUrl: q.mediaUrl,
          mediaType: q.mediaType,
          timer: q.timer,
          options: q.options.map((o) => ({ id: o.id, text: o.text })), // Clean for players
        };
      }
    }

    return NextResponse.json({
      status: session.status,
      currentQuestionId: session.currentQuestionId,
      currentQuestion,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
