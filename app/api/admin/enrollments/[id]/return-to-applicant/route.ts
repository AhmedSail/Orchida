import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseEnrollments, courseApplications } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 1. جلب بيانات التسجيل
    const enrollment = await db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, id),
      with: {
        section: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ message: "التسجيل غير موجود" }, { status: 404 });
    }

    // 2. إنشاء طلب جديد في طابور الالتحاق
    // ملاحظة: نحتاج لـ userId. إذا لم يكن موجوداً (طالب ضيف)، قد نحتاج للتعامل مع ذلك.
    // لكن عادة المسجلين لديهم userId.
    if (!enrollment.studentId) {
      return NextResponse.json({ message: "لا يمكن إرجاع طالب ليس لديه حساب مستخدم" }, { status: 400 });
    }

    await db.insert(courseApplications).values({
      id: uuidv4(),
      userId: enrollment.studentId,
      courseId: enrollment.section.courseId,
      statusValue: "new",
      attendanceType: enrollment.attendanceType || "in_person",
      studentNotes: enrollment.notes,
      adminNotes: "تم إرجاعه من قائمة المسجلين",
    });

    // 3. حذف التسجيل
    await db.delete(courseEnrollments).where(eq(courseEnrollments.id, id));

    return NextResponse.json({ message: "تم إرجاع الطالب لطابور الالتحاق بنجاح" });
  } catch (error: any) {
    console.error("Error returning enrollment to applicant:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء العملية", error: error.message },
      { status: 500 }
    );
  }
}
