import ContentCreatorHomePage from "@/components/ContentHomePage";

import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { news, sliders, users, works } from "@/src/db/schema";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/src";
export const metadata = {
  title: "لوحة التحكم | لوحة صانع المحتوى",
  description: "لوحة تحكم صانع المحتوى لإدارة الأعمال والأخبار والسلايدر",
};

interface Props {
  params: Promise<{
    ContentCreatorId: string;
  }>;
}
const page = async ({ params }: Props) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const { ContentCreatorId } = await params;
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Verify Role
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const user = userRecord[0];
  if (!user || user.role !== "content_creator") {
    redirect("/");
  }

  // Ensure the user is accessing their own dashboard
  if (user.id !== ContentCreatorId) {
    redirect(`/content-creator/${user.id}/home`);
  }

  // Fetch Stats
  const worksData = await db
    .select()
    .from(works)
    .orderBy(desc(works.createdAt));
  const newsData = await db.select().from(news).orderBy(desc(news.createdAt));
  const slidersData = await db.select().from(sliders);

  const activeSliders = slidersData.filter((s) => s.isActive).length;
  const recentWorks = worksData.slice(0, 5);
  const recentNews = newsData.slice(0, 5);
  return (
    <div>
      <ContentCreatorHomePage
        userName={user.name ?? ""}
        userId={user.id ?? ""}
        activeSliders={activeSliders}
        recentWorks={recentWorks}
        recentNews={recentNews}
        slidersData={slidersData}
      />
    </div>
  );
};

export default page;
