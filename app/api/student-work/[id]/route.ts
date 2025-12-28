import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { studentWorks } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const param = await context.params;
  try {
    const body = await req.json();
    const { title, description, status } = body;

    await db
      .update(studentWorks)
      .set({
        title,
        description,
        status,
        updatedAt: new Date(),
      })
      .where(eq(studentWorks.id, param.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to update work" },
      { status: 500 }
    );
  }
}

// 🗑️ حذف عمل
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const param = await context.params;
  try {
    if (!param.id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );
    }

    await db.delete(studentWorks).where(eq(studentWorks.id, param.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to delete work" },
      { status: 500 }
    );
  }
}
