import InProgress from "@/components/attractor/InProgress";
import PendingServices from "@/components/attractor/pending-services";
import { db } from "@/src/db";
import { serviceRequests, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المدير | الخدمات قيد التنفيذ",
};
const page = async () => {
  const servicesRequests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "in_progress"));
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
      <InProgress
        data={servicesRequests}
        role="admin"
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
