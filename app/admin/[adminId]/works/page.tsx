import AllWorkstable, {
  WorkWithMedia,
} from "@/components/admin/works/allWorkstable";
import { db } from "@/src";
import { digitalServices, mediaFiles, works } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { users } from "@/src/db/schema";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
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

  const worksData = await db.select().from(works);

  const worksWithMedia: WorkWithMedia[] = await Promise.all(
    worksData.map(async (work) => {
      const media = await db
        .select()
        .from(mediaFiles)
        .where(eq(mediaFiles.workId, work.id));

      return {
        ...work,
        mediaFiles: media, // ✅ مصفوفة الوسائط المرتبطة بالعمل
      };
    })
  );

  return (
    <div>
      <AllWorkstable allWorks={worksWithMedia} userId={session.user.id} />
    </div>
  );
};

export default page;
