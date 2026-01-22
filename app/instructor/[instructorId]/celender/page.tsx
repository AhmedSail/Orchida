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
const page = async ({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) => {
  const { instructorId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const meetingofInstructor = await db
    .select({
      id: meetings.id,
      meetingNumber: meetings.meetingNumber,
      date: meetings.date,
      startTime: meetings.startTime,
      endTime: meetings.endTime,
      courseName: courses.title,
      sectionNumber: courseSections.sectionNumber,
    })
    .from(meetings)
    .leftJoin(courses, eq(meetings.courseId, courses.id))
    .leftJoin(courseSections, eq(meetings.sectionId, courseSections.id))
    .where(eq(meetings.instructorId, instructorId));

  // جلب بيانات المحاضر المستهدف
  const instructor = await db
    .select()
    .from(instructors)
    .where(eq(instructors.id, instructorId))
    .limit(1);

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
