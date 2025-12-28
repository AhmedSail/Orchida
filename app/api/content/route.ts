import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { chapterContent } from "@/src/db/schema";
import { randomUUID } from "crypto";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const rawContentType = formData.get("contentType") as string;

    const chapterId = formData.get("chapterId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;

    // ✅ تحقق من نوع المحتوى
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

    // ممكن يجيك يا إما ملف أو رابط جاهز من Edge Store
    const file = formData.get("file") as File | null;
    const fileUrlFromEdge = formData.get("fileUrl") as string | null;

    // ✅ تحقق من حجم الملف (10MB)
    if (file && file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الملف أكبر من 10MB، الرجاء اختيار ملف أصغر" },
        { status: 400 }
      );
    }

    let fileUrl: string | null = null;
    let publicId: string | null = null;

    if (file) {
      // ✅ رفع الملف إلى Cloudinary إذا موجود
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "content_of_courses",
            resource_type: "auto", // يقبل صور وفيديوهات وملفات
          },
          (error, uploadResult) => {
            if (error) return reject(error);
            resolve(uploadResult);
          }
        );
        uploadStream.end(buffer);
      });

      fileUrl = result.secure_url;
      publicId = result.public_id;
    } else if (fileUrlFromEdge) {
      // ✅ لو جالك رابط جاهز من Edge Store
      fileUrl = fileUrlFromEdge;
    }

    // ✅ تجهيز البيانات للإدخال في قاعدة البيانات
    const newContent = {
      id: randomUUID(),
      chapterId,
      contentType,
      title,
      description,
      textContent,
      videoUrl: contentType === "video" ? fileUrl : null,
      imageUrl: contentType === "image" ? fileUrl : null,
      attachmentUrl: contentType === "attachment" ? fileUrl : null,
      attachmentName,
      orderIndex: 1,
      isPublished: true,
    };

    await db.insert(chapterContent).values(newContent);

    return NextResponse.json({
      ...newContent,
      cloudinary_public_id: publicId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل رفع المحتوى" }, { status: 500 });
  }
}
