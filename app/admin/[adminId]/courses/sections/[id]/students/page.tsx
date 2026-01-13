import { db } from "@/src/db";
import {
  courseEnrollments,
  courseSections,
  courses,
  meetings,
  users,
  courseLeads,
} from "@/src/db/schema";
import { eq, and, sql, ne, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import StudentsTable from "@/components/StudentsTable";
import { Badge } from "@/components/ui/badge";

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

  // 1. جلب بيانات الشعبة الحالية لمعرفة الدورة
  const currentSection = await db.query.courseSections.findFirst({
    where: eq(courseSections.id, param.id),
    with: {
      course: true,
    },
  });

  if (!currentSection) {
    redirect("/admin");
  }

  // 2. جلب الطلاب المسجلين (Enrollments)
  const enrollments = await db
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

  // 3. جلب المهتمين في هذه الشعبة
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

  // 4. جلب المهتمين من الشعب السابقة لنفس الدورة
  // الحالات المطلوبة: جديد، يريد القادمة، اونلاين، سعر مرتفع، لم يرد
  const potentialStatuses = [
    "new",
    "future_course",
    "wants_online",
    "high_price",
    "no_response",
    "far_location",
    "cancel_reg",
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
        inArray(courseLeads.status, potentialStatuses)
      )
    )
    .orderBy(sql`${courseLeads.createdAt} DESC`);

  // 5. منطق تصفية ذكي: نأخذ أحدث حالة لكل طالب ونحسب تكرار الحالات السلبية
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
        inArray(courseLeads.status, negativeStatuses)
      )
    )
    .groupBy(courseLeads.studentEmail);

  const negativeMap = new Map(
    negativeStats.map((s) => [s.email, Number(s.count)])
  );

  // تصفية للحصول على أحدث سجل لكل إيميل فقط
  const seenEmails = new Set();
  const latestLeadsPerStudent = allLeadsForCourse.filter((lead) => {
    if (!lead.studentEmail || seenEmails.has(lead.studentEmail)) return false;
    seenEmails.add(lead.studentEmail);
    return true;
  });

  const filteredOldLeads = latestLeadsPerStudent.filter((lead: any) => {
    const totalNegative = negativeMap.get(lead.studentEmail) || 0;

    // استبعاد إذا كانت أحدث حالة سلبية (لم يرد، سعر عالي، إلخ) وتكررت الحالات السلبية مرتين أو أكثر
    if (negativeStatuses.includes(lead.status) && totalNegative >= 2) {
      return false;
    }

    // استبعاد إذا كان موجود فعلياً في الشعبة الحالية (بناءً على الإيميل)
    const existsInCurrent =
      enrollments.some((e: any) => e.studentEmail === lead.studentEmail) ||
      currentLeads.some((l: any) => l.studentEmail === lead.studentEmail);
    return !existsInCurrent;
  });

  // 6. دمج الكل في قائمة واحدة
  const allStudents = [
    ...enrollments.map((s: any) => ({ ...s, type: "registered" as const })),
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
      isSuggested: true, // علامة لتمييزهم بأنهم من شعب سابقة
      previousStatus: l.status,
      originalSectionNumber: l.originalSectionNumber,
      status: "new", // في الشعبة الجديدة نعتبر حالته "جديد" للبدء معه من جديد
    })),
  ];

  // ✅ جلب اللقاءات الخاصة بالشعبة للمنطق التلقائي
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
          eq(courseEnrollments.paymentStatus, "pending")
        )
      );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentSection.course.title}
          </h1>
          <p className="text-gray-500">
            لوحة إدارة الشعبة رقم {currentSection.sectionNumber}
          </p>
        </div>
        <Badge
          variant={"outline"}
          className="text-sm font-medium px-4 py-1 rounded-full border-blue-200 bg-blue-50 text-blue-700"
        >
          إجمالي: {allStudents.length} (مسجل: {enrollments.length} | مهتم:{" "}
          {currentLeads.length + filteredOldLeads.length})
        </Badge>
      </div>

      {/* جدول الطلاب */}
      <StudentsTable
        students={allStudents}
        currentSectionId={param.id}
        courseId={currentSection.courseId}
      />
    </div>
  );
};

export default Page;
