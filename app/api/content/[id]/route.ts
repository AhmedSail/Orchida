// /app/api/modules/[id]/route.ts
import { db } from "@/src/db";
import { chapterContent, courseChapters, courseModules } from "@/src/db/schema";
import { eq, inArray } from "drizzle-orm"; // مهم لاستخدام الشرط
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const param = await context.params;
    const body = await req.json();

    const {
      title,
      description,
      contentType,
      fileUrl,
      imageUrls,
      attachmentName,
      removeFile,
    } = body;

    const existing = await db
      .select()
      .from(chapterContent)
      .where(eq(chapterContent.id, param.id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });
    }

    let videoUrl = existing[0].videoUrl;
    let imageUrl = existing[0].imageUrl;
    let imageUrlsDb = existing[0].imageUrls;
    let attachmentUrl = existing[0].attachmentUrl;
    let attachmentNameDb = existing[0].attachmentName;
    let contentTypes = existing[0].contentType;

    // ✅ إذا المستخدم حذف الملف
    if (removeFile) {
      videoUrl = null;
      imageUrl = null;
      imageUrlsDb = null;
      attachmentUrl = null;
      attachmentNameDb = null;
      contentTypes = "text";
    }

    if (imageUrls) {
      imageUrlsDb = imageUrls;
      // also set imageUrl for fallback (first image)
      try {
        const parsed = JSON.parse(imageUrls);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imageUrl = parsed[0];
        }
      } catch (e) {
        console.error("Failed to parse imageUrls", e);
      }
    }

    // ✅ إذا في ملف جديد مرفوع من الكلينت
    if (fileUrl) {
      if (contentType === "video") {
        videoUrl = fileUrl;
      } else if (contentType === "image") {
        imageUrl = fileUrl;
      } else if (contentType === "attachment") {
        attachmentUrl = fileUrl;
        attachmentNameDb = attachmentName;
      }
    }

    const updated = await db
      .update(chapterContent)
      .set({
        title,
        description,
        videoUrl,
        imageUrl,
        imageUrls: imageUrlsDb,
        contentType,
        attachmentUrl,
        attachmentName: attachmentNameDb,
        scheduledAt: body.scheduledAt
          ? new Date(body.scheduledAt)
          : existing[0].scheduledAt,
        updatedAt: new Date(),
      })
      .where(eq(chapterContent.id, param.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل تعديل المحتوى" }, { status: 500 });
  }
}

// حذف Module

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const param = await context.params;

    // 1️⃣ جلب المحتوى من الـ DB
    const content = await db
      .select()
      .from(chapterContent)
      .where(eq(chapterContent.id, param.id))
      .limit(1);

    if (!content || content.length === 0) {
      return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });
    }

    // 3️⃣ حذف السجل من الـ DB
    await db.delete(chapterContent).where(eq(chapterContent.id, param.id));

    return NextResponse.json({ message: "تم حذف المحتوى بنجاح" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل حذف المحتوى" }, { status: 500 });
  }
}
