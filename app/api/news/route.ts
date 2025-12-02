import { db } from "@/src"; // ملف الاتصال بـ drizzle
import { news } from "@/src/db/schema"; // جدول الأخبار
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

// إعداد Cloudinary من env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ GET: جلب كل الأخبار
export async function GET() {
  try {
    const allNews = await db.select().from(news).orderBy(news.publishedAt);
    return NextResponse.json(allNews);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// ✅ POST: إضافة خبر جديد (يدعم JSON أو FormData)
export async function POST(req: Request) {
  try {
    let title: string | null = null;
    let summary: string | null = null;
    let content: string | null = null;
    let publishedAt: Date = new Date();
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    let eventType:
      | "news"
      | "announcement"
      | "article"
      | "event"
      | "update"
      | "blog"
      | "pressRelease"
      | "promotion"
      | "alert"
      | undefined;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // 📌 لو البيانات جاية كـ JSON
      const body = await req.json();
      title = body.title;
      summary = body.summary;
      content = body.content;
      publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
      eventType = body.eventType as
        | "news"
        | "announcement"
        | "article"
        | "event"
        | "update"
        | "blog"
        | "pressRelease"
        | "promotion"
        | "alert"
        | undefined;
      imageUrl = body.imageUrl;
      imagePublicId = body.imagePublicId;
    } else if (contentType.includes("multipart/form-data")) {
      // 📌 لو البيانات جاية كـ FormData (مع صورة)
      const formData = await req.formData();
      title = formData.get("title") as string;
      summary = formData.get("summary") as string;
      content = formData.get("content") as string;
      publishedAt = new Date(formData.get("publishedAt") as string);
      eventType = formData.get("eventType") as
        | "news"
        | "announcement"
        | "article"
        | "event"
        | "update"
        | "blog"
        | "pressRelease"
        | "promotion"
        | "alert"
        | undefined;
      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // رفع الصورة إلى Cloudinary
        const uploadRes = await cloudinary.uploader.upload(
          `data:${imageFile.type};base64,${buffer.toString("base64")}`,
          {
            folder: "news",
            public_id: uuidv4(), // اسم فريد تولدته بـ uuid
            overwrite: true,
          }
        );

        imageUrl = uploadRes.secure_url;
        imagePublicId = uploadRes.public_id;
      }
    }

    // ✅ إدخال الخبر في قاعدة البيانات مع الصورة والنوع
    const newNews = await db
      .insert(news)
      .values({
        id: uuidv4(),
        title: title || "",
        summary,
        content,
        imageUrl,
        imagePublicId,
        publishedAt,
        eventType: eventType || "news", // ✅ قيمة افتراضية
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newNews[0]);
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}
