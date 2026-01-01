import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { chapterContent } from "@/src/db/schema";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const rawContentType = formData.get("contentType") as string;

    const chapterId = formData.get("chapterId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;

    const allowedTypes = ["text", "video", "image", "attachment"] as const;
    if (!allowedTypes.includes(rawContentType as any)) {
      return NextResponse.json(
        { error: "نوع المحتوى غير صالح" },
        { status: 400 }
      );
    }
    const contentType = rawContentType as (typeof allowedTypes)[number];

    const textContent = formData.get("textContent") as string | null;
    const attachmentName = formData.get("attachmentName") as string | null;
    const fileUrl = formData.get("fileUrl") as string | null;

    // تحقق من وجود رابط الملف إذا لم يكن المحتوى نصيًا
    if (!fileUrl && contentType !== "text") {
      return NextResponse.json(
        { error: "يجب توفير رابط الملف للأنواع غير النصية" },
        { status: 400 }
      );
    }

    const newContent = {
      id: randomUUID(),
      chapterId,
      contentType,
      title,
      description,
      // احفظ المحتوى النصي فقط إذا كان النوع "text"
      textContent: contentType === "text" ? textContent : null,
      videoUrl: contentType === "video" ? fileUrl : null,
      imageUrl: contentType === "image" ? fileUrl : null,
      attachmentUrl: contentType === "attachment" ? fileUrl : null,
      attachmentName,
      orderIndex: 1,
      isPublished: true,
    };

    await db.insert(chapterContent).values(newContent);

    return NextResponse.json(newContent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل رفع المحتوى" }, { status: 500 });
  }
}
