import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { mediaFiles, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
const patchWorkSchema = z.object({
  title: z
    .string()
    .min(3, "يجب أن يكون العنوان 3 أحرف على الأقل")
    .max(255)
    .optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "الفئة مطلوبة").optional(),
  priceRange: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // ✅ جلب كل الوسائط المرتبطة بالعمل
    const files = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.workId, id));

    const [work] = await db.select().from(works).where(eq(works.id, id));

    return NextResponse.json(
      {
        files,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching work media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const validation = patchWorkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    // التأكد من وجود العمل قبل التحديث
    const work = await db.select().from(works).where(eq(works.id, id));

    if (!work) {
      return NextResponse.json({ error: "العمل غير موجود" }, { status: 404 });
    }

    // تحديث البيانات في قاعدة البيانات
    const updatedWork = await db
      .update(works)
      .set({
        ...validation.data,
      })
      .where(eq(works.id, id));

    return NextResponse.json(updatedWork, { status: 200 });
  } catch (error) {
    console.error("حدث خطأ أثناء تحديث العمل:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي في الخادم" },
      { status: 500 }
    );
  }
}
