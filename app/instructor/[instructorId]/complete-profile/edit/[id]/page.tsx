import EditInstructorForm from "@/components/admin/instructor/EditInstructor";
import { db } from "@/src/db";
import { instructors, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المدرب",
  description: "تعديل المدرب",
};
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
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
  const instructor = await db
    .select()
    .from(instructors)
    .where(eq(instructors.id, id));
  return (
    <EditInstructorForm instructor={instructor[0]} userId={session.user.id} />
  );
};

export default page;
