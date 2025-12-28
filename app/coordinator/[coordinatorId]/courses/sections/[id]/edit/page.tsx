import React from "react";
import { db } from "@/src/db";
import { courses, courseSections, instructors, users } from "@/src/db/schema";
import { desc, eq, InferSelectModel } from "drizzle-orm";
import EditSection from "@/components/admin/courses/sections/editSection";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
export type Section = InferSelectModel<typeof courseSections>;
export const metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "تعديل على الشعبة",
};

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const section = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.id, id));

  // جلب الكورس
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, section[0].courseId));

  const instructor = await db.select().from(instructors);
  // ✅ تحقق من الـ session
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
  if (role !== "coordinator") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }

  return (
    <div>
      <EditSection
        section={section[0]}
        course={course[0]}
        instructors={instructor}
        role={role}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
