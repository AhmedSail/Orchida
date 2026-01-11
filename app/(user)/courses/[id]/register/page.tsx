import RegisterUser from "@/components/users/RegisterUser";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { courses, courseSections, instructors, users } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import React from "react";
import { Metadata } from "next";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await db
    .select({ title: courses.title })
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!course[0]) {
    return {
      title: "تسجيل الدورة",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://orchida-ods.com";

  return {
    title: `تسجيل في دورة ${course[0].title}`,
    description: `انضم الآن لدورة ${course[0].title} وابدأ رحلة التعلم مع أوركيدة.`,
    alternates: {
      canonical: `${baseUrl}/courses/${id}/register`,
    },
    openGraph: {
      title: `تسجيل في دورة ${course[0].title}`,
      description: `انضم الآن لدورة ${course[0].title} وابدأ رحلة التعلم مع أوركيدة.`,
      url: `${baseUrl}/courses/${id}/register`,
    },
  };
}
const page = async ({ params }: { params: { id: string } }) => {
  const courseId = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // جلب الكورس نفسه
  const coursesSelected = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId.id))
    .limit(1);
  const allUsers = await db.select().from(users);

  // جلب آخر شعبة مرتبطة بالكورس مع اسم المدرب
  const lastSectionRaw = await db
    .select({
      sectionId: courseSections.id,
      sectionNumber: courseSections.sectionNumber,
      instructorId: instructors.id,
      instructorName: instructors.name,
    })
    .from(courseSections)
    .leftJoin(instructors, eq(courseSections.instructorId, instructors.id))
    .where(eq(courseSections.courseId, courseId.id))
    .orderBy(desc(courseSections.createdAt))
    .limit(1);

  if (!coursesSelected[0]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-zinc-800 mb-2">
          عذراً، الكورس غير موجود
        </h2>
        <p className="text-zinc-500">
          يبدو أنك تتبع رابطاً غير صحيح أو أن الدورة لم تعد متوفرة.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 text-primary font-bold underline"
        >
          العودة للخلف
        </button>
      </div>
    );
  }

  return (
    <div>
      <RegisterUser
        lastSectionRaw={lastSectionRaw[0]}
        user={session?.user as any}
        coursesSelected={coursesSelected[0]}
        allUsers={allUsers as any}
      />
    </div>
  );
};

export default page;
