import React from "react";
import { db } from "@/src/db";
import {
  courses,
  courseSections,
  instructors,
  meetings,
  users,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewInstructorForm from "@/components/admin/instructor/NewInstructorForm";
import HomeInstructor from "@/components/instructor/HomeInstructor";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: "الرئيسية",
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
  if (role !== "instructor") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }

  // ✅ لو المستخدم مدرب
  if (role === "instructor") {
    const instructorRecord = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, session.user.id));

    const instructor = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));
    const instructorSections = await db
      .select({
        sectionId: courseSections.id,
        sectionNumber: courseSections.sectionNumber,
        startDate: courseSections.startDate,
        endDate: courseSections.endDate,
        courseTitle: courses.title, // 👈 اسم الكورس
      })
      .from(courseSections)
      .leftJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(courseSections.instructorId, session.user.id));
    const instructorMeetings = await db
      .select({
        meetingId: meetings.id,
        meetingDate: meetings.date,
        meetingStartTime: meetings.startTime,
        meetingEndTime: meetings.endTime,
        meetingNotes: meetings.notes,
        sectionId: courseSections.id,
        sectionNumber: courseSections.sectionNumber,
        courseTitle: courses.title,
      })
      .from(meetings)
      .leftJoin(courseSections, eq(meetings.sectionId, courseSections.id)) // ربط اللقاء بالشعبة
      .leftJoin(courses, eq(courseSections.courseId, courses.id)) // ربط الشعبة بالكورس
      .where(eq(meetings.instructorId, session.user.id));
    if (!instructorRecord.length) {
      // 👈 المدرب ما كمل بياناته
      return <NewInstructorForm instructor={instructor[0]} />;
    } else {
      // 👈 المدرب مكمل بياناته
      return (
        <HomeInstructor
          instructorRecord={instructorRecord[0]}
          instructorSections={instructorSections}
          instructorMeetings={instructorMeetings}
        />
      );
    }
  }
};

export default Page;
