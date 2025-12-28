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
import { eq } from "drizzle-orm";

const page = async () => {
  // ✅ جيب الخدمات
  const services = await db.select().from(digitalServices);

  const slidersPhoto = await db.select().from(sliders);
  const newsData = await db.select().from(news);
  const allCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.isActive, true));
  const sections = await db.select().from(courseSections);
  const stories = await db.select().from(studentWorks);
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
  if (role !== "user") {
    redirect("/"); // لو مش أدمن رجعه للصفحة الرئيسية أو صفحة خطأ
  }
  return (
    <div>
      {/* مرر الخدمات + الطلبات للـ HomeView */}
      <HomeView
        services={services}
        sliders={slidersPhoto}
        news={newsData}
        allCourses={allCourses}
        sections={sections}
        studentStories={[]}
      />
    </div>
  );
};

export default page;
