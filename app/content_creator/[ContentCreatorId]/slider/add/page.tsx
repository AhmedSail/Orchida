import AddPhotoToSlider from "@/components/admin/slider/addPhotoToSlider";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
export const metadata = {
  title: "إضافة صورة جديدة | لوحة الإدارة",
  description: "إضافة صورة جديدة",
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

  return (
    <div>
      <AddPhotoToSlider userId={session.user.id} role={role} />
    </div>
  );
};

export default page;
