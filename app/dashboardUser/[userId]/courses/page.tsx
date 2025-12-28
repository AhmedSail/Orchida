import React from "react";
import { db } from "@/src/db";
import {
  courseEnrollments,
  courses,
  courseSections,
  meetings,
  users,
} from "@/src/db/schema";
import { eq, and, gt, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HomeInstructor from "@/components/instructor/HomeInstructor";
import HomeUser from "@/components/user/dashboard/HomeUser";
import CourseUser from "@/components/user/dashboard/CourseUser";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة الطالب",
  description: "الشعب الخاصة بك",
};
const Page = async ({ params }: { params: { instructorId: string } }) => {
  // ✅ جلب السيشن
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
  if (role !== "user") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }

  // ✅ لو المستخدم طالب
  if (role === "user") {
    // الكورسات المسجل فيها
    // الكورسات المسجل فيها
    const enrollments = await db
      .select({
        enrollmentId: courseEnrollments.id,
        sectionId: courseEnrollments.sectionId,
        courseTitle: courses.title,
        sectionNumber: courseSections.sectionNumber,
      })
      .from(courseEnrollments)
      .leftJoin(
        courseSections,
        eq(courseEnrollments.sectionId, courseSections.id)
      )
      .leftJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(courseEnrollments.studentId, session.user.id));

    // استخراج sectionIds
    const sectionIds = enrollments.map((e) => e.sectionId);

    return <CourseUser enrollments={enrollments} userId={session.user.id} />;
  }
};

export default Page;
