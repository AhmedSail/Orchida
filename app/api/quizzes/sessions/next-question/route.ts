import { db } from "@/src/db";
import { quizSessions, quizQuestions, quizOptions } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pin, questionIdx } = await req.json();

    // 1. Get session and quiz
    const quizSession = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.pin, pin),
      with: {
        quiz: {
          with: {
            questions: {
              with: {
                options: true,
              },
              orderBy: (questions, { asc }) => [asc(questions.order)],
            },
          },
        },
      },
    });

    if (!quizSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const question = quizSession.quiz.questions[questionIdx];
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    // 2. Update session status/current question if needed
    await db
      .update(quizSessions)
      .set({
        currentQuestionId: question.id,
        questionStartTime: new Date(),
        status: "in_progress", // Ensure status is in_progress
      })
      .where(eq(quizSessions.id, quizSession.id));

    // 3. Trigger pusher event with question data (WITHOUT isCorrect flag for players)
    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`session-${pin}`, "new-question", {
      id: question.id,
      text: question.text,
      type: question.type,
      mediaUrl: question.mediaUrl,
      mediaType: question.mediaType,
      timer: question.timer,
      options: question.options.map((o) => ({ id: o.id, text: o.text })), // Clean options for players
    });

    return NextResponse.json({ success: true, questionId: question.id });
  } catch (error) {
    console.error("Error pushing next question:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
