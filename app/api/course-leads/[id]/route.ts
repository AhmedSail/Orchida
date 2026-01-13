import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseLeads, courseEnrollments } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    const updatedLead = await db
      .update(courseLeads)
      .set({ status })
      .where(eq(courseLeads.id, id))
      .returning();

    if (!updatedLead[0]) {
      return NextResponse.json({ message: "الطلب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      message: "تم تحديث حالة الطلب بنجاح",
      lead: updatedLead[0],
    });
  } catch (error: any) {
    console.error("Error updating course lead:", error);
    return NextResponse.json(
      { message: "فشل تحديث الطلب", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const targetSectionId = body.targetSectionId;

    // جلب بيانات الـ Lead
    const lead = await db.query.courseLeads.findFirst({
      where: eq(courseLeads.id, id),
    });

    if (!lead) {
      return NextResponse.json({ message: "الطلب غير موجود" }, { status: 404 });
    }

    const finalSectionId = targetSectionId || lead.sectionId;

    if (!finalSectionId) {
      return NextResponse.json(
        { message: "يجب تحديد شعبة أولاً لتحويل الطلب" },
        { status: 400 }
      );
    }

    // إنشاء الـ Enrollment
    const enrollmentId = uuidv4();
    await db.insert(courseEnrollments).values({
      id: enrollmentId,
      sectionId: finalSectionId!,
      studentId: lead.studentId,
      studentName: lead.studentName,
      studentEmail: lead.studentEmail!,
      studentPhone: lead.studentPhone,
      studentAge: lead.studentAge,
      studentMajor: lead.studentMajor,
      studentCountry: lead.studentCountry,
      confirmationStatus: "confirmed",
      paymentStatus: "pending",
      notes: lead.notes,
    });

    // حذف الـ Lead بعد التحويل الناجح
    await db.delete(courseLeads).where(eq(courseLeads.id, id));

    return NextResponse.json({
      message: "تم تحويل الطلب إلى تسجيل بنجاح",
      enrollmentId,
    });
  } catch (error: any) {
    console.error("Error converting lead to enrollment:", error);
    return NextResponse.json(
      { message: "فشل تحويل الطلب", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await db.delete(courseLeads).where(eq(courseLeads.id, id));
    return NextResponse.json({ message: "تم حذف الطلب بنجاح" });
  } catch (error: any) {
    console.error("Error deleting course lead:", error);
    return NextResponse.json(
      { message: "فشل حذف الطلب", error: error.message },
      { status: 500 }
    );
  }
}
