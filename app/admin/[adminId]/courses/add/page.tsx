import AddCourseForm from "@/components/admin/courses/add/addCourse";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المدير | اضافة دورة",
};
const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  return (
    <div className="p-5">
      <AddCourseForm userId={session.user.id} />
    </div>
  );
};

export default page;
