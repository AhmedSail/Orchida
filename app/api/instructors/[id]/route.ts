import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { instructors } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ✅ جلب مدرب واحد
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const instructor = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, params.id));

    if (!instructor.length) {
      return NextResponse.json({ error: "المدرب غير موجود" }, { status: 404 });
    }

    return NextResponse.json(instructor[0]);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب المدرب" }, { status: 500 });
  }
}

// ✅ تعديل مدرب
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await req.json();

    const updatedInstructor = await db
      .update(instructors)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone,
        specialty: body.specialty,
        bio: body.bio,
        experienceYears: body.experienceYears,
      })
      .where(eq(instructors.id, params.id))
      .returning();

    if (!updatedInstructor.length) {
      return NextResponse.json({ error: "المدرب غير موجود" }, { status: 404 });
    }

    return NextResponse.json(updatedInstructor[0]);
  } catch (error) {
    return NextResponse.json({ error: "فشل في تعديل المدرب" }, { status: 500 });
  }
}

// ✅ حذف مدرب
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const deletedInstructor = await db
      .delete(instructors)
      .where(eq(instructors.id, params.id))
      .returning();

    if (!deletedInstructor.length) {
      return NextResponse.json({ error: "المدرب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ message: "تم الحذف بنجاح ✅" });
  } catch (error) {
    return NextResponse.json({ error: "فشل في حذف المدرب" }, { status: 500 });
  }
}
