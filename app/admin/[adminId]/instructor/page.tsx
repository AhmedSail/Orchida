import React from "react";
import InstructorTable from "@/components/admin/instructor/InstructorTable";
import { db } from "@/src/db";
import { instructors, users } from "@/src/db/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
  title: "قائمة المدربين | لوحة الإدارة",
  description: "عرض جميع المدربين مع تفاصيلهم وتاريخ الإضافة",
};
export type Instructor = InferSelectModel<typeof instructors>;
const page = async () => {
  const AllInstructors = await db.select().from(instructors);
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
  if (role !== "admin") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }

  return (
    <div>
      <InstructorTable
        instructors={AllInstructors as Instructor[]}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
