import { db } from "@/src";
import {
  users,
  courses,
  courseSections,
  courseEnrollments,
} from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { and, gte, lt } from "drizzle-orm";
import HomePage, {
  CoordinatorStats,
} from "@/components/admin/home/HomeCordinatorPage";

export const metadata = {
  title: "لوحة التحكم | لوحة المنسق", // Coordinator Dashboard
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
  if (role !== "coordinator") {
    redirect("/");
  }

  // ✅ Coordinator Dynamic Queries

  // 1. Active Courses (using sql count for performance)
  const activeCoursesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(courses)
    .where(eq(courses.isActive, true));

  // 2. Active Sections (in_progress or closed) - as per user request
  // "0 Active Sections, it should be the sections that are open and sections in progress. I don't want [open?] I want in_progress, closed"
  // Re-reading user request: "tkon eli in_progress , cloesed"
  const activeSectionsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseSections)
    .where(inArray(courseSections.status, ["in_progress", "closed"]));

  // 3. Total Enrollments (non-cancelled)
  const totalEnrollmentsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.isCancelled, false));

  // 4. Today's Enrollments
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

  const newEnrollmentsToday = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseEnrollments)
    .where(
      and(
        gte(courseEnrollments.registeredAt, startOfDay),
        lt(courseEnrollments.registeredAt, endOfDay)
      )
    );

  // 5. Latest Enrollments (Last 5)
  const latestEnrollments = await db
    .select({
      id: courseEnrollments.id,
      studentName: courseEnrollments.studentName,
      courseTitle: courses.title,
      sectionNumber: courseSections.sectionNumber,
      registeredAt: courseEnrollments.registeredAt,
    })
    .from(courseEnrollments)
    .leftJoin(
      courseSections,
      eq(courseEnrollments.sectionId, courseSections.id)
    )
    .leftJoin(courses, eq(courseSections.courseId, courses.id))
    .orderBy(desc(courseEnrollments.registeredAt))
    .limit(5);

  const stats: CoordinatorStats = {
    activeCourses: Number(activeCoursesCount[0]?.count || 0),
    openSections: Number(activeSectionsCount[0]?.count || 0), // Mapped to openSections prop
    totalEnrollments: Number(totalEnrollmentsCount[0]?.count || 0),
    todayEnrollments: Number(newEnrollmentsToday[0]?.count || 0),
  };

  return (
    <HomePage
      stats={stats}
      latestEnrollments={latestEnrollments}
      userId={session.user.id}
    />
  );
}
