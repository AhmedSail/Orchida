import { NextResponse } from "next/server";
import { db } from "@/src";
import { sliders } from "@/src/db/schema";

export async function GET() {
  const allSliders = await db.select().from(sliders);
  return NextResponse.json(allSliders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, title, imageUrl, description, isActive, order } = body;

    await db.insert(sliders).values({
      id,
      title,
      imageUrl: imageUrl ?? "", // ✅ لازم قيمة مش undefined
      description: description ?? null,
      isActive: isActive ?? true,
      order: order ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "تم إضافة السلايدر بنجاح ✅" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "فشل إضافة السلايدر ❌" },
      { status: 500 }
    );
  }
}
