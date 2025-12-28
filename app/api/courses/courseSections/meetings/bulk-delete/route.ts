// 📍 المسار: src/app/api/courses/courseSections/meetings/bulk-delete/route.ts

import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    // 1. قراءة جسم الطلب
    const body = await req.json();
    const { ids } = body;

    // 2. تحقق من أن ids مصفوفة
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "يجب توفير مصفوفة من IDs." },
        { status: 400 }
      );
    }

    // 3. تنفيذ الحذف باستخدام Drizzle
    const deleteResult = await db
      .delete(meetings)
      .where(inArray(meetings.id, ids));

    // 4. إرجاع النتيجة
    return NextResponse.json(
      {
        message: `تم حذف اللقاءات بنجاح.`,
        result: deleteResult, // بيعطي عدد الصفوف المتأثرة حسب قاعدة البيانات
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MEETINGS_BULK_DELETE_API]", error);
    return NextResponse.json(
      { message: "حدث خطأ داخلي في الخادم." },
      { status: 500 }
    );
  }
}
