import React from "react";
import { db } from "@/src/db";
import {
  courses,
  courseSections,
  instructors,
  users,
  courseLeads,
  courseEnrollments,
} from "@/src/db/schema";
import Sections from "@/components/admin/courses/sections/Sections";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: " شعب بانتظار الموافقة",
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
      currentEnrollment: courseSections.currentEnrollment,
      instructorId: instructors.id,
      instructorName: instructors.name,
      instructorEmail: instructors.email,
      instructorSpecialty: instructors.specialty,

      // ✅ جلب عدد المهتمين (Leads)
      interestedCount: sql<number>`(
        SELECT count(*) 
        FROM ${courseLeads} 
        WHERE ${courseLeads.sectionId} = ${courseSections.id}
      )`.mapWith(Number),

      // ✅ جلب عدد المسجلين (Confirmed Enrollments)
      registeredCount: sql<number>`(
        SELECT count(*) 
        FROM ${courseEnrollments} 
        WHERE ${courseEnrollments.sectionId} = ${courseSections.id} 
        AND ${courseEnrollments.confirmationStatus} = 'confirmed'
      )`.mapWith(Number),
    })
    .from(courses)
    .where(eq(courseSections.status, "pending_approval"))
    .leftJoin(courseSections, eq(courses.id, courseSections.courseId))
    .leftJoin(instructors, eq(courseSections.instructorId, instructors.id));

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
        interestedCount: row.interestedCount ?? 0,
        registeredCount: row.registeredCount ?? 0,
        currentEnrollment: row.registeredCount ?? 0,
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

  return (
    <div>
      <Sections courses={courseList} role={role} userId={session.user.id} />
    </div>
  );
};

export default page;
