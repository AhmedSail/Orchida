import HomePage from "@/components/admin/home/HomePage";
import { db } from "@/src";
import {
  news,
  users,
  courses,
  serviceRequests,
  courseSections,
  courseEnrollments,
  courseLeads,
} from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { desc, eq, sql } from "drizzle-orm";
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

  // ✅ الكورسات
  const activeCourses = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.status, "open"));
  const pendingCourses = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.status, "pending_approval"));
  const inProgressCourses = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.status, "in_progress"));
  const ClosedCourses = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.status, "closed"));
  const completedCourses = await db
    .select()
    .from(courseSections)
    .where(eq(courseSections.status, "completed"));

  // ✅ عدد الطلاب المسجلين في كل دورة
  const registrations = await db.select().from(courseEnrollments);

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
  const latestLeads = await db
    .select({
      id: courseLeads.id,
      studentName: courseLeads.studentName,
      studentEmail: courseLeads.studentEmail,
      studentPhone: courseLeads.studentPhone,
      createdAt: courseLeads.createdAt,
      courseTitle: courses.title,
    })
    .from(courseLeads)
    .innerJoin(courses, eq(courseLeads.courseId, courses.id))
    .orderBy(desc(courseLeads.createdAt))
    .limit(5);
  const enrollmentsByDay = await db
    .select({
      day: sql<string>`TO_CHAR(${courseEnrollments.registeredAt}, 'YYYY-MM-DD')`.as(
        "day"
      ),
      count: sql<number>`COUNT(${courseEnrollments.id})`.as("count"),
    })
    .from(courseEnrollments)
    .groupBy(sql`TO_CHAR(${courseEnrollments.registeredAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${courseEnrollments.registeredAt}, 'YYYY-MM-DD') DESC`)
    .limit(7);
  const enrollmentsWithCourse = await db
    .select({
      courseTitle: courses.title,
      sectionId: courseEnrollments.sectionId,
    })
    .from(courseEnrollments)
    .innerJoin(
      courseSections,
      eq(courseEnrollments.sectionId, courseSections.id)
    )
    .innerJoin(courses, eq(courseSections.courseId, courses.id));

  const studentsCountByCourse: Record<string, number> = {};
  enrollmentsWithCourse.forEach((row) => {
    studentsCountByCourse[row.courseTitle] =
      (studentsCountByCourse[row.courseTitle] || 0) + 1;
  });
  const totalOpenEnrollmentResult = await db
    .select({
      total: sql<number>`CAST(COUNT(${courseEnrollments.id}) AS INTEGER)`,
    })
    .from(courseEnrollments)
    .innerJoin(
      courseSections,
      eq(courseEnrollments.sectionId, courseSections.id)
    )
    .where(
      and(
        eq(courseSections.status, "open"),
        eq(courseEnrollments.isCancelled, false)
      )
    );

  const totalOpenEnrollment = totalOpenEnrollmentResult[0]?.total || 0;

  const openSectionsWithCount = await db
    .select({
      sectionId: courseSections.id,
      courseTitle: courses.title,
      sectionNumber: courseSections.sectionNumber,
      maxCapacity: courseSections.maxCapacity,
      enrollmentCount: sql<number>`CAST(COUNT(${courseEnrollments.id}) AS INTEGER)`,
    })
    .from(courseSections)
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .leftJoin(
      courseEnrollments,
      and(
        eq(courseEnrollments.sectionId, courseSections.id),
        eq(courseEnrollments.isCancelled, false)
      )
    )
    .where(eq(courseSections.status, "open"))
    .groupBy(courseSections.id, courses.title);

  return (
    <HomePage
      stats={{
        activeUsers: activeUsers.length,
        todayRequests: todayRequests.length,
        activeServices: activeServices.length,
        endedServices: endedServices.length,
        allServices: allServices.length,
        activeCourses: activeCourses.length,
        pendingCourses: pendingCourses.length,
        inProgressCourses: inProgressCourses.length,
        completedCourses: completedCourses.length,
        ClosedCourses: ClosedCourses.length,
        totalOpenEnrollment: totalOpenEnrollment,
      }}
      studentsCountByCourse={studentsCountByCourse}
      userId={session.user.id}
      latestLeads={latestLeads}
      enrollmentsByDay={enrollmentsByDay}
      openSections={openSectionsWithCount}
    />
  );
}
