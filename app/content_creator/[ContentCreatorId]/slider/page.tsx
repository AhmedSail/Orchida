import AdminSlider from "@/components/admin/slider/adminSlider";
import React from "react";
import { db } from "@/src";
import { sliders } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
export const metadata = {
  title: "قائمة الصور | لوحة الإدارة",
  description: "عرض جميع الصور مع تفاصيلها وتاريخ الإضافة",
};
const page = async () => {
  const data = await db.select().from(sliders);
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
  if (role !== "content_creator") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  return (
    <div>
      <AdminSlider data={data} userId={session.user.id} role={role} />
    </div>
  );
};

export default page;
