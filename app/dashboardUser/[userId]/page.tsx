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
  jobs,
  trendingProducts,
} from "@/src/db/schema";
import { db } from "@/src";
import { eq, desc } from "drizzle-orm";

const page = async () => {
  // ✅ جلب البيانات بالتوازي
  const [
    services,
    slidersPhoto,
    newsData,
    jobsData,
    allCourses,
    sections,
    stories,
    trendingProductsData,
  ] = await Promise.all([
    db.select().from(digitalServices),
    db.select().from(sliders),
    db.select().from(news).orderBy(desc(news.publishedAt)),
    db.select().from(jobs),
    db.select().from(courses).where(eq(courses.isActive, true)),
    db.select().from(courseSections).where(eq(courseSections.isHidden, false)),
    db
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
      .limit(6),
    db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.isActive, true))
      .orderBy(desc(trendingProducts.order), desc(trendingProducts.createdAt)),
  ]);

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
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
        jobs={jobsData}
        studentStories={stories}
        trendingProducts={trendingProductsData}
      />
    </div>
  );
};

export default page;
