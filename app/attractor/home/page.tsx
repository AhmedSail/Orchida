import React from "react";
import { db } from "@/src";
import { news, serviceRequests, users } from "@/src/db/schema";
import { and, gte, lt, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AttractorHomePage from "@/components/attractor/HomePage";

export const metadata = {
  title: "لوحة التحكم | لوحة المستقطب",
  description: "لوحة التحكم",
};

export default async function page() {
  // ✅ التحقق من تسجيل الدخول
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  // ✅ التحقق من الرول (اختياري حسب نظامك)
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;
  if (role !== "attractor") {
    redirect("/");
  }

  // ✅ حساب الطلبات اليوم
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );

  const todayRequests = await db
    .select()
    .from(serviceRequests)
    .where(
      and(
        gte(serviceRequests.createdAt, startOfDay),
        lt(serviceRequests.createdAt, endOfDay)
      )
    );

  // ✅ الخدمات حسب الحالة
  const activeServices = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "in_progress"));

  const endedServices = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "completed"));

  const allServices = await db.select().from(serviceRequests);

  return (
    <AttractorHomePage
      todayRequests={todayRequests}
      activeServices={activeServices}
      endedServices={endedServices}
      allServices={allServices}
    />
  );
}
