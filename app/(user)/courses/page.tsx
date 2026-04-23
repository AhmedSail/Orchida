import AllCourses, { UserCourse } from "@/components/users/AllCourses";
import { db } from "@/src/db";
import { courses, courseSections, studentWorks, users } from "@/src/db/schema";
import { eq, desc, sql } from "drizzle-orm";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "أوركيدة | الدورات التدريبية",
  description:
    "تصفح دوراتنا التدريبية المتميزة في مختلف المجالات التقنية والإبداعية.",
  alternates: {
    canonical: "https://www.orchida-ods.com/courses",
  },
};

const page = async () => {
  // ✅ جلب إعدادات الشركة لمعرفة إذا كان نظام الطابور مفعلاً
  const companyData = await db.query.companies.findFirst();
  const useQueueSystem = companyData?.useQueueSystem ?? false;

  // ✅ جلب الكورسات مع آخر شعبة (اختياري) لكل كورس
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      imageUrl: courses.imageUrl,
      hours: courses.hours,
      price: courses.price,
      currency: courses.currency,
      duration: courses.duration,
      isActive: courses.isActive,
      sectionIsFree: courseSections.isFree,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      approvedAt: courses.approvedAt,
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      status: courseSections.status,
      sectionCreatedAt: courseSections.createdAt,
    })
    .from(courses)
    .leftJoin(courseSections, eq(courses.id, courseSections.courseId))
    .where(eq(courses.isActive, true)) // فقط الكورسات النشطة
    .orderBy(desc(courseSections.createdAt));

  // ✅ تحويل النتيجة إلى UserCourse[] مع ضمان تفرد الكورس
  const courseMap = new Map<string, UserCourse>();
  
  rows.forEach((row) => {
    if (!courseMap.has(row.id)) {
      courseMap.set(row.id, {
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.imageUrl,
        hours: row.hours,
        price: row.price,
        currency: row.currency,
        duration: row.duration,
        isActive: row.isActive,
        isFree: row.sectionIsFree ?? false,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        approvedAt: row.approvedAt,
        section: row.sectionId
          ? {
              id: row.sectionId,
              number: row.sectionNumber ?? 0,
              startDate: row.startDate
                ? row.startDate.toISOString().split("T")[0]
                : "",
              endDate: row.endDate ? row.endDate.toISOString().split("T")[0] : "",
              status: row.status,
              isFree: row.sectionIsFree ?? false,
            }
          : null,
      });
    }
  });

  const allCourses = Array.from(courseMap.values());

  // ✅ جلب أعمال الطلاب
  const studentStories = await db
    .select({
      id: studentWorks.id,
      title: studentWorks.title,
      description: studentWorks.description,
      type: studentWorks.type,
      mediaUrl: studentWorks.mediaUrl,
      studentName: users.name,
      courseId: studentWorks.courseId,
      sectionId: studentWorks.sectionId,
      sectionNumber: courseSections.sectionNumber,
    })
    .from(studentWorks)
    .innerJoin(users, eq(studentWorks.studentId, users.id))
    .leftJoin(courseSections, eq(studentWorks.sectionId, courseSections.id))
    .where(eq(studentWorks.status, "approved"))
    .limit(20);

  // ✅ فلترة الكورسات لتكون فريدة (للاستخدام في التبويبات)
  const uniqueCourses = allCourses;

  return (
    <div>
      <AllCourses
        allCourses={allCourses}
        studentStories={studentStories}
        uniqueCourses={uniqueCourses}
        useQueueSystem={useQueueSystem}
      />
    </div>
  );
};

export default page;
