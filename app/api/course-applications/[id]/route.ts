import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseApplications, courseEnrollments } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.statusValue) {
      return NextResponse.json(
        { message: "الحالة مطلوبة" },
        { status: 400 }
      );
    }

    await db
      .update(courseApplications)
      .set({
        statusValue: body.statusValue,
        updatedAt: new Date(),
      })
      .where(eq(courseApplications.id, id));

    return NextResponse.json({ message: "تم تحديث الحالة بنجاح" });
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { message: "فشل تحديث الحالة", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sectionId } = body;

    if (!sectionId) {
      return NextResponse.json(
        { message: "يجب تحديد الشعبة المطلوبة للقبول" },
        { status: 400 }
      );
    }

    const application = await db.query.courseApplications.findFirst({
      where: eq(courseApplications.id, id),
      with: {
        user: true,
      }
    });

    if (!application) {
      return NextResponse.json({ message: "الطلب غير موجود" }, { status: 404 });
    }

    await db.insert(courseEnrollments).values({
      id: uuidv4(),
      sectionId: sectionId,
      studentId: application.userId,
      studentName: application.user.name ?? "",
      studentEmail: application.user.email ?? "",
      studentPhone: application.user.phone ?? null,
      studentAge: application.user.age ?? null,
      studentMajor: application.user.major ?? null,
      studentCountry: application.user.location ?? null,
      attendanceType: (application.attendanceType as any) ?? null,
      confirmationStatus: "confirmed",
      paymentStatus: "pending",
      notes: application.studentNotes,
    });

    await db.delete(courseApplications).where(eq(courseApplications.id, id));

    return NextResponse.json({ message: "تم قبول الطلب وتحويله لشعبة بنجاح" });
  } catch (error: any) {
    console.error("Error accepting application:", error);
    return NextResponse.json(
      { message: "فشل قبول الطلب", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await db.delete(courseApplications).where(eq(courseApplications.id, id));
    return NextResponse.json({ message: "تم حذف الطلب بنجاح" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "فشل حذف الطلب", error: error.message },
      { status: 500 }
    );
  }
}
