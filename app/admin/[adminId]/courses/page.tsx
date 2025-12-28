import React from "react";
import { db } from "@/src";
import { courses, courseSections, users } from "@/src/db/schema";

import { inArray, InferSelectModel } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
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

  // 4. دمج الدورات مع الشعب الخاصة بها
  const coursesWithSections: CourseWithSections[] = allCourses.map((course) => {
    // فلترة الشعب الخاصة بالدورة الحالية
    const courseSections = allSections
      .filter((section) => section.courseId === course.id)
      // ترتيب الشعب من الأحدث للأقدم
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return {
      ...course,
      sections: courseSections,
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

  // ✅ تحقق من الرول
  if (role !== "admin" && role !== "coordinator") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
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
