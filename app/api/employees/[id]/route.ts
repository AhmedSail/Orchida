import { db } from "@/src";
import { employees } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const employee = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));

  return Response.json(employee[0] || null);
}

export async function PUT(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await _.json();

  await db
    .update(employees)
    .set({
      name: body.name,
      specialty: body.specialty,
      email: body.email,
      phone: body.phone,
      updatedAt: new Date(),
    })
    .where(eq(employees.id, id));

  return Response.json({ message: "تم تحديث بيانات الموظف" });
}

// ✅ DELETE: حذف سلايدر
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await db.delete(employees).where(eq(employees.id, id));
    return NextResponse.json({ message: "تم حذف الموظف ✅" });
  } catch (error) {
    console.error("خطأ في الحذف:", error);
    return NextResponse.json({ error: "فشل حذف الموظف ❌" }, { status: 500 });
  }
}
