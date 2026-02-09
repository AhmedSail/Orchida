import { db } from "@/src/db";
import { quizSessions, quizParticipants } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { emitToRoom } from "@/lib/socket-client";

// ✅ عدد غير محدود من المشاركين
// ✅ Real-time updates عبر Socket.io
// ✅ مجاني 100%

export async function POST(req: Request) {
  try {
    const { pin, nickname, realName, phone } = await req.json();

    if (!pin || !nickname || !realName || !phone) {
      return NextResponse.json(
        {
          error:
            "جميع الحقول مطلوبة (الرمز، الاسم المستعار، الاسم الحقيقي، رقم الهاتف)",
        },
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

    // ✅ تم إزالة فحص الحد الأقصى - عدد غير محدود!

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
        realName,
        phone,
        score: 0,
      })
      .returning();

    // 4. ✅ Emit real-time event via Socket.io
    const result = await emitToRoom(`session-${pin}`, "player-joined", {
      id: participant.id,
      nickname: participant.nickname,
      realName: participant.realName,
      phone: participant.phone,
      score: 0,
      totalTime: 0,
    });

    if (!result.success) {
      console.warn(
        "Socket.io emit failed (participant still joined):",
        result.error,
      );
    }

    return NextResponse.json({
      participantId: participant.id,
      message: "تم الانضمام بنجاح!",
    });
  } catch (error) {
    console.error("Error joining quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
