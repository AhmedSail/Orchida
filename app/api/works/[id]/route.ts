// src/app/api/work/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { mediaFiles, works } from "@/src/db/schema";
import {
  eq,
  and,
  isNull,
  InferSelectModel,
  InferInsertModel,
} from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";
export type Work = InferSelectModel<typeof works>;
export type NewWork = InferInsertModel<typeof works>;

export function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

// Minimal body validation for create/update
export function validateNewWork(body: Partial<NewWork>) {
  if (!body.title || !body.category) {
    return "title and category are required";
  }
  return null;
}
// GET /api/work/:id → fetch single active (not soft-deleted)
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isValidId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const rows = await db
      .select()
      .from(works)
      .where(and(eq(works.id, id), isNull(works.deletedAt)))
      .limit(1);

    if (rows.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch work" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const param = await context.params;
    const { id } = param;
    const body = await req.json();
    const oldWorkData = await db.select().from(works).where(eq(works.id, id));
    if (!id) {
      return NextResponse.json(
        { error: "Work ID is required" },
        { status: 400 }
      );
    }

    const files = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.workId, id));

    if (!oldWorkData) {
      return NextResponse.json(
        { error: "Work not found to update" },
        { status: 404 }
      );
    }

    // ✅ 4. حذف سجلات الوسائط القديمة من قاعدة البيانات
    await db.delete(mediaFiles).where(eq(mediaFiles.workId, id));

    // ✅ 5. تحديث بيانات العمل الأساسية بالبيانات الجديدة
    const [updatedWork] = await db
      .update(works)
      .set({
        title: body.title,
        description: body.description,
        category: body.category,
        projectUrl: body.projectUrl,
        priceRange: body.priceRange,
        duration: body.duration,
        imageUrl: body.imageUrl, // الرابط الجديد
        type: body.type,
        serviceId: body.serviceId,
      })
      .where(eq(works.id, id))
      .returning();

    // ✅ 6. إضافة سجلات الوسائط الجديدة إلى قاعدة البيانات
    if (body.mediaFiles && body.mediaFiles.length > 0) {
      await db.insert(mediaFiles).values(
        body.mediaFiles.map((file: any) => ({
          workId: id,
          url: file.url,
          type: file.type,
          filename: file.filename,
          mimeType: file.mimeType,
          size: file.size,
        }))
      );
    }

    return NextResponse.json(updatedWork);
  } catch (error) {
    console.error("[PATCH_WORK]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/work/:id → حذف العمل مع الوسائط
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // ✅ 1. جلب الوسائط المرتبطة بالعمل
    const files = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.workId, id));

    // ✅ 3. حذف الوسائط من قاعدة البيانات
    await db.delete(mediaFiles).where(eq(mediaFiles.workId, id));

    // ✅ 4. حذف العمل نفسه
    const deleted = await db.delete(works).where(eq(works.id, id)).returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting work:", error);
    return NextResponse.json(
      { error: "Failed to delete work" },
      { status: 500 }
    );
  }
}
