import React from "react";
import { db } from "@/src";
import { courses, courseSections, users, courseLeads } from "@/src/db/schema"; // استيراد الجداول
import OurCourses from "@/components/admin/courses/ourCourses";
import { InferSelectModel, eq, inArray } from "drizzle-orm"; // استيراد eq و inArray
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { sql } from "drizzle-orm";
export const metadata: Metadata = {
  title: "لوحة التحكم | لوحة المنسق",
  description: "دوراتنا",
};
// تعريف نوع جديد ليشمل الشعب (يبقى كما هو)
export type CourseWithSections = InferSelectModel<typeof courses> & {
  sections: InferSelectModel<typeof courseSections>[];
  leadsCount?: number;
};

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // ✅ جلب بيانات المستخدم من DB
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;

  if (role !== "coordinator") {
    redirect("/");
  }

  // --- بداية التعديل ---

  // 1. جلب جميع الدورات
  const allCourses = await db.select().from(courses);

  if (allCourses.length === 0) {
    // إذا لم تكن هناك دورات، لا داعي للاستعلام عن الشعب
    return <OurCourses courses={[]} role={role} userId={session.user.id} />;
  }

  // 2. استخراج معرفات (IDs) جميع الدورات
  const courseIds = allCourses.map((course) => course.id);

  // 3. جلب جميع الشعب التي تنتمي لهذه الدورات
  const allSections = await db
    .select()
    .from(courseSections)
    .where(inArray(courseSections.courseId, courseIds));

  // 4. جلب عدد المهتمين لكل دورة
  const leadsCounts = await db
    .select({
      courseId: courseLeads.courseId,
      count: sql<number>`CAST(count(${courseLeads.id}) AS INTEGER)`,
    })
    .from(courseLeads)
    .where(inArray(courseLeads.courseId, courseIds))
    .groupBy(courseLeads.courseId);

  const leadsMap = new Map(leadsCounts.map((l) => [l.courseId, l.count]));

  // 5. دمج الدورات مع الشعب الخاصة بها وعدد المهتمين
  const coursesWithSections: CourseWithSections[] = allCourses.map((course) => {
    // فلترة الشعب الخاصة بالدورة الحالية
    const courseSections = allSections
      .filter((section) => section.courseId === course.id)
      // ترتيب الشعب من الأحدث للأقدم
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return {
      ...course,
      sections: courseSections,
      leadsCount: leadsMap.get(course.id) || 0,
    };
  });

  // --- نهاية التعديل ---

  return (
    <div>
      <OurCourses
        courses={coursesWithSections} // تمرير البيانات المدمجة
        role={role}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
