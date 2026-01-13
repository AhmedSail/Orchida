import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src";
import { courses } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// GET: جلب كورس واحد
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 زي ما Next.js يتوقع
) {
  const { id } = await context.params; // 👈 لازم await
  try {
    const course = await db.select().from(courses).where(eq(courses.id, id));

    if (!course.length) {
      return NextResponse.json({ error: "الكورس غير موجود" }, { status: 404 });
    }

    return NextResponse.json(course[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب الكورس" }, { status: 500 });
  }
}

// PUT: تعديل كورس
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();

    await db
      .update(courses)
      .set({
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        duration: body.duration,
        hours: body.hours,
        price: body.price,
        currency: body.currency,
        targetAudience: body.targetAudience,
        topics: body.topics,
        objectives: body.objectives,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id));

    return NextResponse.json({
      success: true,
      message: "تم تعديل الكورس بنجاح",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في تعديل الكورس" }, { status: 500 });
  }
}

// DELETE: حذف كورس
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await db.delete(courses).where(eq(courses.id, id));
    return NextResponse.json({ success: true, message: "تم حذف الكورس بنجاح" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في حذف الكورس" }, { status: 500 });
  }
}
