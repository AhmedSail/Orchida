import { NextResponse } from "next/server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { courseSections, courseLeads } from "@/src/db/schema";

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

    // 1. جلب الحالة الحالية للشعبة قبل التحديث
    const currentSection = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, params.id),
    });

    const oldStatus = currentSection?.status;
    const newStatus = values.status;

    // 2. تحديث الشعبة
    const updated = await db
      .update(courseSections)
      .set({
        instructorId: values.instructorId,
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate ? new Date(values.endDate) : null,
        maxCapacity: values.maxCapacity,
        location: values.location,
        courseType: values.courseType,
        status: newStatus,
        notes: values.notes,
      })
      .where(eq(courseSections.id, params.id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "فشل تحديث الشعبة" }, { status: 400 });
    }

    // 3. التحقق مما إذا كانت الحالة تغيرت إلى "بدأت" أو "مغلقة" أو "مكتملة"
    const isTerminatingStatus = (status: string) =>
      ["in_progress", "closed", "completed"].includes(status);

    if (
      isTerminatingStatus(newStatus) &&
      !isTerminatingStatus(oldStatus || "")
    ) {
      // زيادة عداد عدم الاستجابة لكل المهتمين بهذه الشعبة الذين لم يتم تحويلهم (ما زالوا في فئة المهتمين)
      await db
        .update(courseLeads)
        .set({
          nonResponseCount: sql`${courseLeads.nonResponseCount} + 1`,
          isActive: false, // تعطيل الطلب لهذه الشعبة لأنه انتهى وقت التسجيل فيها
        })
        .where(eq(courseLeads.sectionId, params.id));
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
