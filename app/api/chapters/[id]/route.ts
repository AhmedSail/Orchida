// /app/api/modules/[id]/route.ts
import { db } from "@/src/db";
import { chapterContent, courseChapters, courseModules } from "@/src/db/schema";
import { eq, inArray } from "drizzle-orm"; // مهم لاستخدام الشرط
import { NextResponse } from "next/server";

// تعديل Module
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const param = await context.params;
    const { title, description } = body;

    const updatedChapter = await db
      .update(courseChapters) // 👈 استبدل courseModules بـ courseChapters
      .set({
        title,
        description,
      })
      .where(eq(courseChapters.id, param.id)) // 👈 التعديل حسب id الفصل
      .returning(); // يرجع البيانات بعد التعديل

    if (!updatedChapter || updatedChapter.length === 0) {
      return NextResponse.json({ error: "الفصل غير موجود" }, { status: 404 });
    }

    return NextResponse.json(updatedChapter[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل التعديل" }, { status: 500 });
  }
}

// حذف Module

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const param = await context.params;

    // 1️⃣ جلب الفصل المطلوب
    const chapter = await db
      .select()
      .from(courseChapters)
      .where(eq(courseChapters.id, param.id))
      .limit(1);

    if (!chapter || chapter.length === 0) {
      return NextResponse.json({ error: "الفصل غير موجود" }, { status: 404 });
    }

    const chapterId = chapter[0].id;

    // 2️⃣ حذف المحتويات المرتبطة بالفصل
    await db
      .delete(chapterContent)
      .where(eq(chapterContent.chapterId, chapterId));

    // 3️⃣ حذف الفصل نفسه
    await db.delete(courseChapters).where(eq(courseChapters.id, chapterId));

    return NextResponse.json({ message: "تم حذف الفصل ومحتوياته بنجاح" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}
