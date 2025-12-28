import React from "react";
import AddNewEmployee from "@/components/admin/employee/addNewEmployee";
import { auth } from "@/lib/auth";
import { db } from "@/src";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
  title: "إضافة موظف جديد | لوحة الإدارة",
  description: "إضافة موظف جديد",
};
const page = async () => {
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
  if (role !== "admin") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  return (
    <div>
      <AddNewEmployee userId={session.user.id} />
    </div>
  );
};

export default page;
