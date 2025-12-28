import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseModules } from "@/src/db/schema";
import { v4 as uuidv4 } from "uuid"; // لتوليد id فريد
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, sectionId, intructorId, title, description, orderIndex } =
      body;

    // تحقق من البيانات الأساسية
    if (!courseId || !title) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    // إدخال البيانات في الجدول
    await db.insert(courseModules).values({
      id: uuidv4(),
      courseId,
      sectionId,
      intructorId,
      title,
      description,
      orderIndex: orderIndex ?? 1,
    });

    return NextResponse.json(
      { message: "تمت إضافة الوحدة بنجاح ✅" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ أثناء الحفظ" }, { status: 500 });
  }
}
