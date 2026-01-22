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

import HomeUser from "@/components/user/dashboard/HomeUser";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة الطالب",
  description: "لوحة التحكم",
};

const Page = async ({ params }: { params: { userId: string } }) => {
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

  // ✅ لو المستخدم طالب
  if (role === "user") {
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
        eq(courseEnrollments.sectionId, courseSections.id),
      )
      .leftJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(courseEnrollments.studentId, session.user.id));

    // استخراج sectionIds
    const sectionIds = enrollments.map((e) => e.sectionId);

    // اللقاءات القادمة فقط للشُعب اللي الطالب مسجل فيها
    let upcomingMeetings: any[] = [];
    if (sectionIds.length > 0) {
      // Only query if there are enrolled sections to avoid SQL error with empty array
      upcomingMeetings = await db
        .select({
          id: meetings.id,
          sectionId: meetings.sectionId,
          courseTitle: courses.title,
          sectionNumber: courseSections.sectionNumber,
          date: meetings.date,
          startTime: meetings.startTime,
          endTime: meetings.endTime,
          location: meetings.location,
        })
        .from(meetings)
        .leftJoin(courseSections, eq(meetings.sectionId, courseSections.id))
        .leftJoin(courses, eq(courseSections.courseId, courses.id))
        .where(
          and(
            gt(meetings.date, new Date()),
            inArray(meetings.sectionId, sectionIds), // ✅ فلترة اللقاءات حسب الشُعب المسجل فيها الطالب
          ),
        );
    }

    return (
      <HomeUser
        userName={session.user.name}
        enrollments={enrollments}
        meetings={upcomingMeetings}
      />
    );
  }
};

export default Page;
