import CelenderOfDoctor from "@/components/instructor/CelenderOfDoctor";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import {
  courses,
  courseSections,
  instructors,
  meetings,
  users,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: "اللقاءات",
};
const page = async ({ params }: { params: { instructorId: string } }) => {
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
  const meetingofInstructor = await db
    .select({
      id: meetings.id,
      meetingNumber: meetings.meetingNumber,
      date: meetings.date,
      startTime: meetings.startTime,
      endTime: meetings.endTime,
      courseName: courses.title, // اسم الدورة
      sectionNumber: courseSections.sectionNumber, // رقم الشعبة
    })
    .from(meetings)
    .leftJoin(courses, eq(meetings.courseId, courses.id))
    .leftJoin(courseSections, eq(meetings.sectionId, courseSections.id))
    .where(eq(meetings.instructorId, session?.user.id));

  // جلب بيانات المحاضر نفسه
  const instructor = await db
    .select()
    .from(instructors)
    .where(eq(instructors.id, session?.user.id))
    .limit(1);

  console.log("Meetings:", meetingofInstructor);

  return (
    <div>
      <CelenderOfDoctor
        meetings={meetingofInstructor}
        instructor={instructor[0]}
      />
    </div>
  );
};

export default page;
