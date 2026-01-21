import { db } from "@/src/db";
import { quizSessions, quizParticipants, quizQuestions } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const participantId = searchParams.get("participantId");

    if (!pin || !participantId) {
      return NextResponse.json(
        { error: "Missing pin or participantId" },
        { status: 400 },
      );
    }

    const participant = await db.query.quizParticipants.findFirst({
      where: and(
        eq(quizParticipants.id, participantId),
        eq(
          quizParticipants.sessionId,
          db
            .select({ id: quizSessions.id })
            .from(quizSessions)
            .where(eq(quizSessions.pin, pin)),
        ),
      ),
      with: {
        session: {
          with: {
            quiz: {
              with: {
                questions: {
                  with: { options: true },
                  orderBy: (questions, { asc }) => [asc(questions.order)],
                },
              },
            },
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 },
      );
    }

    if (participant.status === "eliminated") {
      return NextResponse.json({ status: "eliminated" });
    }

    if (participant.session.status !== "in_progress") {
      return NextResponse.json({ status: "waiting_host" });
    }

    const questions = participant.session.quiz.questions;
    const currentQ = questions[participant.currentQuestionIndex];

    if (!currentQ) {
      return NextResponse.json({ status: "finished" });
    }

    return NextResponse.json({
      status: "active",
      question: {
        id: currentQ.id,
        text: currentQ.text,
        type: currentQ.type,
        mediaUrl: currentQ.mediaUrl,
        mediaType: currentQ.mediaType,
        timer: currentQ.timer,
        options: currentQ.options.map((o) => ({ id: o.id, text: o.text })),
      },
      timeLimit: participant.session.timeLimit,
    });
  } catch (error) {
    console.error("Error fetching player question:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
