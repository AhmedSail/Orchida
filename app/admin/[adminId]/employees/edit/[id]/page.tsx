// app/admin/employees/edit/[id]/page.tsx
import EditEmployee from "@/components/admin/employee/editNewEmployee";
import { db } from "@/src";
import { employees, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
  title: "تعديل الموظف | لوحة الإدارة",
  description: "تعديل بيانات الموظف",
};
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const employee = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id));
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

  return (
    <EditEmployee initialEmployee={employee[0]} userId={session.user.id} />
  );
}
