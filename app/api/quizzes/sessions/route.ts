import { db } from "@/src/db";
import { quizSessions, quizzes, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function generatePIN() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    // Check auth FIRST before reading body
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Single query for user check
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { role: true },
    });

    if (!user || (user.role !== "admin" && user.role !== "instructor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // NOW read the body after auth is confirmed
    const { quizId, timeLimit } = await req.json();

    const pin = generatePIN();
    const [newSession] = await db
      .insert(quizSessions)
      .values({
        quizId,
        pin,
        hostId: session.user.id,
        status: "waiting",
        timeLimit: timeLimit || 0,
      })
      .returning({ pin: quizSessions.pin });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
