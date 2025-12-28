import MeetingsTable from "@/components/admin/MeetingsTable/MeetingsTable";
import { db } from "@/src/db";
import { meetings, courses, courseSections } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { InferSelectModel } from "drizzle-orm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المدير | اللقاءات",
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
  return (
    <div>
      <MeetingsTable meetings={allMeetings} courses={AllCourses} />
    </div>
  );
};

export default page;
