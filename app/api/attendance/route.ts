import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { attendance } from "@/src/db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير مسجل الدخول" },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "البيانات لازم تكون مصفوفة" },
        { status: 400 }
      );
    }

    const insertedRecords: any[] = [];

    for (const rec of body) {
      if (!rec.meetingId || !rec.enrollmentId || !rec.status) continue;

      const newRecord = {
        id: uuidv4(),
        meetingId: rec.meetingId,
        enrollmentId: rec.enrollmentId,
        status: rec.status,
        markedBy: currentUserId,
        notes: rec.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(attendance).values(newRecord);

      insertedRecords.push(newRecord);
    }

    return NextResponse.json(
      {
        success: true,
        message: "✅ تم تسجيل الحضور لهذا اللقاء",
        records: insertedRecords, // نرجع السجلات مع الـ id
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
