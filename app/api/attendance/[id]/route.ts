import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { attendance } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير مسجل الدخول" },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    await db
      .update(attendance)
      .set({
        status: body.status,
        notes: body.notes ?? null,
        markedBy: currentUserId,
        updatedAt: new Date(),
      })
      .where(eq(attendance.id, context.params.id));

    return NextResponse.json(
      { success: true, message: "✅ تم تحديث الحضور بنجاح" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
