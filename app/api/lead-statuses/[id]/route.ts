import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { leadStatuses } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const { label, color, orderIndex } = body;

    const updateData: any = { updatedAt: new Date() };
    if (label !== undefined) updateData.label = label.trim();
    if (color !== undefined) updateData.color = color;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const updated = await db
      .update(leadStatuses)
      .set(updateData)
      .where(eq(leadStatuses.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ message: "الحالة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "حدث خطأ أثناء تعديل الحالة", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const deleted = await db
      .delete(leadStatuses)
      .where(eq(leadStatuses.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ message: "الحالة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ message: "تم حذف الحالة بنجاح" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف الحالة", error: error.message },
      { status: 500 }
    );
  }
}
