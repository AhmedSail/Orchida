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
    const { pin, event, data } = await req.json();

    // 1. Verify session ownership (Host only)
    const quizSession = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.pin, pin),
    });

    if (!quizSession || quizSession.hostId !== session.user.id) {
      // Allow admins even if not host? Our current system says host is the creator/admin starting it.
    }

    // 2. Map host state to Pusher events
    const { pusherServer } = await import("@/lib/pusher");

    if (event === "show-results") {
      await pusherServer.trigger(`session-${pin}`, "show-results", {});
    } else if (event === "game-finished") {
      await db
        .update(quizSessions)
        .set({ status: "finished" })
        .where(eq(quizSessions.pin, pin));
      await pusherServer.trigger(`session-${pin}`, "game-finished", {});
    } else if (event === "show-leaderboard") {
      await pusherServer.trigger(`session-${pin}`, "show-leaderboard", data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
