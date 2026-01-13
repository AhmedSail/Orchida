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
    canonical: "https://orchida-ods.com/courses",
  },
};

const page = async () => {
  // ✅ جلب الكورسات مع آخر شعبة فقط لكل كورس حسب تاريخ الإنشاء
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
    .groupBy(
      courses.id,
      courses.title,
      courses.description,
      courses.imageUrl,
      courses.hours,
      courses.price,
      courses.currency,
      courses.duration,
      courses.createdAt,
      courses.updatedAt,
      courses.approvedAt,
      courseSections.id,
      courseSections.sectionNumber,
      courseSections.startDate,
      courseSections.endDate,
      courseSections.status,
      courseSections.createdAt
    )
    .orderBy(desc(courseSections.createdAt));

  // ✅ تحويل النتيجة إلى UserCourse[]
  const allCourses: UserCourse[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    hours: row.hours,
    price: row.price,
    currency: row.currency,
    duration: row.duration,
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
        }
      : null,
  }));

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

  // ✅ فلترة الكورسات لتكون فريدة
  const uniqueCourses = allCourses.filter(
    (course, index, self) => index === self.findIndex((c) => c.id === course.id)
  );

  return (
    <div>
      <AllCourses
        allCourses={allCourses}
        studentStories={studentStories}
        uniqueCourses={uniqueCourses}
      />
    </div>
  );
};

export default page;
