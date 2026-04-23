import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/src/db";
import { courseSections, courses } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getCourseCurriculumAction } from "@/app/actions/lms-v2";
import CourseCurriculumBuilder from "@/src/modules/lms-v2/ui/components/instructor/CourseCurriculumBuilder";
import { ArrowRight, Layout, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminSectionCurriculumPage({
  params,
}: {
  params: Promise<{ adminId: string; id: string }>;
}) {
  const { adminId, id: sectionId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/sign-in");
  }

  // 1. جلب بيانات الشعبة والكورس
  const sectionData = await db.query.courseSections.findFirst({
    where: eq(courseSections.id, sectionId),
    with: {
      course: true,
    },
  });

  if (!sectionData) {
    notFound();
  }

  // ✅ منطق تحديد نوع الشعبة بناءً على الرقم:
  let effectiveCourseType = sectionData.courseType || "online";
  if (sectionData.sectionNumber === 0) {
    effectiveCourseType = "online";
  } else if (sectionData.sectionNumber >= 1 && sectionData.sectionNumber <= 1000) {
    effectiveCourseType = "in_center";
  } else if (sectionData.sectionNumber >= 1001 && sectionData.sectionNumber <= 2000) {
    effectiveCourseType = "online";
  }

  // 2. جلب المنهج الدراسي المدمج (العام + الخاص بهذه الشعبة)
  const { data: lessons, success } = await getCourseCurriculumAction(sectionId, "section");

  // جلب كل الشعب لنفس الكورس ليتمكن الأدمن من التنقل بينها في الـ Builder
  const allSections = await db.query.courseSections.findMany({
    where: eq(courseSections.courseId, sectionData.courseId!),
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-10 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* Admin Header */}
        <div className="bg-white rounded-[40px] p-8 mb-10 shadow-sm border border-zinc-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Admin Panel
                </span>
                <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                  Section ID: {sectionId.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-3xl font-black text-zinc-900">
                إدارة منهج: {sectionData.course?.title}
              </h1>
              <p className="text-zinc-500 font-medium">
                 إدارة الدروس والمحتوى للشعبة رقم: <span className="text-primary font-bold">{sectionData.sectionNumber}</span>
              </p>
            </div>

            <Link
              href={`/admin/${adminId}/courses/sections`}
              className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للشعب
            </Link>
          </div>
        </div>

        {/* Curriculum Builder */}
        {success && lessons && (
          <CourseCurriculumBuilder 
            courseId={sectionData.courseId!} 
            initialLessons={lessons} 
            sections={allSections}
            courseType={effectiveCourseType}
            initialSectionId={sectionId}
          />
        )}

        {!success && (
          <div className="p-20 text-center bg-red-50 text-red-500 rounded-[40px] border border-red-100">
            <p className="font-bold">حدث خطأ أثناء تحميل بيانات المنهج.</p>
          </div>
        )}
      </div>
    </div>
  );
}
