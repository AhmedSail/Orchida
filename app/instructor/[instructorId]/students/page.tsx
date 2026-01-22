import React from "react";
import { db } from "@/src/db";
import {
  courses,
  courseSections,
  courseEnrollments,
  instructors,
  users,
} from "@/src/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import InstructorStudentsPage from "@/components/instructor/InstructorStudentsPage";

export const metadata: Metadata = {
  title: "طلاب المدرب | لوحة التحكم",
  description: "عرض قائمة الطلاب المسجلين في دوراتي",
};

const Page = async ({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) => {
  const { instructorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const role = session.user.role;
  const isAdmin = role === "admin";
  const isOwner = session.user.id === instructorId;

  // Fetch sections for this instructor
  const sections = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      courseTitle: courses.title,
      status: courseSections.status,
    })
    .from(courseSections)
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.instructorId, instructorId));

  const sectionIds = sections.map((s) => s.id);

  let enrollments: any[] = [];
  if (sectionIds.length > 0) {
    enrollments = await db
      .select({
        id: courseEnrollments.id,
        studentName: courseEnrollments.studentName,
        studentEmail: courseEnrollments.studentEmail,
        studentPhone: courseEnrollments.studentPhone,
        sectionId: courseEnrollments.sectionId,
        registrationNumber: courseEnrollments.registrationNumber,
        paymentStatus: courseEnrollments.paymentStatus,
        confirmationStatus: courseEnrollments.confirmationStatus,
        registeredAt: courseEnrollments.registeredAt,
      })
      .from(courseEnrollments)
      .where(
        and(
          inArray(courseEnrollments.sectionId, sectionIds),
          eq(courseEnrollments.isCancelled, false),
        ),
      );
  }

  // Map enrollments to their sections
  const instructorStudents = enrollments.map((enr) => {
    const section = sections.find((s) => s.id === enr.sectionId);
    return {
      ...enr,
      courseTitle: section?.courseTitle || "غير معروف",
      sectionNumber: section?.sectionNumber || 0,
    };
  });

  // Fetch target instructor data for the UI
  const targetInstructor = await db
    .select()
    .from(users)
    .where(eq(users.id, instructorId))
    .limit(1);

  return (
    <InstructorStudentsPage
      students={instructorStudents}
      instructorName={targetInstructor[0]?.name || "المدرب"}
    />
  );
};

export default Page;
