import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseChapters } from "@/src/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { moduleId, title, description, orderIndex } = body;

    if (!moduleId || !title) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const newChapter = {
      id: uuidv4(),
      moduleId,
      title,
      description,
      orderIndex: orderIndex ?? 1,
    };

    await db.insert(courseChapters).values(newChapter);

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ أثناء الحفظ" }, { status: 500 });
  }
}
