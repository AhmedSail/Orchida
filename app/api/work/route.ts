// src/app/api/work/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { works } from "@/src/db/schema";
import { validateNewWork, NewWork } from "./_types";

// GET /api/work → list active (not soft-deleted)
export async function GET() {
  try {
    const data = await db.select().from(works);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch works" },
      { status: 500 }
    );
  }
}

// POST /api/work → create new work
// POST /api/work → create new work
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<NewWork>;

    const error = validateNewWork(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const id = body.id ?? crypto.randomUUID();
    const now = new Date();

    const payload: NewWork = {
      id,
      title: body.title!,
      description: body.description ?? null,
      category: body.category!, // ممكن تستغني عنه لو صار عندك serviceId
      projectUrl: body.projectUrl ?? null,
      priceRange: body.priceRange ?? null,
      tags: body.tags ?? null,
      duration: body.duration ?? null,
      toolsUsed: body.toolsUsed ?? null,
      isActive: body.isActive ?? true,

      // ✅ ربط العمل بالخدمة
      serviceId: body.serviceId!, // لازم يجي من الـ frontend

      // ✅ ربط العمل بالميديا الرئيسية
      mainMediaId: body.mainMediaId ?? null,

      uploaderId: body.uploaderId ?? 1, // حل مؤقت بدون Auth
      uploadDate: body.uploadDate ?? now,
      deletedAt: null,
      createdAt: body.createdAt ?? now,
      updatedAt: body.updatedAt ?? now,
    };

    const inserted = await db.insert(works).values(payload).returning();
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (e) {
    console.error("Error inserting work:", e);
    return NextResponse.json(
      { error: "Failed to create work" },
      { status: 500 }
    );
  }
}
