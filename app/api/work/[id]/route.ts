// src/app/api/work/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { works } from "@/src/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { isValidId, NewWork } from "../_types";
import cloudinary from "@/lib/cloudinary";

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

// PUT /api/work/:id → update fields
// PUT /api/work/:id → update fields
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isValidId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = (await req.json()) as Partial<NewWork>;

    const updateData = {
      title: body.title,
      description: body.description ?? null,
      category: body.category ?? undefined, // ✅ خليها undefined مش null
      projectUrl: body.projectUrl ?? null,
      priceRange: body.priceRange ?? null,
      tags: body.tags ?? null,
      duration: body.duration ?? null,
      toolsUsed: body.toolsUsed ?? null,
      isActive: body.isActive,
      serviceId: body.serviceId ?? undefined, // نفس الفكرة
      mainMediaId: body.mainMediaId ?? undefined,
      updatedAt: new Date(),
    };

    const updated = await db
      .update(works)
      .set(updateData)
      .where(eq(works.id, id))
      .returning();

    if (updated.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("Error updating work:", error);
    return NextResponse.json(
      { error: "Failed to update work" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const publicId = body.publicId;

    // لو فيه صورة رئيسية نحذفها من Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }

    // حذف العمل من DB
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
