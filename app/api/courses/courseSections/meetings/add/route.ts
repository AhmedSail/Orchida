import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto"; // ✅ الصحيح

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ✅ تجهيز البيانات مع UUID صحيح
    const meetingData = {
      ...body,
      id: randomUUID(), // يولّد UUID جديد كل مرة
      date: body.date ? new Date(body.date) : null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      studentsCount: body.studentsCount ?? 0,
      notes: body.notes || null,
    };

    const [newMeeting] = await db
      .insert(meetings)
      .values(meetingData)
      .returning();

    if (!newMeeting) {
      return NextResponse.json(
        { message: "فشل إنشاء اللقاء" },
        { status: 500 }
      );
    }

    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
