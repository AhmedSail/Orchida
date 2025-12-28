import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseEnrollments } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "يجب إرسال معرف التسجيل (id)" },
      { status: 400 }
    );
  }

  await db.delete(courseEnrollments).where(eq(courseEnrollments.id, id));

  return NextResponse.json(
    { message: "تم حذف التسجيل بنجاح", id },
    { status: 200 }
  );
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "يجب إرسال معرف التسجيل (id)" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { paymentStatus, confirmationStatus, IBAN } = body;

  // ✅ تحقق فقط إذا ما أرسلت أي قيمة
  if (
    paymentStatus === undefined &&
    confirmationStatus === undefined &&
    IBAN === undefined
  ) {
    return NextResponse.json(
      { message: "يجب إرسال حالة الدفع أو حالة التأكيد أو IBAN للتعديل" },
      { status: 400 }
    );
  }

  const updateData: Partial<typeof courseEnrollments.$inferInsert> = {};
  if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
  if (confirmationStatus !== undefined)
    updateData.confirmationStatus = confirmationStatus;
  if (IBAN !== undefined) updateData.IBAN = IBAN; // يقبل "" كمان

  await db
    .update(courseEnrollments)
    .set(updateData)
    .where(eq(courseEnrollments.id, id));

  return NextResponse.json(
    { message: "تم تعديل التسجيل بنجاح", id, updateData },
    { status: 200 }
  );
}
