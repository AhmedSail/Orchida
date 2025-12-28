import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseEnrollments } from "@/src/db/schema";
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
