// 📍 المسار: src/app/coordinator/[coordinatorId]/courses/sections/[id]/calendar/page.tsx (أو مسارك الصحيح)

import React from "react";
import { db } from "@/src/db"; // تأكد من صحة هذا المسار
import { courses, courseSections, meetings, users } from "@/src/db/schema"; // تأكد من صحة هذا المسار
import { eq } from "drizzle-orm";
import { JoinedMeeting } from "@/components/MeetingScheduler/useMeetingScheduler";
import AddNewMeeting from "@/components/coordinator/AddNewMeeting";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export const metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "اضافة لقاءات",
};

// هذا مكون سيرفر (Server Component) لجلب البيانات
const CalendarPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
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
  // 1. جلب بيانات الشعبة الحالية
  const currentSection = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.id, id))
    .limit(1);

  if (!currentSection) {
    return <div>لم يتم العثور على الشعبة.</div>;
  }

  // 2. جلب ساعات الكورس
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, currentSection[0].courseId))
    .limit(1);

  const courseHours = course?.[0].hours ?? 0;

  const allMeetings: JoinedMeeting[] = await db
    .select()
    .from(meetings)
    .leftJoin(courseSections, eq(meetings.sectionId, courseSections.id));

  return (
    <div>
      {/* 4. تمرير البيانات إلى المكون العميل */}
      <AddNewMeeting
        section={currentSection[0]}
        AllMeetings={allMeetings}
        courseHours={courseHours}
        userId={session.user.id}
      />
    </div>
  );
};

export default CalendarPage;
