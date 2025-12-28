// 📍 src/app/api/courses/courseSections/meetings/[sectionId]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// ✅ جلب اللقاءات لشعبة معينة
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sectionId: string }> }
) {
  try {
    // الآن لازم تعمل await لأن params عبارة عن Promise
    const { sectionId } = await context.params;

    const result = await db
      .select()
      .from(meetings)
      .where(eq(meetings.sectionId, sectionId));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "❌ فشل في جلب اللقاءات" },
      { status: 500 }
    );
  }
}

// ✅ إضافة لقاء جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      courseId,
      sectionId,
      instructorId,
      meetingNumber,
      date,
      startTime,
      endTime,
      location,
      studentsCount,
      notes,
    } = body;

    await db.insert(meetings).values({
      id: crypto.randomUUID(),
      courseId,
      sectionId,
      instructorId,
      meetingNumber,
      date: new Date(date),
      startTime,
      endTime,
      location,
      studentsCount: studentsCount ?? 0,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inserting meeting:", error);
    return NextResponse.json(
      { error: "❌ فشل في إضافة اللقاء" },
      { status: 500 }
    );
  }
}
