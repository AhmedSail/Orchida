import MeetingsTable from "@/components/admin/MeetingsTable/MeetingsTable";
import { db } from "@/src/db";
import { meetings, courses, courseSections, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { InferSelectModel } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: " اللقاءات",
};
// النوع الأساسي للجدول meetings
export type Meeting = InferSelectModel<typeof meetings>;

// النوع الأساسي للجدول courseSections
export type SectionType = InferSelectModel<typeof courseSections>;

// النوع الأساسي للجدول courses
export type CourseType = InferSelectModel<typeof courses>;

// النوع النهائي بعد الـ join
export type JoinedMeeting = {
  meetings: Meeting; // بيانات اللقاء
  courseSections: SectionType | null; // بيانات الشعبة (قد تكون null لو ما فيه join)
  courses: CourseType | null; // بيانات الدورة (قد تكون null لو ما فيه join)
};
const page = async () => {
  // ✅ جلب اللقاءات مع اسم الدورة ورقم الشعبة
  const allMeetings = await db
    .select({
      id: meetings.id,
      meetingNumber: meetings.meetingNumber,
      date: meetings.date,
      startTime: meetings.startTime,
      endTime: meetings.endTime,
      location: meetings.location,
      studentsCount: meetings.studentsCount,
      notes: meetings.notes,
      courseTitle: courses.title, // اسم الدورة
      sectionNumber: courseSections.sectionNumber, // رقم الشعبة
    })
    .from(meetings)
    .leftJoin(courseSections, eq(meetings.sectionId, courseSections.id))
    .leftJoin(courses, eq(meetings.courseId, courses.id));
  const AllCourses = await db.select().from(courses);
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
  if (role !== "coordinator") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  return (
    <div>
      <MeetingsTable meetings={allMeetings} courses={AllCourses} />
    </div>
  );
};

export default page;
