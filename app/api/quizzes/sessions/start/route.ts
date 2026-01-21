import { db } from "@/src/db";
import { quizSessions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pin } = await req.json();

    await db
      .update(quizSessions)
      .set({
        status: "in_progress",
        questionStartTime: new Date(), // Start time of the whole quiz
      })
      .where(eq(quizSessions.pin, pin));

    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`session-${pin}`, "game-started", {});

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
