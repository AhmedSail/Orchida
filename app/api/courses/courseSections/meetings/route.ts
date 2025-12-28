// 📍 src/app/api/courses/courseSections/meetings/[sectionId]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";
import { eq } from "drizzle-orm";

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
