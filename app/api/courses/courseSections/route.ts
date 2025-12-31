import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { courseSections, users } from "@/src/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// ========== GET كل الشعب ==========
export async function GET() {
  try {
    const sections = await db.select().from(courseSections);
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الشعب" }, { status: 500 });
  }
}

// ========== POST إضافة شعبة ==========
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      redirect("/sign-in"); // لو مش مسجل دخول
    }

    // ✅ جلب بيانات المستخدم من DB
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const role = userRecord[0]?.role;

    const newSection = await db
      .insert(courseSections)
      .values({
        id: uuidv4(),
        status: role === "admin" ? "open" : "pending_approval", // ✅ الشرط
        ...body,
        startDate:
          body.startDate && body.startDate !== ""
            ? new Date(body.startDate)
            : null,
        endDate:
          body.endDate && body.endDate !== "" ? new Date(body.endDate) : null,
      })
      .returning();

    return NextResponse.json(newSection[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في إضافة الشعبة" }, { status: 500 });
  }
}
