import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }

    // ✅ تحقق من الحجم (10MB = 10 * 1024 * 1024 بايت)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الملف أكبر من 10MB، الرجاء اختيار ملف أصغر" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resourceType: "image" | "video" | "raw" = "raw";
    let uploadFormat: string | undefined = undefined;

    if (file.type.startsWith("image/")) {
      resourceType = "image";
    } else if (file.type.startsWith("video/")) {
      resourceType = "video";
    } else {
      // For attachments (PDF, DOCX, etc.), use 'raw'
      resourceType = "raw";
      // Extract the file extension for the format parameter
      const parts = file.name.split(".");
      if (parts.length > 1) {
        uploadFormat = parts.pop();
      }
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "content_of_courses",
          resource_type: resourceType,
          format: uploadFormat, // Use the extracted format or undefined
          access_mode: "public", // ✅ Fix for HTTP 401 error: ensure public access
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      uploadStream.end(buffer);
    });

    // ✅ بناء رابط تحميل إجباري بعد الرفع
    let finalDownloadUrl = result.secure_url;
    if (resourceType === "raw") {
      finalDownloadUrl = cloudinary.url(result.public_id, {
        resource_type: "raw",
        format: result.format, // Use the format returned by Cloudinary
        flags: "attachment", // Optional: Cloudinary flag to force download
      });
    }

    return NextResponse.json({
      url: result.secure_url, // رابط العرض العادي
      downloadUrl: finalDownloadUrl, // رابط التحميل الإجباري
      public_id: result.public_id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}
