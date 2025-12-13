import React from "react";
import { db } from "@/src";
import { digitalServices, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import EditServiceForm from "@/components/admin/service/editService";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export const metadata = {
  title: "تعديل الخدمة | لوحة الإدارة",
  description: "تعديل الخدمة",
};
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const service = await db
    .select()
    .from(digitalServices)
    .where(eq(digitalServices.id, id));
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
      <EditServiceForm service={service[0]} />
    </div>
  );
};

export default page;
