import { NextResponse } from "next/server";
import { db } from "@/src";
import { courses } from "@/src/db/schema";

// GET: جلب كل الكورسات
export async function GET() {
  try {
    const allCourses = await db.select().from(courses);
    return NextResponse.json(allCourses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب الكورسات" }, { status: 500 });
  }
}

// POST: إضافة كورس جديد
export async function POST(req: Request) {
  try {
    const body = await req.json();

    await db.insert(courses).values({
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      duration: body.duration,
      hours: body.hours,
      price: body.price,
      targetAudience: body.targetAudience,
      topics: body.topics,
      objectives: body.objectives,
      isActive: body.isActive,
    });

    return NextResponse.json({
      success: true,
      message: "تمت إضافة الكورس بنجاح",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في إضافة الكورس" }, { status: 500 });
  }
}
