import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "❌ يجب إرسال مصفوفة لقاءات" },
        { status: 400 }
      );
    }

    // تجهيز البيانات للإدخال
    const values = body.map((m) => ({
      id: crypto.randomUUID(),
      courseId: m.courseId,
      sectionId: m.sectionId,
      instructorId: m.instructorId,
      meetingNumber: m.meetingNumber,
      date: new Date(m.date),
      startTime: m.startTime,
      endTime: m.endTime,
      location: m.location ?? null,
      studentsCount: 0,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // إدخال جميع اللقاءات دفعة واحدة
    await db.insert(meetings).values(values);

    return NextResponse.json(values, { status: 201 });
  } catch (error) {
    console.error("Bulk insert error:", error);
    return NextResponse.json(
      { error: "❌ فشل في حفظ اللقاءات" },
      { status: 500 }
    );
  }
}
