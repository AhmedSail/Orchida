import React from "react";
import { getFreeLessonsAction } from "@/app/actions/free-lessons";
import { ArrowRight, Play, BookOpen, AlertCircle, Quote as QuoteIcon, CheckCircle2, FileText, ChevronLeft, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          {lesson.fields?.length === 0 ? (
             <div className="p-20 bg-zinc-50 rounded-[40px] text-center border-2 border-dashed border-zinc-200">
               <BookOpen className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
               <p className="font-black text-zinc-400 italic">لا يوجد محتوى لهذا الدرس حالياً.</p>
             </div>
          ) : (
            lesson.fields
              .sort((a: any, b: any) => a.order - b.order)
              .map((field: any) => (
              <div key={field.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 {field.fieldType === "heading" && (
                   <h2 className="text-3xl font-black text-primary border-r-4 border-primary pr-4 py-1">
                     {field.content}
                   </h2>
                 )}
                 {field.fieldType === "subheading" && (
                   <h3 className="text-lg font-bold text-sky-700 bg-sky-50 border border-sky-100 px-4 py-2 rounded-xl inline-block">
                     {field.content}
                   </h3>
                 )}
                 {field.fieldType === "text" && (
                   <div className="text-zinc-700 leading-relaxed text-base whitespace-pre-wrap bg-zinc-50/80 border border-zinc-100 rounded-2xl px-5 py-4 font-medium">
                     {field.content}
                   </div>
                 )}
                 {field.fieldType === "video" && (
                   <div className="relative aspect-video rounded-[32px] overflow-hidden bg-black shadow-2xl border-4 border-white ring-1 ring-zinc-100 group/video">
                     <iframe
                        src={
                          field.content.includes("mediadelivery.net")
                            ? `${field.content}${field.content.includes("?") ? "&" : "?"}autoplay=false&loop=false&muted=false&preload=true&responsive=true`
                            : (() => {
                                const url = field.content;
                                const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
                                if (shortMatch) return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}`;
                                const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
                                if (watchMatch) return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`;
                                const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
                                if (shortsMatch) return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`;
                                return url;
                              })()
                        }
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                      />
                   </div>
                 )}
                 {field.fieldType === "image" && (
                   <div className="rounded-[32px] overflow-hidden bg-white shadow-xl border-4 border-white ring-1 ring-zinc-100">
                      <img src={field.content} alt="Lesson content" className="w-full h-auto object-cover" />
                   </div>
                 )}
                 {field.fieldType === "file" && (
                    <a
                      href={field.content}
                      target="_blank"
                      className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-black text-zinc-900 group-hover:text-primary transition-colors">
                          تحميل المرفقات
                        </p>
                        <p className="text-xs text-zinc-400 font-bold">اضغط للمعاينة أو التحميل</p>
                      </div>
                    </a>
                 )}
                 {field.fieldType === "quote" && (
                    <div className="relative p-8 bg-zinc-100 rounded-[32px] overflow-hidden">
                      <QuoteIcon className="absolute -top-4 -right-4 w-24 h-24 text-zinc-200/50 -rotate-12" />
                      <blockquote className="relative text-xl font-bold text-zinc-800 leading-relaxed italic">
                        "{field.content}"
                      </blockquote>
                    </div>
                 )}
                 {field.fieldType === "alert" && (
                    <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                      <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-black text-amber-900 mb-1">ملاحظة هامة</h4>
                        <p className="text-sm font-bold text-amber-800 leading-relaxed">{field.content}</p>
                      </div>
                    </div>
                 )}
                 {field.fieldType === "divider" && (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent" />
                      <div className="w-2 h-2 rounded-full bg-zinc-200" />
                      <div className="flex-1 h-px bg-linear-to-r from-zinc-200 via-zinc-200 to-transparent" />
                    </div>
                 )}
                 {field.fieldType === "link" && (
                    <a
                      href={field.content}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-primary font-black hover:underline underline-offset-4"
                    >
                      {field.content}
                      <ChevronLeft className="w-4 h-4" />
                    </a>
                 )}
              </div>
            ))
          )}
        </div>

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
