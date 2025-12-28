import CourseSelected from "@/components/users/CourseSelected";
import { db } from "@/src/db";
import { courses, courseSections, instructors } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import React from "react";
type Instructor = {
  id: string | null; // معرف المدرّس
  name: string; // اسم المدرّس
  email?: string; // إيميل (اختياري)
  phone?: string; // رقم هاتف (اختياري)
  bio?: string; // نبذة (اختياري)
};
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| الدورة التدريبية",
};
const page = async ({ params }: { params: { id: string } }) => {
  const courseId = await params;

  // جلب الكورس نفسه
  const coursesSelected = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId.id))
    .limit(1);

  // جلب آخر شعبة مرتبطة بالكورس مع اسم المدرب
  const lastSectionRaw = await db
    .select({
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      instructorId: instructors.id,
      instructorName: instructors.name,
      status: courseSections.status,
    })
    .from(courseSections)
    .leftJoin(instructors, eq(courseSections.instructorId, instructors.id))
    .where(eq(courseSections.courseId, courseId.id))
    .orderBy(desc(courseSections.createdAt))
    .limit(1);

  // تحويل النتيجة إلى Instructor
  const lastInstructor: Instructor | undefined = lastSectionRaw[0]
    ? {
        id: lastSectionRaw[0].instructorId,
        name: lastSectionRaw[0].instructorName ?? "غير محدد",
      }
    : undefined;

  const lastSection = lastSectionRaw[0]
    ? {
        id: lastSectionRaw[0].sectionId,
        number: lastSectionRaw[0].sectionNumber,
        instructor: {
          id: lastSectionRaw[0].instructorId,
          name: lastSectionRaw[0].instructorName ?? "غير محدد",
        },
        status: lastSectionRaw[0].status,
      }
    : undefined;

  return (
    <div>
      <CourseSelected
        coursesSelected={coursesSelected[0]}
        lastInstructor={lastInstructor}
        lastSection={lastSection}
      />
    </div>
  );
};

export default page;
