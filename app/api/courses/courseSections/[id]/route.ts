import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { courseSections } from "@/src/db/schema";

// ========== GET شعبة واحدة ==========
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const section = await db
      .select()
      .from(courseSections)
      .where(eq(courseSections.id, params.id));

    if (!section.length) {
      return NextResponse.json({ error: "الشعبة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(section[0]);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب الشعبة" }, { status: 500 });
  }
}

// ========== PUT تعديل شعبة ==========
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const values = await req.json();

    // نحدث كل الحقول المرسلة من الفورم
    const updated = await db
      .update(courseSections)
      .set({
        instructorId: values.instructorId,
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate ? new Date(values.endDate) : null,
        maxCapacity: values.maxCapacity,
        location: values.location,
        courseType: values.courseType,
        status: values.status,
        notes: values.notes,
      })
      .where(eq(courseSections.id, params.id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "فشل تحديث الشعبة" }, { status: 400 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "فشل في تعديل الشعبة" }, { status: 500 });
  }
}

// ========== DELETE حذف شعبة ==========
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const deleted = await db
      .delete(courseSections)
      .where(eq(courseSections.id, params.id))
      .returning();

    return NextResponse.json(deleted[0]);
  } catch (error) {
    return NextResponse.json({ error: "فشل في حذف الشعبة" }, { status: 500 });
  }
}
