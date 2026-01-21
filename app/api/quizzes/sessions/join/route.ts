import { db } from "@/src/db";
import { quizSessions, quizParticipants } from "@/src/db/schema";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const { pin, nickname } = await req.json();

    if (!pin || !nickname) {
      return NextResponse.json(
        { error: "PIN and nickname are required" },
        { status: 400 },
      );
    }

    // 1. Find Session
    const session = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.pin, pin),
    });

    if (!session) {
      return NextResponse.json(
        { error: "رمز المسابقة غير صحيح" },
        { status: 404 },
      );
    }

    if (session.status === "finished") {
      return NextResponse.json({ error: "المسابقة انتهت" }, { status: 400 });
    }

    // 1.5 Check Max Capacity (100)
    const [pCount] = await db
      .select({ value: count(quizParticipants.id) })
      .from(quizParticipants)
      .where(eq(quizParticipants.sessionId, session.id));

    if (pCount.value >= 100) {
      return NextResponse.json(
        { error: "عذراً، اكتمل عدد المشاركين (100). المسابقة مغلقة." },
        { status: 400 },
      );
    }

    // 2. Check if nickname taken in this session
    const existing = await db.query.quizParticipants.findFirst({
      where: and(
        eq(quizParticipants.sessionId, session.id),
        eq(quizParticipants.nickname, nickname),
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "هذا الاسم مستخدم بالفعل، اختر اسماً آخر" },
        { status: 400 },
      );
    }

    // 3. Create Participant
    const [participant] = await db
      .insert(quizParticipants)
      .values({
        sessionId: session.id,
        nickname,
        score: 0,
      })
      .returning();

    // 4. Trigger real-time event
    await pusherServer.trigger(`session-${pin}`, "player-joined", {
      id: participant.id,
      nickname: participant.nickname,
    });

    return NextResponse.json({ participantId: participant.id });
  } catch (error) {
    console.error("Error joining quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
