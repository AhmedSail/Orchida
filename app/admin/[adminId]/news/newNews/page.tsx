import NewNewsForm from "@/components/news/newNewsForm";
import React from "react";
import { db } from "@/src";
import { users } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
export const metadata = {
  title: "إضافة خبر جديد | لوحة الإدارة",
  description: "إضافة خبر جديد",
};
const page = async () => {
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
      <h1 className="text-3xl font-bold text-primary mb-6">إضافة خبر جديد</h1>
      <NewNewsForm userId={session.user.id} />
    </div>
  );
};

export default page;
