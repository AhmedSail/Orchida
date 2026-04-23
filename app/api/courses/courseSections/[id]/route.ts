import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { courseSections } from "@/src/db/schema";

// ========== GET شعبة واحدة ==========
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
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
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const values = await req.json();

    const updateData: any = {};
    if (values.instructorId !== undefined) updateData.instructorId = values.instructorId;
    if (values.startDate !== undefined) updateData.startDate = values.startDate ? new Date(values.startDate) : null;
    if (values.endDate !== undefined) updateData.endDate = values.endDate ? new Date(values.endDate) : null;
    if (values.maxCapacity !== undefined) updateData.maxCapacity = values.maxCapacity;
    if (values.location !== undefined) updateData.location = values.location;
    if (values.courseType !== undefined) updateData.courseType = values.courseType;
    if (values.status !== undefined) updateData.status = values.status;
    if (values.notes !== undefined) updateData.notes = values.notes;
    if (values.isHidden !== undefined) updateData.isHidden = values.isHidden;
    if (values.isFree !== undefined) updateData.isFree = values.isFree;
    if (values.isV2 !== undefined) updateData.isV2 = values.isV2;

    const updated = await db
      .update(courseSections)
      .set(updateData)
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
  context: { params: Promise<{ id: string }> },
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
