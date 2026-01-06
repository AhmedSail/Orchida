import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseEnrollments } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // بناء بيانات التسجيل
    const enrollment = {
      id: uuidv4(), // توليد ID فريد
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

    // Check for existing enrollment in this section for this student email
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

    // إدخال البيانات في قاعدة البيانات
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
