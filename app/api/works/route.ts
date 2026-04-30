import { db } from "@/src/db";
import { mediaFiles, works } from "@/src/db/schema";
import { eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ التحقق من وجود عنوان مطابق تماماً
    const existingWork = await db
      .select()
      .from(works)
      .where(eq(works.title, body.title))
      .limit(1);

    if (existingWork.length > 0) {
      return NextResponse.json(
        { error: "يوجد عمل بنفس العنوان بالفعل. الرجاء اختيار عنوان مختلف." },
        { status: 409 }
      );
    }

    // ✅ إزاحة الأعمال التي لها نفس الترتيب أو أعلى بمقدار +1
    const newOrder = typeof body.order === "number" ? body.order : 0;
    await db
      .update(works)
      .set({ order: sql`${works.order} + 1` })
      .where(gte(works.order, newOrder));

    // إدخال العمل
    const [newWork] = await db
      .insert(works)
      .values({
        id: uuidv4(),
        title: body.title,
        description: body.description,
        category: body.category,
        projectUrl: body.projectUrl,
        priceRange: body.priceRange,
        duration: body.duration,
        imageUrl: body.imageUrl,
        type: body.type, // ✅ نخزن النوع القادم من الفرونت
        serviceId: body.serviceId,
        youtubeUrl: body.youtubeUrl,
        uploaderId: body.uploaderId,
        order: newOrder,
      })
      .returning();

    // إدخال الوسائط المرتبطة
    if (body.mediaFiles && body.mediaFiles.length > 0) {
      await db.insert(mediaFiles).values(
        body.mediaFiles.map((file: any) => ({
          workId: newWork.id,
          url: file.url,
          type: file.type,
          publicId: "",
          filename: file.filename,
          mimeType: file.mimeType,
          size: file.size,
        }))
      );
    }

    return NextResponse.json(newWork);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create work" },
      { status: 500 }
    );
  }
}
