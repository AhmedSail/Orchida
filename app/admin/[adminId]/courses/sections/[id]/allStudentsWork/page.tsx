import AllStudentWork from "@/components/allStudentWork";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { courseSections, studentWorks, users } from "@/src/db/schema";
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
  const section = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.id, param.id))
    .limit(1);

  // ✅ جلب الأعمال مع اسم الطالب
  const works = await db
    .select({
      id: studentWorks.id,
      title: studentWorks.title,
      type: studentWorks.type,
      status: studentWorks.status,
      description: studentWorks.description,
      mediaUrl: studentWorks.mediaUrl,
      studentId: studentWorks.studentId,
      studentName: users.name, // 👈 هنا نجيب الاسم
    })
    .from(studentWorks)
    .innerJoin(users, eq(studentWorks.studentId, users.id)) // ✅ join مع جدول users
    .where(eq(studentWorks.sectionId, section[0].id));

  return (
    <div>
      <AllStudentWork works={works} section={section[0]} />
    </div>
  );
};

export default page;
