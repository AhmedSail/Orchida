// app/admin/employees/page.tsx

import EmployeesPage from "@/components/admin/employee/employees";
import { db } from "@/src";
import { employees, users } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "قائمة الموظفين | لوحة الإدارة",
  description: "عرض جميع الموظفين مع تفاصيلهم وتاريخ الإضافة",
};

export default async function Page() {
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

  // ✅ جلب بيانات الموظفين
  const data = await db.select().from(employees);

  return <EmployeesPage initialEmployees={data} userId={session.user.id} />;
}
