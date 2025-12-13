import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { serviceRequests } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// ✅ DELETE /api/serviceRequests/[id]
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // تحقق من وجود الطلب أولاً
    const existing = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    // ✅ حذف الطلب
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));

    return NextResponse.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    });
  } catch (error) {
    console.error("Error deleting service request:", error);
    return NextResponse.json(
      { success: false, error: "فشل في حذف الطلب" },
      { status: 500 }
    );
  }
}
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // تحقق من وجود الطلب أولاً
    const existing = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    // ✅ تحديث البيانات
    await db
      .update(serviceRequests)
      .set({
        serviceId: body.serviceId,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
        name: body.name,
        description: body.description,
        budget: body.budget ? String(body.budget) : null, // ✅ حولها لنص
        clientId: body.clientId,
        status: body.status,
        duration: body.duration || null,
      })
      .where(eq(serviceRequests.id, id));

    return NextResponse.json({
      success: true,
      message: "تم تعديل الطلب بنجاح",
    });
  } catch (error) {
    console.error("Error updating service request:", error);
    return NextResponse.json(
      { success: false, error: "فشل في تعديل الطلب" },
      { status: 500 }
    );
  }
}
