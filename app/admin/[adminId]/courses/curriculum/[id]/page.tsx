import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/src/db";
import { courses, courseSections } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getCourseCurriculumAction } from "@/app/actions/lms-v2";
import CourseCurriculumBuilder from "@/src/modules/lms-v2/ui/components/instructor/CourseCurriculumBuilder";
import { ArrowRight, Layout, Globe } from "lucide-react";
import Link from "next/link";

export default async function AdminCourseGlobalCurriculumPage({
  params,
}: {
  params: Promise<{ adminId: string; id: string }>;
}) {
  const { adminId, id: courseId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/sign-in");
  }

  // 1. جلب بيانات الكورس
  const courseData = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!courseData) {
    notFound();
  }

  // 2. جلب المنهج الدراسي لهذا الكورس بالكامل (المنهج الثابت)
  const { data: lessons, success } = await getCourseCurriculumAction(courseId, "course");

  // جلب كل الشعب ليتمكن الأدمن من معاينتها إذا أراد، ولكننا هنا نعدل المنهج العام
  const allSections = await db.query.courseSections.findMany({
    where: eq(courseSections.courseId, courseId),
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-10 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-[40px] p-8 mb-10 shadow-sm border border-zinc-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  المنهج العام (الثابت)
                </span>
                <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                  Course ID: {courseId.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-3xl font-black text-zinc-900">
                تعديل المنهج الأساسي: {courseData.title}
              </h1>
              <p className="text-zinc-500 font-medium">
                قم ببناء الدروس التي ستظهر تلقائياً في جميع الشعب الجديدة لهذه الدورة
              </p>
            </div>

            <Link
              href={`/admin/${adminId}/courses`}
              className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للدورات
            </Link>
          </div>
        </div>

        {/* Curriculum Builder */}
        {success && lessons && (
          <CourseCurriculumBuilder 
            courseId={courseId} 
            initialLessons={lessons} 
            sections={allSections}
            courseType="online" // افتراضي للمنهج العام
            initialSectionId={""} // قيمة فارغة تعني المنهج العام للدورة
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
