import EditCourseForm from "@/components/admin/courses/edit/editCourse";
import React from "react";
import { db } from "@/src/db";
import { courses, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المدير | تعديل دورة",
};
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  

  const course = await db.select().from(courses).where(eq(courses.id, id));
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  return (
    <div>
      <EditCourseForm initialData={course[0]} userId={session.user.id} />
    </div>
  );
};

export default page;
