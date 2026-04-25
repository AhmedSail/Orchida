import { db } from "@/src";
import { studentWorks, courses, users } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { Metadata } from "next";
import StudentWorksPage from "@/components/StudentWorksPage";

export const metadata: Metadata = {
  title: "أعمال الطلاب وقصص النجاح",
  description:
    "اطلع على إبداعات طلابنا وقصص نجاحهم في مختلف الدورات التدريبية.",
  alternates: {
    canonical: "https://www.orchida-ods.com/student-works",
  },
};

export default async function Page() {
  // جلب جميع أعمال الطلاب المعتمدة مع اسم الطالب وعنوان الكورس
  const worksData = await db
    .select({
      id: studentWorks.id,
      title: studentWorks.title,
      description: studentWorks.description,
      type: studentWorks.type,
      mediaUrl: studentWorks.mediaUrl,
      status: studentWorks.status,
      createdAt: studentWorks.createdAt,
      studentName: users.name,
      courseId: courses.id,
      courseTitle: courses.title,
    })
    .from(studentWorks)
    .leftJoin(users, eq(studentWorks.studentId, users.id))
    .leftJoin(courses, eq(studentWorks.courseId, courses.id))
    .where(eq(studentWorks.status, "approved"))
    .orderBy(desc(studentWorks.createdAt));

  // جلب الكورسات التي لها أعمال طلاب لاستخدامها في الفلتر
  const allCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
    })
    .from(courses)
    .where(eq(courses.isActive, true));

  return <StudentWorksPage initialWorks={worksData} allCourses={allCourses} />;
}
