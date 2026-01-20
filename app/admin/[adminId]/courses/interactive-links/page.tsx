import React from "react";
import { db } from "@/src";
import { courses } from "@/src/db/schema";
import InteractiveLinksManager from "@/components/admin/courses/InteractiveLinksManager";

export const metadata = {
  title: "الروابط التفاعلية | لوحة الإدارة",
  description: "إدارة الروابط التفاعلية للدورات",
};

export default async function Page() {
  const allCourses = await db.select().from(courses);

  return (
    <div className="container mx-auto">
      <InteractiveLinksManager initialCourses={allCourses} />
    </div>
  );
}
