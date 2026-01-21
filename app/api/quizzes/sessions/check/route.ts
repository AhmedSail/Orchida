import { db } from "@/src/db";
import { quizSessions } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin");

  if (!pin) {
    return NextResponse.json({ error: "PIN is required" }, { status: 400 });
  }

  try {
    const session = await db.query.quizSessions.findFirst({
      where: and(
        eq(quizSessions.pin, pin),
        // eq(quizSessions.status, "waiting"), // Removed restrictive check
      ),
    });

    if (!session) {
      return NextResponse.json({ error: "الرمز غير صحيح" }, { status: 404 });
    }

    if (session.status === "finished") {
      return NextResponse.json(
        { error: "هذه المسابقة انتهت" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, status: session.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
