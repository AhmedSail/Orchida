import React from "react";
import { db } from "@/src/db";
import { courses, courseSections, instructors, users } from "@/src/db/schema";
import { eq, desc, InferSelectModel } from "drizzle-orm";
import NewSectionForm from "@/components/admin/courses/newSection";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export type Instructor = InferSelectModel<typeof instructors>;
export const metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "فتح شعبة",
};

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: courseId } = await params;

  // جلب الكورس
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId));

  if (!course.length) {
    return (
      <div className="p-6 text-center text-red-500">الكورس غير موجود ❌</div>
    );
  }

  // جلب آخر شعبة وجاهية
  const lastWajahi = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.courseId, courseId))
    .orderBy(desc(courseSections.sectionNumber))
    .limit(1);

  const nextWajahi = lastWajahi.length ? lastWajahi[0].sectionNumber + 1 : 1;
  const nextHybrid = 1001;

  const instructor = await db.select().from(instructors);
  // ✅ تحقق من الـ session
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
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
