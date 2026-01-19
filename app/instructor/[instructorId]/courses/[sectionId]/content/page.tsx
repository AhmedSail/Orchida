import Clasification from "@/components/instructor/Clasification";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import {
  chapterContent,
  courseChapters,
  courseEnrollments,
  courseModules,
  courses,
  courseSections,
  users,
} from "@/src/db/schema";
import { and, eq, InferSelectModel } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export type AllModules = InferSelectModel<typeof courseModules>;
export type AllChapters = InferSelectModel<typeof courseChapters>;
export type AllContent = InferSelectModel<typeof chapterContent>;
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: " المحتوى",
};
const page = async ({
  params,
}: {
  params: Promise<{ instructorId: string; sectionId: string }>;
}) => {
  const sectionId = (await params).sectionId;

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

  // ✅ جلب بيانات الشعبة مع حالة الدورة
  const section = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      sectionStatus: courseSections.status, // 👈 الحالة من enum section_status
      notes: courseSections.notes,
      instructorId: courseSections.instructorId,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.id, sectionId))
    .limit(1);
  // ✅ جلب الطلاب المسجلين في هذه الشعبة
  const students = await db
    .select({
      id: courseEnrollments.id,
      studentName: courseEnrollments.studentName,
      studentEmail: courseEnrollments.studentEmail,
      studentPhone: courseEnrollments.studentPhone,
      confirmationStatus: courseEnrollments.confirmationStatus,
    })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.sectionId, sectionId));
  if (section.length === 0) {
    return <div>❌ لم يتم العثور على هذه الشعبة</div>;
  }

  const instructorSections = await db
    .select({
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      courseTitle: courses.title,
      courseId: courses.id,
    })
    .from(courseSections)
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.instructorId, session.user.id));

  const allModules = await db
    .select()
    .from(courseModules)
    .where(
      and(
        eq(courseModules.sectionId, sectionId),
        eq(courseModules.intructorId, session.user.id),
      ),
    );

  const chapters = await db.select().from(courseChapters);
  const contents = await db.select().from(chapterContent);

  return (
    <div>
      <Clasification
        user={session.user.name}
        instructorSections={instructorSections}
        section={section[0]}
        allModules={allModules}
        userId={session.user.id}
        courseId={instructorSections[0].courseId ?? ""}
        chapters={chapters}
        contents={contents}
        role={session.user.role}
        students={students}
      />
    </div>
  );
};

export default page;
