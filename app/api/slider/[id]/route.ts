import { NextResponse } from "next/server";
import { db } from "@/src";
import { sliders } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// ✅ GET: جلب سلايدر واحد
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const [slider] = await db.select().from(sliders).where(eq(sliders.id, id));
  return NextResponse.json(slider || { message: "السلايدر غير موجود ❌" });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  // استبعاد الحقول الزمنية القادمة من الـ frontend
  const { createdAt, updatedAt, ...safeBody } = body;

  await db
    .update(sliders)
    .set({
      ...safeBody,
      updatedAt: new Date(), // ✅ كائن Date وليس string
    })
    .where(eq(sliders.id, id));

  return NextResponse.json({ message: "تم تحديث السلايدر ✅" });
}

// ✅ DELETE: حذف سلايدر
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await db.delete(sliders).where(eq(sliders.id, id));
    return NextResponse.json({ message: "تم حذف السلايدر ✅" });
  } catch (error) {
    console.error("خطأ في الحذف:", error);
    return NextResponse.json({ error: "فشل حذف السلايدر ❌" }, { status: 500 });
  }
}
