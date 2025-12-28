import React from "react";
import { db } from "@/src/db";
import {
  attendance,
  courseEnrollments,
  meetings,
  users,
} from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import AttendanceTable from "@/components/attendence";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "الحضور والغياب",
};

const page = async ({ params }: { params: { id: string } }) => {
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
  if (role !== "admin") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  const param = await params;
  const sectionId = param.id;
  const students = await db
    .select({
      id: courseEnrollments.id,
      studentName: courseEnrollments.studentName,
      studentEmail: courseEnrollments.studentEmail,
      studentPhone: courseEnrollments.studentPhone,
    })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.sectionId, sectionId));
  const allMeetings = await db
    .select({
      id: meetings.id,
      meetingNumber: meetings.meetingNumber,
      date: meetings.date,
    })
    .from(meetings)
    .where(
      and(eq(meetings.sectionId, sectionId), eq(meetings.archived, false))
    );
  const attendanceRecords = await db
    .select({
      enrollmentId: attendance.enrollmentId,
      meetingId: attendance.meetingId,
      status: attendance.status,
    })
    .from(attendance)
    .innerJoin(meetings, eq(attendance.meetingId, meetings.id))
    .where(eq(meetings.sectionId, sectionId));
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📋 جدول الحضور والغياب</h1>

      {students.length === 0 || allMeetings.length === 0 ? (
        <p className="text-gray-500">
          ⚠️ لا يوجد طلاب أو لقاءات مسجلة لهذه الشعبة
        </p>
      ) : (
        <AttendanceTable
          students={students}
          meetings={allMeetings}
          attendanceRecords={attendanceRecords}
        />
      )}
    </div>
  );
};

export default page;
