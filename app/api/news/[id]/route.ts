import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src";
import { news } from "@/src/db/schema";
import { v2 as cloudinary } from "cloudinary";

// إعداد Cloudinary من env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ GET: جلب خبر واحد بالـ id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const result = await db.select().from(news).where(eq(news.id, id)).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "الخبر غير موجود" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching news by id:", error);
    return NextResponse.json({ error: "فشل في جلب الخبر" }, { status: 500 });
  }
}

// ✅ PUT: تعديل خبر بالـ id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // لازم await هنا
    const body = await req.json();

    // جلب الخبر القديم للتأكد من وجوده
    const existingNews = await db.select().from(news).where(eq(news.id, id));
    if (!existingNews.length) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    // لو فيه صورة جديدة مرفوعة، احذف القديمة من Cloudinary
    if (
      body.imagePublicId &&
      existingNews[0].imagePublicId &&
      body.imagePublicId !== existingNews[0].imagePublicId
    ) {
      await cloudinary.uploader.destroy(existingNews[0].imagePublicId);
    }

    // تحديث الخبر في قاعدة البيانات
    const updatedNews = await db
      .update(news)
      .set({
        title: body.title,
        summary: body.summary,
        content: body.content,
        imageUrl: body.imageUrl ?? existingNews[0].imageUrl,
        imagePublicId: body.imagePublicId ?? existingNews[0].imagePublicId,
        eventType: body.eventType,
        isActive: body.isActive,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
      .returning();

    return NextResponse.json(updatedNews[0]);
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: حذف خبر بالـ id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // جلب الخبر أولاً للتأكد من وجوده
    const existingNews = await db.select().from(news).where(eq(news.id, id));

    if (!existingNews.length) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    // حذف الخبر من قاعدة البيانات
    const deletedNews = await db
      .delete(news)
      .where(eq(news.id, id))
      .returning();

    return NextResponse.json(deletedNews[0]);
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}
