import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json(
        { message: "معرف اللقاء مطلوب" },
        { status: 400 }
      );
    }

    // --- بداية التعديل الرئيسي ---

    // 1. سجل البيانات الخام التي تصل من الواجهة الأمامية
    console.log("Raw data received for update:", body);

    // 2. تحويل التاريخ من سلسلة نصية إلى كائن Date (هذا هو الحل الأرجح)
    if (dataToUpdate.date && typeof dataToUpdate.date === "string") {
      const newDate = new Date(dataToUpdate.date);
      if (isNaN(newDate.getTime())) {
        throw new Error(`التاريخ المستلم '${dataToUpdate.date}' غير صالح.`);
      }
      dataToUpdate.date = newDate;
    }

    // 3. إضافة حقل updatedAt لتتبعه
    dataToUpdate.updatedAt = new Date();

    // 4. سجل البيانات بعد تنظيفها وقبل إرسالها لقاعدة البيانات
    console.log("Cleaned data being sent to DB:", dataToUpdate);

    // --- نهاية التعديل الرئيسي ---

    const [updatedMeeting] = await db
      .update(meetings)
      .set(dataToUpdate)
      .where(eq(meetings.id, id))
      .returning();

    if (!updatedMeeting) {
      return NextResponse.json(
        { message: "لم يتم العثور على اللقاء للتحديث" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMeeting, { status: 200 });
  } catch (error) {
    // 5. تسجيل الخطأ الفعلي بالتفصيل في الطرفية
    console.error("❌ FAILED TO UPDATE MEETING:", error);

    const errorMessage =
      error instanceof Error ? error.message : "خطأ غير معروف في الخادم";
    return NextResponse.json(
      { message: "فشل تحديث اللقاء", error: errorMessage },
      { status: 500 }
    );
  }
}
