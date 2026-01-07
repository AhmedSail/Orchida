import LatestNews from "@/components/news/LatestNews";

import { db } from "@/src";
import { news, users } from "@/src/db/schema";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
export const metadata = {
  title: "قائمة المستجدات | لوحة الإدارة",
  description: "عرض جميع المستجدات مع تفاصيلها وتاريخ الإضافة",
};
export default async function LatestNewsPage() {
  const data = await db.select().from(news);
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
    <>
      <LatestNews news={data} userId={session.user.id} role={role} />
    </>
  );
}
