import EditPhotoToSlider from "@/components/admin/slider/editPhotoToSlider";
import React from "react";
import { db } from "@/src";
import { sliders } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { users } from "@/src/db/schema";
export const metadata = {
  title: "تعديل الصورة | لوحة الإدارة",
  description: "تعديل الصورة",
};
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const slider = await db.select().from(sliders).where(eq(sliders.id, id));
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
      <EditPhotoToSlider
        slider={slider[0]}
        userId={session.user.id}
        role={role}
      />
    </div>
  );
};

export default page;
