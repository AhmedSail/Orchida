import React from "react";
import { getFreeLessonsAction } from "@/app/actions/free-lessons";
import { Play, BookOpen, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function FreeLessonsPublicPage() {
  const res = await getFreeLessonsAction();
  const lessons = (res.success && res.data ? res.data : []).filter(
    (l: any) => l.isActive,
  );

  return (
    <div className="min-h-screen  flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-10" dir="rtl">
          {/* Background Decorations */}
          <div className="container mx-auto py-16 px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
                <BookOpen className="w-4 h-4" />
                <span>محتوى تعليمي مفتوح للجميع</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-600">
                  الدروس
                </span>{" "}
                المجانية
              </h1>

              <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                تعلم مجاناً من خلال مكتبة الدروس المفتوحة لدينا. محتوى عالي
                الجودة لرفع مهاراتك وتطوير قدراتك في شتى المجالات.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto py-20 px-6">
          {lessons.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-zinc-100 shadow-sm">
              <BookOpen className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
              <p className="text-xl font-black text-zinc-400">
                لا توجد دروس متاحة حالياً. عد لاحقاً!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lessons.map((lesson: any, index: number) => {
                const colors = [
                  "from-blue-600 to-cyan-400",
                  "from-purple-600 to-pink-400",
                  "from-amber-500 to-orange-400",
                  "from-emerald-600 to-teal-400",
                  "from-rose-600 to-red-400",
                  "from-indigo-600 to-violet-400",
                  "from-sky-600 to-blue-400",
                  "from-fuchsia-600 to-purple-400",
                ];
                const color = colors[index % colors.length];

                return (
                  <Link
                    key={lesson.id}
                    href={`/free-lessons/${lesson.id}`}
                    className="group bg-white rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden flex flex-col h-full"
                  >
                    <div
                      className={`aspect-video bg-gradient-to-br ${color} relative overflow-hidden`}
                    >
                      {/* Square Pattern Overlay */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                          backgroundSize: "40px 40px",
                        }}
                      ></div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                      <div className="absolute bottom-6 right-6 z-20 text-white drop-shadow-md">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">
                          الدرس رقم {lesson.order}
                        </p>
                        <h3 className="text-xl font-black">
                          {lesson.mainTitle}
                        </h3>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      {lesson.subTitle && (
                        <p className="text-sm font-bold text-zinc-400 mb-4 italic line-clamp-1">
                          {lesson.subTitle}
                        </p>
                      )}
                      <p className="text-zinc-600 font-medium line-clamp-2 mb-6">
                        {lesson.description ||
                          "استكشف محتوى هذا الدرس المجاني وتعلم مهارات جديدة اليوم."}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-50">
                        <span className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" />
                          متاح مجاناً
                        </span>
                        <span className="text-primary font-black flex items-center gap-1 group-hover:gap-3 transition-all duration-300 text-sm">
                          ابدأ التعلم الآن
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
