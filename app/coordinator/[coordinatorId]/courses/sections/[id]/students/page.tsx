import React from "react";
import { db } from "@/src/db";
import {
  courseEnrollments,
  courseSections,
  courses,
  meetings,
  users,
  courseLeads,
  instructors,
} from "@/src/db/schema";
import { eq, and, sql, ne, inArray } from "drizzle-orm";
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

  // ✅ جلب بيانات المستخدم من DB
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;

  // ✅ جلب الطلاب المسجلين في الشعبة
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

  // ✅ مواءمة البيانات مع نوع Student المتوقع في StudentsTable
  const studentsWithType = students.map((s) => ({
    ...s,
    type: "registered" as const,
  }));

  // ✅ جلب بيانات الدورة للشعبة الحالية
  const currentSection = await db.query.courseSections.findFirst({
    where: eq(courseSections.id, param.id),
    with: {
      course: true,
    },
  });

  if (!currentSection) {
    redirect("/");
  }

  // ✅ جلب المهتمين في هذه الشعبة
  const currentLeads = await db
    .select({
      id: courseLeads.id,
      studentId: courseLeads.studentId,
      studentName: courseLeads.studentName,
      studentEmail: courseLeads.studentEmail,
      studentPhone: courseLeads.studentPhone,
      registeredAt: courseLeads.createdAt,
      notes: courseLeads.notes,
      status: courseLeads.status,
      studentMajor: courseLeads.studentMajor,
      studentCountry: courseLeads.studentCountry,
    })
    .from(courseLeads)
    .where(eq(courseLeads.sectionId, param.id));

  // ✅ جلب المهتمين من الشعب السابقة لنفس الدورة
  const potentialStatuses = [
    "new",
    "future_course",
    "wants_online",
    "high_price",
    "no_response",
    "far_location",
    "cancel_reg",
    "focal_course",
  ];

  const allLeadsForCourse = await db
    .select({
      id: courseLeads.id,
      studentId: courseLeads.studentId,
      studentName: courseLeads.studentName,
      studentEmail: courseLeads.studentEmail,
      studentPhone: courseLeads.studentPhone,
      registeredAt: courseLeads.createdAt,
      notes: courseLeads.notes,
      status: courseLeads.status,
      studentMajor: courseLeads.studentMajor,
      studentCountry: courseLeads.studentCountry,
      sectionId: courseLeads.sectionId,
      originalSectionNumber: courseSections.sectionNumber,
    })
    .from(courseLeads)
    .leftJoin(courseSections, eq(courseLeads.sectionId, courseSections.id))
    .where(
      and(
        eq(courseLeads.courseId, currentSection.courseId),
        ne(courseLeads.sectionId, param.id),
        inArray(courseLeads.status, potentialStatuses),
      ),
    )
    .orderBy(sql`${courseLeads.createdAt} DESC`);

  const negativeStatuses = [
    "no_response",
    "high_price",
    "far_location",
    "cancel_reg",
  ];

  const negativeStats = await db
    .select({
      email: courseLeads.studentEmail,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(courseLeads)
    .where(
      and(
        eq(courseLeads.courseId, currentSection.courseId),
        inArray(courseLeads.status, negativeStatuses),
      ),
    )
    .groupBy(courseLeads.studentEmail);

  const negativeMap = new Map(
    negativeStats.map((s) => [s.email, Number(s.count)]),
  );

  const seenEmails = new Set();
  const latestLeadsPerStudent = allLeadsForCourse.filter((lead) => {
    if (!lead.studentEmail || seenEmails.has(lead.studentEmail)) return false;
    seenEmails.add(lead.studentEmail);
    return true;
  });

  const filteredOldLeads = latestLeadsPerStudent.filter((lead: any) => {
    const totalNegative = negativeMap.get(lead.studentEmail) || 0;
    if (negativeStatuses.includes(lead.status) && totalNegative >= 2)
      return false;

    const existsInCurrent =
      students.some((e: any) => e.studentEmail === lead.studentEmail) ||
      currentLeads.some((l: any) => l.studentEmail === lead.studentEmail);
    return !existsInCurrent;
  });

  // ✅ دمج الكل في قائمة واحدة
  const allStudents = [
    ...students.map((s: any) => ({ ...s, type: "registered" as const })),
    ...currentLeads.map((l: any) => ({
      ...l,
      type: "interested" as const,
      paymentStatus: "pending" as const,
      confirmationStatus: "pending" as const,
      IBAN: null,
    })),
    ...filteredOldLeads.map((l: any) => ({
      ...l,
      type: "interested" as const,
      paymentStatus: "pending" as const,
      confirmationStatus: "pending" as const,
      IBAN: null,
      isSuggested: true,
      previousStatus: l.status,
      originalSectionNumber: l.originalSectionNumber,
      status: "new",
    })),
  ];

  // ✅ جلب جميع شعب الدورة ليتمكن من النقل إليها
  const allCourseSections = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      instructorName: instructors.name,
    })
    .from(courseSections)
    .leftJoin(instructors, eq(courseSections.instructorId, instructors.id))
    .where(eq(courseSections.courseId, currentSection.courseId));

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
          eq(courseEnrollments.paymentStatus, "pending"), // الطلاب اللي مش دافعين
        ),
      );
  }

  // ✅ عدد الطلاب
  const studentCount = studentsWithType.length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="md:text-2xl font-bold">
        الطلاب في {currentSection.course.title} - الشعبة{" "}
        {currentSection.sectionNumber} (إجمالي: {allStudents.length})
      </h1>

      {/* جدول الطلاب */}
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
