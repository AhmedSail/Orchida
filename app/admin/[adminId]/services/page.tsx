import ServicesPage from "@/components/admin/service/servicesPage";
import { db } from "@/src";
import { digitalServices, users } from "@/src/db/schema";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
export const metadata = {
  title: "قائمة الخدمات | لوحة الإدارة",
  description: "عرض جميع الخدمات مع تفاصيلها وتاريخ الإضافة",
};
const page = async () => {
  const services = await db.select().from(digitalServices);
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
      <ServicesPage services={services} role="admin" userId={session.user.id} />
    </div>
  );
};

export default page;
