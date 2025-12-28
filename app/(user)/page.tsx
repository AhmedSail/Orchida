import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HomeView from "@/src/modules/home/ui/view/home-view";
import {
  courses,
  courseSections,
  digitalServices,
  news,
  serviceRequests,
  sliders,
  studentWorks,
  users,
} from "@/src/db/schema";
import { db } from "@/src";
import { eq, inArray } from "drizzle-orm";

const page = async () => {
  // ✅ جيب الخدمات
  const services = await db.select().from(digitalServices);
  await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/courseSections/meetings/bulk-archive`,
    {
      method: "PUT",
    }
  );
  const slidersPhoto = await db.select().from(sliders);
  const newsData = await db.select().from(news);

  const sections = await db.select().from(courseSections);
  // ✅ جلب الكورسات مع الشعب المفتوحة فقط

  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      imageUrl: courses.imageUrl,
      hours: courses.hours,
      price: courses.price,
      duration: courses.duration,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      approvedAt: courses.approvedAt,
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      startDate: courseSections.startDate,
      endDate: courseSections.endDate,
      status: courseSections.status,
    })
    .from(courses)
    .leftJoin(courseSections, eq(courses.id, courseSections.courseId))
    .where(inArray(courseSections.status, ["open", "in_progress"]));

  const allCourses = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    hours: row.hours,
    price: row.price,
    duration: row.duration,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    approvedAt: row.approvedAt,
    // ممكن تضيف sections كمصفوفة منفصلة لو بدك
  }));
  const studentStories = await db
    .select({
      id: studentWorks.id,
      title: studentWorks.title,
      description: studentWorks.description,
      type: studentWorks.type,
      mediaUrl: studentWorks.mediaUrl,
      studentName: users.name,
    })
    .from(studentWorks)
    .innerJoin(users, eq(studentWorks.studentId, users.id))
    .where(eq(studentWorks.status, "approved"))
    .limit(6); // 👈 مثلاً تعرض آخر 6 قصص

  return (
    <div>
      {/* مرر الخدمات + الطلبات للـ HomeView */}
      <HomeView
        services={services}
        sliders={slidersPhoto}
        news={newsData}
        allCourses={allCourses}
        sections={sections}
        studentStories={studentStories}
      />
    </div>
  );
};

export default page;
