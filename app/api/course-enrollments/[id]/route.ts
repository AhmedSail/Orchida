import { NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  attendance,
  courseEnrollments,
  courseLeads,
  courseSections,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const param = await context.params;

  if (!param.id) {
    return NextResponse.json(
      { message: "يجب إرسال معرف التسجيل (id)" },
      { status: 400 },
    );
  }

  try {
    // 1. جلب بيانات التسجيل قبل الحذف
    const enrollment = await db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, param.id),
      with: {
        section: true,
      },
    });

    if (enrollment) {
      // 2. إرجاع الطالب لجدول المهتمين (حالة: يريد التسجيل في الدورة القادمة)
      await db.insert(courseLeads).values({
        id: uuidv4(),
        courseId: enrollment.section.courseId,
        sectionId: enrollment.sectionId,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        studentPhone: enrollment.studentPhone || "",
        studentEmail: enrollment.studentEmail,
        studentAge: enrollment.studentAge,
        studentMajor: enrollment.studentMajor,
        studentCountry: enrollment.studentCountry,
        status: "future_course", // يريد الحضور في الدورة القادمة
        notes: enrollment.notes,
      });
    }

    // 3. احذف الحضور المرتبط بهذا التسجيل
    await db.delete(attendance).where(eq(attendance.enrollmentId, param.id));

    // 4. احذف التسجيل نفسه
    await db
      .delete(courseEnrollments)
      .where(eq(courseEnrollments.id, param.id));

    return NextResponse.json(
      { message: "تم حذف التسجيل بنجاح وإرجاعه لقائمة المهتمين" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error in delete enrollment:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء الحذف", error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "يجب إرسال معرف التسجيل (id)" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const { paymentStatus, confirmationStatus, IBAN, sectionId } = body;

  const updateData: any = {};
  if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
  if (confirmationStatus !== undefined)
    updateData.confirmationStatus = confirmationStatus;
  if (IBAN !== undefined) updateData.IBAN = IBAN;
  if (sectionId !== undefined) {
    // التحقق من وجود الشعبة الجديدة
    const section = await db.query.courseSections.findFirst({
      where: eq(courseSections.id, sectionId),
    });
    if (!section) {
      return NextResponse.json(
        { message: "الشعبة المطلوبة غير موجودة" },
        { status: 404 },
      );
    }
    updateData.sectionId = sectionId;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { message: "لا توجد بيانات لتحديثها" },
      { status: 400 },
    );
  }

  await db
    .update(courseEnrollments)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(courseEnrollments.id, id));

  return NextResponse.json(
    { message: "تم تعديل التسجيل بنجاح", id, updateData },
    { status: 200 },
  );
}
