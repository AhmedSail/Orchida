import { db } from "@/src/db";
import { quizParticipants, quizSessions, quizResponses } from "@/src/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
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
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const participants = await db
      .select({
        id: quizParticipants.id,
        nickname: quizParticipants.nickname,
        score: quizParticipants.score,
        status: quizParticipants.status,
        currentQuestionIndex: quizParticipants.currentQuestionIndex,
        userId: quizParticipants.userId,
        totalTime:
          sql<number>`COALESCE(SUM(${quizResponses.responseTime}), 0)`.mapWith(
            Number,
          ),
      })
      .from(quizParticipants)
      .leftJoin(
        quizResponses,
        eq(quizParticipants.id, quizResponses.participantId),
      )
      .where(eq(quizParticipants.sessionId, session.id))
      .groupBy(quizParticipants.id)
      .orderBy(
        desc(quizParticipants.score),
        asc(sql`SUM(${quizResponses.responseTime})`),
      );

    return NextResponse.json(participants);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
