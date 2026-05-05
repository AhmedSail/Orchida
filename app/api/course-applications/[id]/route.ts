import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { courseApplications, courseEnrollments, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Fetch the application to get the userId
    const application = await db.query.courseApplications.findFirst({
      where: eq(courseApplications.id, id),
    });

    if (!application) {
      return NextResponse.json({ message: "الطلب غير موجود" }, { status: 404 });
    }

    // Update application details
    const appUpdateData: any = {
      updatedAt: new Date(),
    };

    if (body.statusValue) appUpdateData.statusValue = body.statusValue;
    if (body.courseId) appUpdateData.courseId = body.courseId;
    if (body.attendanceType) appUpdateData.attendanceType = body.attendanceType;
    if (body.studentNotes !== undefined) appUpdateData.studentNotes = body.studentNotes;
    if (body.adminNotes !== undefined) appUpdateData.adminNotes = body.adminNotes;

    await db
      .update(courseApplications)
      .set(appUpdateData)
      .where(eq(courseApplications.id, id));

    // Update user details if provided
    const userUpdateData: any = {
      updatedAt: new Date(),
    };

    let hasUserUpdates = false;
    if (body.name) { userUpdateData.name = body.name; hasUserUpdates = true; }
    if (body.email) { userUpdateData.email = body.email; hasUserUpdates = true; }
    if (body.phone) { userUpdateData.phone = body.phone; hasUserUpdates = true; }
    if (body.whatsapp !== undefined) { userUpdateData.whatsapp = body.whatsapp; hasUserUpdates = true; }
    if (body.major !== undefined) { userUpdateData.major = body.major; hasUserUpdates = true; }
    if (body.location !== undefined) { userUpdateData.location = body.location; hasUserUpdates = true; }
    if (body.age !== undefined) { userUpdateData.age = parseInt(body.age) || null; hasUserUpdates = true; }

    if (hasUserUpdates && application.userId) {
      await db
        .update(users)
        .set(userUpdateData)
        .where(eq(users.id, application.userId));
    }

    return NextResponse.json({ message: "تم تحديث البيانات بنجاح" });
  } catch (error: any) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { message: "فشل تحديث البيانات", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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
  { params }: { params: Promise<{ id: string }> }
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
