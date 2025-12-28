import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { instructors } from "@/src/db/schema";
import { v4 as uuidv4 } from "uuid";

// ✅ إرجاع كل المدربين
export async function GET() {
  try {
    const allInstructors = await db.select().from(instructors);
    return NextResponse.json(allInstructors);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب المدربين" }, { status: 500 });
  }
}

// ✅ إضافة مدرب جديد
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newInstructor = await db
      .insert(instructors)
      .values({
        id: body.id, // أو توليد UUID
        name: body.name,
        email: body.email,
        phone: body.phone,
        specialty: body.specialty,
        bio: body.bio,
        experienceYears: body.experienceYears, // ✅ نص
      })
      .returning();

    return NextResponse.json(newInstructor[0]);
  } catch (error) {
    return NextResponse.json({ error: "فشل في إضافة المدرب" }, { status: 500 });
  }
}
