import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, or } from "drizzle-orm";
import { instructorCourseAccess } from "@/src/db/schema";
import { getCourseCurriculumAction } from "@/app/actions/lms-v2";
import CourseCurriculumBuilder from "@/src/modules/lms-v2/ui/components/instructor/CourseCurriculumBuilder";
import { ArrowRight, Settings, Layout, ExternalLink } from "lucide-react";
import { db } from "@/src/db";
import { courses, courseEnrollments, courseSections, curriculumLessons } from "@/src/db/schema";
import { eq, sql, asc, inArray } from "drizzle-orm";

export default async function InstructorCourseBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "admin" && session.user.role !== "instructor")) {
    redirect("/sign-in");
  }

  // 0. التحقق من صلاحية الوصول لهذه الدورة بالتحديد
  if (session.user.role !== "admin") {
      const hasAccess = await db.query.instructorCourseAccess.findFirst({
          where: and(
              eq(instructorCourseAccess.instructorId, session.user.id),
              eq(instructorCourseAccess.courseId, id)
          )
      });
      if (!hasAccess) {
          redirect("/instructor/v2"); // أو صفحة خطأ
      }
  }

  // 1. جلب بيانات الدورة للتأكد من وجودها
  const courseData = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });

  if (!courseData) {
    notFound();
  }

  // جلب عدد الطلاب المسجلين في هذا الكورس
  const [{ studentCount }] = await db
    .select({
      studentCount: sql<number>`count(DISTINCT "courseEnrollments".id)`.mapWith(Number),
    })
    .from(courseEnrollments)
    .innerJoin(courseSections, eq(courseEnrollments.sectionId, courseSections.id))
    .where(eq(courseSections.courseId, id));

  // جلب الشعب (Sections) المرتبطة بهذا الكورس
  const sections = await db.query.courseSections.findMany({
    where: eq(courseSections.courseId, id),
    orderBy: [asc(courseSections.sectionNumber)],
  });

  // 2. جلب المنهج الدراسي الحالي للكورس
  const { data: lessons, success } = await getCourseCurriculumAction(id, "course");

  // جلب إحصائية الدروس لكل الشعب (اختياري للعرض)
  const [{ totalLessonsCount }] = await db
    .select({
      totalLessonsCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(curriculumLessons)
    .where(
      or(
        eq(curriculumLessons.courseId, id),
        inArray(curriculumLessons.sectionId, sections.map(s => s.id).concat([""]))
      )
    );

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-10 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="bg-zinc-900 rounded-[40px] p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-lg border border-primary/30 uppercase tracking-widest">
                  LMS System V2
                </span>
                <span className="bg-white/10 text-white/60 text-[10px] font-black px-3 py-1 rounded-lg border border-white/5 uppercase tracking-widest">
                  ID: {id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black">
                {courseData.title}
              </h1>
              <p className="text-white/60 font-medium max-w-2xl leading-relaxed">
                مرحباً بك في باني المحتوى المطور. هنا يمكنك إضافة الدروس، رفع
                الفيديوهات، وتنظيم المنهج الدراسي بكل مرونة.
              </p>
            </div>

            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
              <div className="text-center">
                <p className="text-[10px] font-black text-white/40 uppercase mb-1">
                  الطلاب
                </p>
                <p className="text-2xl font-black">{studentCount || 0}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-black text-white/40 uppercase mb-1">
                  الدروس
                </p>
                <p className="text-2xl font-black">{totalLessonsCount || 0}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-black text-white/40 uppercase mb-1">
                  الحالة
                </p>
                <p className="text-sm font-black text-emerald-400">نشط</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Builder Component */}
        {success && lessons && (
          <CourseCurriculumBuilder 
            courseId={id} 
            initialLessons={lessons} 
            sections={sections}
            courseType={sections[0]?.courseType || 'online'}
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
