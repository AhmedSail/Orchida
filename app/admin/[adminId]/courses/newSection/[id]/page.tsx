import React from "react";
import { db } from "@/src/db";
import { courses, courseSections, instructors, users } from "@/src/db/schema";
import { eq, desc, InferSelectModel, and, gte, lte } from "drizzle-orm";
import NewSectionForm from "@/components/admin/courses/newSection";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المدير | شعبة جديدة",
};

export type Instructor = InferSelectModel<typeof instructors>;

const page = async ({ params }: { params: { id: string } }) => {
  const courseId = await params;

  // جلب الكورس
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId.id));

  if (!course.length) {
    return (
      <div className="p-6 text-center text-red-500">الكورس غير موجود ❌</div>
    );
  }

  // 1. جلب أعلى رقم شعبة في النطاق الوجاهي (1-1000)
  const lastWajahi = await db
    .select()
    .from(courseSections)
    .where(
      and(
        eq(courseSections.courseId, courseId.id),
        gte(courseSections.sectionNumber, 1),
        lte(courseSections.sectionNumber, 1000)
      )
    )
    .orderBy(desc(courseSections.sectionNumber))
    .limit(1);

  // 2. جلب أعلى رقم شعبة في النطاق المدمج (1001-2000)
  const lastHybrid = await db
    .select()
    .from(courseSections)
    .where(
      and(
        eq(courseSections.courseId, courseId.id),
        gte(courseSections.sectionNumber, 1001),
        lte(courseSections.sectionNumber, 2000)
      )
    )
    .orderBy(desc(courseSections.sectionNumber))
    .limit(1);

  const nextWajahi = lastWajahi.length ? lastWajahi[0].sectionNumber + 1 : 1;
  const nextHybrid = lastHybrid.length ? lastHybrid[0].sectionNumber + 1 : 1001;

  const instructor = await db.select().from(instructors);
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;

  return (
    <div>
      <NewSectionForm
        course={course[0]}
        nextWajahi={nextWajahi}
        nextHybrid={nextHybrid}
        instructor={instructor}
        role={role}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
