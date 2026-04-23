import React from "react";
import { db } from "@/src/db";
import {
  courseEnrollments,
  courseSections,
  courses,
  meetings,
  users,
  courseApplications,
  instructors,
} from "@/src/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
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
    redirect("/sign-in");
  }

  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;

  // 1. جلب الطلاب المسجلين فعلياً في هذه الشعبة
  const students = await db
    .select({
      id: courseEnrollments.id,
      studentId: courseEnrollments.studentId,
      studentName: courseEnrollments.studentName,
      studentEmail: courseEnrollments.studentEmail,
      studentPhone: courseEnrollments.studentPhone,
      studentMajor: courseEnrollments.studentMajor,
      studentCountry: courseEnrollments.studentCountry,
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

  // 2. جلب بيانات الدورة للشعبة الحالية
  const currentSection = await db.query.courseSections.findFirst({
    where: eq(courseSections.id, param.id),
    with: {
      course: true,
    },
  });

  if (!currentSection) {
    redirect("/");
  }

  // 3. جلب طلبات الالتحاق (Applications) لنفس الدورة (النظام الجديد)
  // تم استبدال courseLeads بـ courseApplications بناءً على التحديث الجديد
  const applications = await db.query.courseApplications.findMany({
    where: eq(courseApplications.courseId, currentSection.courseId),
    with: {
      user: true,
    }
  });

  // تصفية الطلبات: استبعاد الطلاب المسجلين بالفعل في أي شعبة لهذه الدورة
  const registeredEmailsInCourse = (await db
    .select({ email: courseEnrollments.studentEmail })
    .from(courseEnrollments)
    .innerJoin(courseSections, eq(courseEnrollments.sectionId, courseSections.id))
    .where(eq(courseSections.courseId, currentSection.courseId)))
    .map(e => e.email);

  const filteredApplications = applications.filter(app => 
    app.user?.email && !registeredEmailsInCourse.includes(app.user.email)
  );

  // 4. دمج الطلاب المسجلين مع المهتمين (Applications)
  const allStudents = [
    ...students.map((s: any) => ({ ...s, type: "registered" as const })),
    ...filteredApplications.map((app: any) => ({
      id: app.id,
      studentId: app.userId,
      studentName: app.user?.name || "بدون اسم",
      studentEmail: app.user?.email || "",
      studentPhone: app.user?.phone || "",
      registeredAt: app.createdAt,
      type: "interested" as const,
      paymentStatus: "pending" as const,
      confirmationStatus: "pending" as const,
      IBAN: null,
      notes: app.studentNotes,
      status: app.statusValue || "new",
      studentMajor: app.user?.major,
      studentCountry: app.user?.location,
    })),
  ];

  // 5. جلب جميع شعب الدورة للنقل
  const allCourseSections = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      instructorName: instructors.name,
    })
    .from(courseSections)
    .leftJoin(instructors, eq(courseSections.instructorId, instructors.id))
    .where(eq(courseSections.courseId, currentSection.courseId));

  // 6. منطق اللقاءات المؤرشفة (لم يتغير)
  const sectionMeetings = await db
    .select({ id: meetings.id, archived: meetings.archived })
    .from(meetings)
    .where(eq(meetings.sectionId, param.id));

  const archivedCount = sectionMeetings.filter((m) => m.archived).length;
  if (archivedCount === 3) {
    await db
      .update(courseEnrollments)
      .set({ confirmationStatus: "pending" })
      .where(
        and(
          eq(courseEnrollments.sectionId, param.id),
          eq(courseEnrollments.paymentStatus, "pending"),
        ),
      );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="md:text-2xl font-bold">
        الطلاب في {currentSection.course.title} - الشعبة{" "}
        {currentSection.sectionNumber} (إجمالي: {allStudents.length})
      </h1>

      <StudentsTable
        students={allStudents as any}
        currentSectionId={param.id}
        courseId={currentSection.courseId}
        allSections={allCourseSections.map((s) => ({
          id: s.id,
          sectionNumber: s.sectionNumber,
          instructorName: s.instructorName || "بدون مدرب",
        }))}
      />
    </div>
  );
};

export default Page;
