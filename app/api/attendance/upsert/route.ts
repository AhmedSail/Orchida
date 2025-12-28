import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { attendance } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
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

    const results: any[] = [];

    for (const rec of body) {
      if (!rec.meetingId || !rec.enrollmentId || rec.status === undefined)
        continue;

      const existingRecord = await db
        .select()
        .from(attendance)
        .where(
          and(
            eq(attendance.meetingId, rec.meetingId),
            eq(attendance.enrollmentId, rec.enrollmentId)
          )
        )
        .limit(1);

      if (existingRecord.length > 0) {
        // Record exists, so we update it
        const updatedRecord = await db
          .update(attendance)
          .set({
            status: rec.status,
            markedBy: currentUserId,
            updatedAt: new Date(),
          })
          .where(eq(attendance.id, existingRecord[0].id))
          .returning();
        results.push({ operation: "updated", record: updatedRecord[0] });
      } else {
        // Record does not exist, so we create it
        const newRecord = {
          id: uuidv4(),
          meetingId: rec.meetingId,
          enrollmentId: rec.enrollmentId,
          status: rec.status,
          markedBy: currentUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.insert(attendance).values(newRecord);
        results.push({ operation: "inserted", record: newRecord });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "✅ تم حفظ وتحديث الحضور بنجاح",
        results,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in upsert attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
