import AllStudentWork from "@/components/allStudentWork";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { courseSections, studentWorks, users, courses } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
export const metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "اعمال الطلاب",
};

const page = async ({ params }: { params: { id: string } }) => {
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

  const param = await params;
  const sectionData = await db
    .select({
      id: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      courseTitle: courses.title,
    })
    .from(courseSections)
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(courseSections.id, param.id))
    .limit(1);

  if (sectionData.length === 0) {
      return <div>Section not found</div>;
  }

  // ✅ جلب الأعمال مع اسم الطالب (سواء مسجل أو يدوي)
  const works = await db
    .select({
      id: studentWorks.id,
      title: studentWorks.title,
      type: studentWorks.type,
      status: studentWorks.status,
      description: studentWorks.description,
      mediaUrl: studentWorks.mediaUrl,
      youtubeUrl: studentWorks.youtubeUrl,
      studentId: studentWorks.studentId,
      studentName: studentWorks.studentName, // الاسم اليدوي
      userName: users.name, // اسم المستخدم المسجل
    })
    .from(studentWorks)
    .leftJoin(users, eq(studentWorks.studentId, users.id))
    .where(eq(studentWorks.sectionId, sectionData[0].id));

  return (
    <div>
      <AllStudentWork works={works} section={sectionData[0]} />
    </div>
  );
};

export default page;
