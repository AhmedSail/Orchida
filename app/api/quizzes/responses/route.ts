import { db } from "@/src/db";
import {
  quizResponses,
  quizParticipants,
  quizSessions,
  quizOptions,
  quizQuestions,
} from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pin, participantId, questionId, optionId, responseTime } =
      await req.json();

    // 1. Verify session is in_progress
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.pin, pin),
    });

    if (!session || session.status !== "in_progress") {
      return NextResponse.json(
        {
          error:
            "Game session is not in progress (Status: " + session?.status + ")",
        },
        { status: 400 },
      );
    }

    // 2. Check if participant already answered this question
    const existing = await db.query.quizResponses.findFirst({
      where: and(
        eq(quizResponses.participantId, participantId),
        eq(quizResponses.questionId, questionId),
      ),
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Duplicate submission: You have already answered this question.",
        },
        { status: 400 },
      );
    }

    // 3. Check correctness and fetch points
    const [option] = await db
      .select()
      .from(quizOptions)
      .where(eq(quizOptions.id, optionId));
    const [question] = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, questionId));

    if (!option || !question) {
      return NextResponse.json(
        { error: "Invalid question or option" },
        { status: 400 },
      );
    }

    const isCorrect = option.isCorrect;

    // Calculate points: Speed bonus (simple linear decay for MVP)
    // score = base_points * (1 - (responseTime / timer) * 0.5) if correct
    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = 1;
    }

    // 4. Save response
    const [response] = await db
      .insert(quizResponses)
      .values({
        sessionId: session.id,
        participantId,
        questionId,
        optionId,
        isCorrect,
        pointsEarned,
        responseTime,
      })
      .returning();

    // 5. Update participant logic (Survival Mode)
    let updateData: any = {};
    if (isCorrect) {
      updateData = {
        score: sql`${quizParticipants.score} + ${pointsEarned}`,
        currentQuestionIndex: sql`${quizParticipants.currentQuestionIndex} + 1`,
      };
    } else {
      updateData = {
        status: "eliminated",
      };
    }

    await db
      .update(quizParticipants)
      .set(updateData)
      .where(eq(quizParticipants.id, participantId));

    // 6. Trigger pusher event to host
    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`session-${pin}`, "answer-submitted", {
      participantId,
      questionId,
      pointsEarned,
      isCorrect,
      responseTime,
      status: isCorrect ? "active" : "eliminated",
    });

    return NextResponse.json({
      ...response,
      status: isCorrect ? "correct" : "eliminated",
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
