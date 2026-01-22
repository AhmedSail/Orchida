// 📍 src/app/instructor/[instructorId]/page.tsx
import React from "react";
import { db } from "@/src/db";
import { courses, courseSections, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CoursePage from "@/components/instructor/CoursePage";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: " الشعب",
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

  const instructorSections = await db
    .select({
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      courseStatus: courseSections.status,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.instructorId, instructorId));

  return (
    <div>
      <CoursePage
        instructorSections={instructorSections}
        userId={instructorId}
      />
    </div>
  );
};

export default page;
