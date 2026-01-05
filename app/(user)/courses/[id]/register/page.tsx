import RegisterUser from "@/components/users/RegisterUser";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { courses, courseSections, instructors, users } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| تسجيل للدورة",
};
const page = async ({ params }: { params: { id: string } }) => {
  const courseId = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // جلب الكورس نفسه
  const coursesSelected = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId.id))
    .limit(1);
  const allUsers = await db.select().from(users);

  // جلب آخر شعبة مرتبطة بالكورس مع اسم المدرب
  const lastSectionRaw = await db
    .select({
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      instructorId: instructors.id,
      instructorName: instructors.name,
    })
    .from(courseSections)
    .leftJoin(instructors, eq(courseSections.instructorId, instructors.id))
    .where(eq(courseSections.courseId, courseId.id))
    .orderBy(desc(courseSections.createdAt))
    .limit(1);

  return (
    <div>
      <RegisterUser
        lastSectionRaw={lastSectionRaw[0]}
        user={session?.user!}
        coursesSelected={coursesSelected[0]}
        allUsers={allUsers}
      />
    </div>
  );
};

export default page;
