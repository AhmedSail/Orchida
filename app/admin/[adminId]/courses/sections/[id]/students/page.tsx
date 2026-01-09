import React from "react";
import { db } from "@/src/db";
import {
  courseEnrollments,
  courseSections,
  courses,
  meetings,
  users,
} from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import StudentsTable from "@/components/StudentsTable";
export const metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "الطلاب المسجلين",
};

const Page = async ({ params }: { params: { id: string } }) => {
  const param = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  // ✅ جلب الطلاب المسجلين في الشعبة
  const students = await db
    .select({
      id: courseEnrollments.id,
      studentId: courseEnrollments.studentId,
      studentName: courseEnrollments.studentName,
      studentEmail: courseEnrollments.studentEmail,
      studentPhone: courseEnrollments.studentPhone,
      paymentStatus: courseEnrollments.paymentStatus,
      confirmationStatus: courseEnrollments.confirmationStatus,
      registeredAt: courseEnrollments.registeredAt,
      isReceiptUploaded: courseEnrollments.isReceiptUploaded,
      paymentReceiptUrl: courseEnrollments.paymentReceiptUrl,
      IBAN: courseEnrollments.IBAN,
      notes: courseEnrollments.notes,
    })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.sectionId, param.id));

  // ✅ جلب بيانات الشعبة والدورة
  const sectionInfo = await db
    .select({
      sectionNumber: courseSections.sectionNumber,
      courseTitle: courses.title,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.id, param.id))
    .limit(1);

  // ✅ جلب اللقاءات الخاصة بالشعبة
  const sectionMeetings = await db
    .select({
      id: meetings.id,
      archived: meetings.archived,
    })
    .from(meetings)
    .where(eq(meetings.sectionId, param.id));

  // ✅ عد اللقاءات المؤرشفة
  const archivedCount = sectionMeetings.filter((m) => m.archived).length;

  // ✅ إذا كانت اللقاءات المؤرشفة = 3 → تحديث الطلاب غير المدفوعين
  if (archivedCount === 3) {
    await db
      .update(courseEnrollments)
      .set({ confirmationStatus: "pending" })
      .where(
        and(
          eq(courseEnrollments.sectionId, param.id),
          eq(courseEnrollments.paymentStatus, "pending") // الطلاب اللي مش دافعين
        )
      );
  }

  // ✅ عدد الطلاب
  const studentCount = students.length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="md:text-2xl font-bold">
        الطلاب المسجلين في {sectionInfo[0]?.courseTitle} - الشعبة{" "}
        {sectionInfo[0]?.sectionNumber}
      </h1>

      {/* جدول الطلاب */}
      <StudentsTable students={students} />
    </div>
  );
};

export default Page;
