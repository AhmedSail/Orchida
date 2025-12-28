import React from "react";
import { db } from "@/src/db";
import {
  courseEnrollments,
  courses,
  courseSections,
  instructors,
  meetings,
  users,
} from "@/src/db/schema";
import Sections from "@/components/admin/courses/sections/Sections";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "كل الشعب",
};
const page = async () => {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,

      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      maxCapacity: courseSections.maxCapacity,
      status: courseSections.status,
      instructorId: instructors.id,
      instructorName: instructors.name,
      instructorEmail: instructors.email,
      instructorSpecialty: instructors.specialty,

      // ✅ عدّ الطلاب من جدول courseEnrollments
      studentCount: sql<number>`count(${courseEnrollments.id})`,
    })
    .from(courses)
    .leftJoin(courseSections, eq(courses.id, courseSections.courseId))
    .leftJoin(instructors, eq(courseSections.instructorId, instructors.id))
    .leftJoin(
      courseEnrollments,
      eq(courseEnrollments.sectionId, courseSections.id)
    )
    .groupBy(
      courses.id,
      courses.title,
      courses.description,
      courseSections.id,
      courseSections.sectionNumber,
      courseSections.startDate,
      courseSections.endDate,
      courseSections.maxCapacity,
      courseSections.status,
      instructors.id,
      instructors.name,
      instructors.email,
      instructors.specialty
    );

  // ✅ تحويل النتائج إلى الشكل المطلوب
  const courseList = rows.reduce((acc: any[], row) => {
    let course = acc.find((c) => c.id === row.id);
    if (!course) {
      course = {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        sections: [],
      };
      acc.push(course);
    }

    if (row.sectionId) {
      course.sections.push({
        id: row.sectionId,
        number: row.sectionNumber ?? 0,
        instructorId: row.instructorId ?? "",
        startDate: row.startDate
          ? row.startDate.toISOString().split("T")[0]
          : "",
        endDate: row.endDate ? row.endDate.toISOString().split("T")[0] : "",
        maxCapacity: row.maxCapacity ?? 0,
        instructorName: row.instructorName ?? "",
        instructorEmail: row.instructorEmail ?? "",
        instructorSpecialty: row.instructorSpecialty ?? "",
        status: row.status,
        currentEnrollment: row.studentCount ?? 0, // 👈 العدد الحقيقي من courseEnrollments
      });
    }

    return acc;
  }, []);
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

  // ✅ تحقق من الرول
  if (role !== "admin" && role !== "coordinator") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  for (const course of courseList) {
    for (const section of course.sections) {
      const sectionMeetings = await db
        .select()
        .from(meetings)
        .where(eq(meetings.sectionId, section.id));

      // ✅ احسب فقط اللقاءات المؤرشفة
      const archivedCount = sectionMeetings.filter(
        (m) => m.archived === true
      ).length;

      // ✅ إذا عدد اللقاءات المؤرشفة 3 أو أكثر → حدث الحالة إلى closed
      if (archivedCount >= 3 && section.status !== "closed") {
        await db
          .update(courseSections)
          .set({ status: "closed" })
          .where(eq(courseSections.id, section.id));

        section.status = "closed"; // حتى ينعكس مباشرة في الـ courseList
      }
    }
  }
  return (
    <div>
      <Sections courses={courseList} role={role} userId={session.user.id} />
    </div>
  );
};

export default page;
