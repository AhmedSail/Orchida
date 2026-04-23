import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseEnrollments, courseApplications, courseSections } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const enrollments = await db.query.courseEnrollments.findMany({
    with: {
      section: {
        with: { course: true },
      },
    },
  });
  return NextResponse.json(enrollments);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ====== حالة القبول من الأدمن: applicationId + sectionNumber ======
    if (body.applicationId && body.sectionNumber) {
      // 1. جلب بيانات الطلب
      const app = await db.query.courseApplications.findFirst({
        where: eq(courseApplications.id, body.applicationId),
        with: { user: true },
      });

      if (!app) {
        return NextResponse.json({ message: "الطلب غير موجود" }, { status: 404 });
      }

      // 2. إيجاد الشعبة
      const section = await db.query.courseSections.findFirst({
        where: and(
          eq(courseSections.courseId, app.courseId),
          eq(courseSections.sectionNumber, body.sectionNumber)
        ),
      });

      if (!section) {
        return NextResponse.json({ message: "الشعبة غير موجودة" }, { status: 404 });
      }

      // 3. التحقق من وجود تسجيل مسبق
      const userEmail = app.user.email ?? "";
      const existing = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.sectionId, section.id),
            eq(courseEnrollments.studentEmail, userEmail)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json({ message: "الطالب مسجل بالفعل في هذه الشعبة" }, { status: 409 });
      }

      // 4. إنشاء التسجيل
      const enrollment = {
        id: uuidv4(),
        sectionId: section.id,
        studentId: app.userId,
        studentName: app.user.name ?? "",
        studentEmail: app.user.email ?? "",
        studentPhone: app.user.phone ?? null,
        studentAge: null,
        studentMajor: null,
        studentCountry: null,
        paymentReceiptUrl: null,
        confirmationStatus: "confirmed" as const,
        paymentStatus: "pending" as const,
        isCancelled: false,
        isInIntroductorySession: false,
        isReceiptUploaded: false,
      };

      await db.insert(courseEnrollments).values(enrollment);

      // 5. *** حذف الطلب من قائمة الانتظار (courseApplications) ***
      await db.delete(courseApplications).where(eq(courseApplications.id, body.applicationId));

      return NextResponse.json(
        { message: "تم قبول الطالب وتسجيله بنجاح", enrollment },
        { status: 201 }
      );
    }

    // ====== حالة التسجيل المباشر: sectionId + student info ======
    const enrollment = {
      id: uuidv4(),
      sectionId: body.sectionId,
      studentId: body.studentId ?? null,
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      studentPhone: body.studentPhone ?? null,
      studentAge: body.studentAge ?? null,
      studentMajor: body.studentMajor ?? null,
      studentCountry: body.studentCountry ?? null,
      paymentReceiptUrl: body.paymentReceiptUrl ?? null,
      confirmationStatus: body.confirmationStatus ?? "confirmed",
      paymentStatus: body.paymentStatus ?? "pending",
      isCancelled: false,
      isInIntroductorySession: false,
      isReceiptUploaded: false,
    };

    const existingEnrollment = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.sectionId, body.sectionId),
          eq(courseEnrollments.studentEmail, body.studentEmail)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        { message: "أنت مسجل بالفعل في هذه الشعبة" },
        { status: 409 }
      );
    }

    await db.insert(courseEnrollments).values(enrollment);

    return NextResponse.json(
      { message: "تم تسجيل الطالب بنجاح", enrollment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { message: "فشل إنشاء التسجيل", error: error.message },
      { status: 500 }
    );
  }
}
