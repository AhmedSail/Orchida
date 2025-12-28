import AllCourses from "@/components/users/AllCourses";
import { db } from "@/src/db";
import { courses, courseSections, studentWorks, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| الدورات",
};
const page = async () => {
  // ✅ جلب الكورسات مع الشعب المفتوحة فقط

  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      imageUrl: courses.imageUrl,
      hours: courses.hours,
      price: courses.price,
      duration: courses.duration,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      approvedAt: courses.approvedAt,
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      status: courseSections.status,
    })
    .from(courses)
    .leftJoin(courseSections, eq(courses.id, courseSections.courseId));

  const allCourses = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    hours: row.hours,
    price: row.price,
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
  const studentStories = await db
    .select({
      id: studentWorks.id,
      title: studentWorks.title,
      description: studentWorks.description,
      type: studentWorks.type,
      mediaUrl: studentWorks.mediaUrl,
      studentName: users.name,
      courseId: studentWorks.courseId,
    })
    .from(studentWorks)
    .innerJoin(users, eq(studentWorks.studentId, users.id))
    .where(eq(studentWorks.status, "approved"))
    .limit(6);
  return (
    <div>
      <AllCourses allCourses={allCourses} studentStories={studentStories} />
    </div>
  );
};

export default page;
