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
const page = async ({ params }: { params: { instructorId: string } }) => {
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
  if (role !== "instructor") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }

  const instructorSections = await db
    .select({
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      courseStatus: courseSections.status, // 👈 جلب حالة الدورة
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.instructorId, session.user.id));

  return (
    <div>
      <CoursePage
        instructorSections={instructorSections}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
