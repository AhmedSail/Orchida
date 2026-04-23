import React from "react";
import { db } from "@/src";
import {
  courses,
  courseSections,
  users,
  courseLeads,
  courseApplications,
} from "@/src/db/schema";

import { inArray, InferSelectModel } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import OurCourses from "@/components/admin/courses/ourCourses";
import { CourseWithSections } from "@/app/coordinator/[coordinatorId]/courses/page";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المدير | الدورات",
};
export type Courses = InferSelectModel<typeof courses>;
const page = async () => {
  const allCourses = await db.select().from(courses);

  // 2. استخراج معرفات (IDs) جميع الدورات
  const courseIds = allCourses.map((course) => course.id);

  // 3. جلب جميع الشعب التي تنتمي لهذه الدورات
  const allSections = await db
    .select()
    .from(courseSections)
    .where(inArray(courseSections.courseId, courseIds));

  // 4. جلب عدد طلبات الالتحاق (Applications) لكل دورة
  const applicationsCounts = await db
    .select({
      courseId: courseApplications.courseId,
      count: sql<number>`CAST(count(${courseApplications.id}) AS INTEGER)`,
    })
    .from(courseApplications)
    .where(inArray(courseApplications.courseId, courseIds))
    .groupBy(courseApplications.courseId);

  const appsMap = new Map(applicationsCounts.map((a) => [a.courseId, a.count]));

  // 5. دمج الدورات مع الشعب الخاصة بها
  const coursesWithSections = allCourses.map((course) => {
    // فلترة الشعب الخاصة بالدورة الحالية
    const courseSectionsData = allSections
      .filter((section) => section.courseId === course.id)
      // ترتيب الشعب من الأحدث للأقدم
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return {
      ...course,
      sections: courseSectionsData,
      applicationsCount: appsMap.get(course.id) || 0,
    };
  });
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
      <OurCourses
        courses={coursesWithSections}
        role={role}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
