import AllWorkstable from "@/components/admin/works/allWorkstable";
import { db } from "@/src";
import { digitalServices, mediaFiles, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { users } from "@/src/db/schema";
import React from "react";
export const metadata = {
  title: "لوحة التحكم | الأعمال",
  description: "لوحة التحكم | الأعمال",
};
const page = async () => {
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
  const services = await db.select().from(digitalServices);
  const worksWithMedia = await db
    .select({
      id: works.id,
      title: works.title,
      description: works.description,
      category: works.category,
      projectUrl: works.projectUrl, // ✅ Added
      priceRange: works.priceRange,
      tags: works.tags, // ✅ Added
      duration: works.duration,
      toolsUsed: works.toolsUsed, // ✅ Added
      isActive: works.isActive,
      serviceId: works.serviceId,
      mainMediaId: works.mainMediaId, // ✅ Added
      uploaderId: works.uploaderId, // ✅ Added
      uploadDate: works.uploadDate, // ✅ Added
      deletedAt: works.deletedAt, // ✅ Added
      createdAt: works.createdAt,
      updatedAt: works.updatedAt,
      mainMedia: mediaFiles, // ✅ يجيب الوسيط الرئيسي
    })
    .from(works)
    .leftJoin(mediaFiles, eq(works.mainMediaId, mediaFiles.id));

  return (
    <div>
      <AllWorkstable allWorks={worksWithMedia} />
    </div>
  );
};

export default page;
