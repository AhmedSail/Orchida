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

    const updatedModules = await db
      .update(courseModules) // 👈 استبدل courseModules بـ courseChapters
      .set({
        title,
        description,
      })
      .where(eq(courseModules.id, param.id)) // 👈 التعديل حسب id الفصل
      .returning(); // يرجع البيانات بعد التعديل

    if (!updatedModules || updatedModules.length === 0) {
      return NextResponse.json({ error: "الفصل غير موجود" }, { status: 404 });
    }

    return NextResponse.json(updatedModules[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل التعديل" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const param = await context.params;

    // 1️⃣ جيب كل الفصول المرتبطة بالـ Module
    const chapters = await db
      .select()
      .from(courseChapters)
      .where(eq(courseChapters.moduleId, param.id));

    const chapterIds = chapters.map((ch) => ch.id);

    // 2️⃣ احذف المحتويات المرتبطة بالفصول
    if (chapterIds.length > 0) {
      await db
        .delete(chapterContent)
        .where(inArray(chapterContent.chapterId, chapterIds));
    }

    // 3️⃣ احذف الفصول المرتبطة بالـ Module
    await db
      .delete(courseChapters)
      .where(eq(courseChapters.moduleId, param.id));

    // 4️⃣ احذف الـ Module نفسه
    const deletedModule = await db
      .delete(courseModules)
      .where(eq(courseModules.id, param.id))
      .returning();

    return NextResponse.json({ message: "تم الحذف بنجاح", deletedModule });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}
