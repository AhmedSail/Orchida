import { db } from "@/src/db";
import { meetings } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "معرف اللقاء مطلوب" },
        { status: 400 }
      );
    }

    const [deletedMeeting] = await db
      .delete(meetings)
      .where(eq(meetings.id, id))
      .returning();

    if (!deletedMeeting) {
      return NextResponse.json(
        { message: "لم يتم العثور على اللقاء" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "تم الحذف بنجاح" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
