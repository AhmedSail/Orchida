import EditNewsForm from "@/components/news/EditNewsForm";
import React from "react";
import { db } from "@/src";
import { news, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
  title: "تعديل الخبر | لوحة الإدارة",
  description: "تعديل الخبر",
};

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  // ✅ جلب الخبر من قاعدة البيانات مباشرة (Server Component)
  const result = await db.select().from(news).where(eq(news.id, id));

  if (!result.length) {
    return <div>الخبر غير موجود ❌</div>;
  }
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
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">تعديل الخبر</h1>
      <EditNewsForm
        currentNews={result[0]}
        userId={session.user.id}
        role={role}
      />
    </div>
  );
};

export default page;
