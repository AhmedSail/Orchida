import HomePage from "@/components/admin/home/HomePage";
import { db } from "@/src";
import { news, users, courses, serviceRequests } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { and, gte, lt } from "drizzle-orm";

export const metadata = {
  title: "لوحة التحكم | لوحة الإدارة",
  description: "لوحة التحكم",
};

export default async function AdminHomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;
  if (role !== "admin") {
    redirect("/");
  }

  // ✅ استعلامات ديناميكية
  const activeUsers = await db.select().from(users);
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

  // const activeCourses = await db
  //   .select()
  //   .from(courses)
  //   .where(eq(courses.isActive, true));
  // const endedCourses = await db
  //   .select()
  //   .from(courses)
  //   .where(eq(courses.isActive, false));
  // const allCourses = await db.select().from(courses);
  const activeServices = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "in_progress"));
  const endedServices = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "completed"));
  const allServices = await db.select().from(serviceRequests);
  const latestNews = await db.select().from(news);
  const serviceRequestsData = await db.select().from(serviceRequests);
  return (
    <HomePage
      stats={{
        activeUsers: activeUsers.length,
        todayRequests: todayRequests.length,
        activeServices: activeServices.length,
        endedServices: endedServices.length,
        allServices: allServices.length,
      }}
      data={latestNews}
      serviceRequestsData={serviceRequestsData}
    />
  );
}
