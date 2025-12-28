import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseEnrollments } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      enrollmentId,
      paymentReceiptUrl,
      paymentStatus,
      confirmationStatus,
    } = body;

    if (!paymentReceiptUrl) {
      return NextResponse.json(
        { message: "يجب إرسال رابط إشعار الدفع" },
        { status: 400 }
      );
    }

    await db
      .update(courseEnrollments)
      .set({
        paymentReceiptUrl,
        isReceiptUploaded: true,
        paymentStatus: "paid",
        paidAt: new Date(),
        confirmationStatus: "confirmed",
      })
      .where(eq(courseEnrollments.id, enrollmentId));

    return NextResponse.json(
      { message: "تم حفظ إشعار الدفع وتحديث الحالة بنجاح" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving payment receipt:", error);
    return NextResponse.json(
      { message: "فشل حفظ إشعار الدفع", error: error.message },
      { status: 500 }
    );
  }
}
