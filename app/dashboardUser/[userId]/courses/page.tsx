import React from "react";
import { db } from "@/src/db";
import {
  courseEnrollments,
  courses,
  courseSections,
  users,
  courseApplications,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import CourseUser from "@/components/user/dashboard/CourseUser";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة الطالب",
  description: "الشعب الخاصة بك",
};

const Page = async ({ params }: { params: { userId: string } }) => {
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

  if (role === "user" || role === "guest") {
    // 1. الكورسات المسجل فيها رسمياً
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
        eq(courseEnrollments.sectionId, courseSections.id),
      )
      .leftJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(courseEnrollments.studentId, session.user.id));

    // 2. طلبات الالتحاق - الاعتماد كلياً على النظام الجديد (courseApplications)
    // تم إلغاء استخدام courseLeads بناءً على طلب المستخدم
    const applications = await db.query.courseApplications.findMany({
      where: (apps, { eq }) => eq(apps.userId, session.user.id),
      with: {
        course: true,
      },
    });

    return (
      <CourseUser 
        enrollments={enrollments} 
        applications={applications as any}
        userId={session.user.id} 
      />
    );
  }
};

export default Page;
