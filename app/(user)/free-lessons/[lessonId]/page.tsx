import React from "react";
import { getFreeLessonsAction } from "@/app/actions/free-lessons";
import { ArrowRight, Play, BookOpen, AlertCircle, Quote as QuoteIcon, CheckCircle2, FileText, ChevronLeft, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import FreeLessonClient from "./FreeLessonClient";

export default async function FreeLessonDetailPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const res = await getFreeLessonsAction();
  let lesson = (res.success && res.data ? res.data : []).find((l: any) => l.id === lessonId);

  // ✅ توقيع روابط الفيديوهات لحمايتها من التحميل
  if (lesson && lesson.fields) {
    const { signBunnyVideo } = await import("@/lib/bunny-sign");
    lesson = {
      ...lesson,
      fields: lesson.fields.map((field: any) => {
        if (field.fieldType === "video" && field.content.includes("mediadelivery.net")) {
          try {
            const parts = field.content.split("/");
            const videoId = parts[parts.length - 1].split("?")[0];
            return {
              ...field,
              content: signBunnyVideo(videoId),
            };
          } catch (e) {
            console.error("Error signing Bunny video:", e);
          }
        }
        return field;
      }),
    };
  }

  if (!lesson || !lesson.isActive) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col" dir="rtl">
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
          <h1 className="text-4xl font-black text-zinc-900 mb-4">الدرس غير متاح</h1>
          <p className="text-zinc-500 font-bold mb-8">عذراً، هذا الدرس غير متوفر حالياً أو تم حذفه.</p>
          <Link href="/free-lessons" className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl">
             العودة لجميع الدروس
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <main className="flex-1 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="max-w-6xl mx-auto px-6 py-8">
           <Link href="/free-lessons" className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-primary transition-colors">
             <ArrowRight className="w-4 h-4" />
             العودة لجميع الدروس
           </Link>
        </div>

        {/* Lesson Header */}
        <div className="max-w-4xl mx-auto px-6 mb-16 text-center">
            <div className="flex flex-col items-center gap-4 mb-8">
              <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">
                الدرس المجاني رقم {lesson.order}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-zinc-900 leading-tight">
                {lesson.mainTitle}
              </h1>
            </div>
            {lesson.subTitle && (
              <p className="text-xl text-zinc-500 font-medium italic max-w-2xl mx-auto">
                {lesson.subTitle}
              </p>
            )}
        </div>

        {/* Content Display (Matching CoursePlayer Logic) */}
        <FreeLessonClient fields={lesson.fields || []} />

        {/* Footer Action */}
        <div className="max-w-4xl mx-auto px-6 mt-20 pt-10 border-t border-zinc-100 text-center">
           <Link 
             href="/courses" 
             className="inline-flex items-center gap-4 bg-zinc-900 text-white px-10 py-5 rounded-[30px] font-black text-xl hover:bg-primary transition-all shadow-2xl hover:scale-105 active:scale-95 group"
           >
             استكشف دوراتنا المدفوعة
             <ArrowRight className="w-6 h-6 rotate-180 group-hover:translate-x-[-10px] transition-transform" />
           </Link>
           <p className="text-zinc-400 font-bold mt-6 text-sm">احصل على تجربة تعلم كاملة مع متابعة المدربين وشهادات معتمدة</p>
        </div>
      </main>
    </div>
  );
}
