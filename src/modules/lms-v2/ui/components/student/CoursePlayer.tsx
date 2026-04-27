"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Menu,
  X,
  Zap,
  Info,
  FileText,
  AlertTriangle,
  Quote as QuoteIcon,
  Minus,
  Video,
  Clock,
} from "lucide-react";
import { completeLessonAction } from "@/app/actions/lms-v2";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface Field {
  id: string;
  fieldType: string;
  content: string;
  order: number;
}

interface Lesson {
  id: string;
  mainTitle: string;
  subTitle?: string | null;
  order: number;
  fields: Field[];
  isEnabled?: boolean; // For Wajahi
  isCompleted?: boolean; // For Online
}

export default function CoursePlayer({
  course,
  lessons,
  initialProgress,
  courseType, // 'online' | 'in_center'
  sectionAvailability = [],
  sectionNumber = 0,
  meetings = [],
  isPreview = false,
  studentInfo = { name: "طالب أوركيدة", id: "OR-0000" },
  userId,
}: {
  course: any;
  lessons: any[];
  initialProgress: any[];
  courseType: string;
  sectionAvailability?: any[];
  sectionNumber?: number;
  meetings?: any[];
  isPreview?: boolean;
  studentInfo?: { name: string; id: string };
  userId?: string;
}) {
  const [activeTab, setActiveTab] = useState<"curriculum" | "meetings">(
    "curriculum",
  );
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    lessons[0]?.id || null,
  );
  const [completedIds, setCompletedIds] = useState<string[]>(
    initialProgress.map((p) => p.lessonId),
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  // منطق التحقق من إتاحة الدرس (Locked vs Unlocked)
  const isLessonLocked = (
    lesson: any,
    currentCompletedIds: string[] = completedIds,
  ) => {
    // 🛡️ في وضع المعاينة (Preview): نفتح فقط الدرس الأول ونقفل الباقي
    if (isPreview) {
      return lesson.order !== 1;
    }

    // الدرس الأول دائماً مفتوح للجميع
    if (lesson.order === 1) return false;

    // 1. الشعبة رقم 0 (أونلاين فردي - فتح تلقائي عند الإكمال)
    if (sectionNumber === 0) {
      // التأكد من إكمال الدرس السابق
      const prevLesson = lessons.find((l) => l.order === lesson.order - 1);
      const isPrevCompleted =
        prevLesson && currentCompletedIds.includes(prevLesson.id);

      if (isPrevCompleted) return false;

      // أو إذا قام المنسق بتفعيله يدوياً (كخيار إضافي)
      const availability = sectionAvailability.find(
        (a) => a.lessonId === lesson.id,
      );
      return !availability?.isEnabled;
    }

    // 2. الشعب الأخرى (وجاهي أو مدمج - فتح يدوي من المدرب فقط)
    // المدرب يجب أن يفتح كل لقاء يدوياً عبر "إدارة الإتاحة".
    const availability = sectionAvailability.find(
      (a) => a.lessonId === lesson.id,
    );
    return !availability?.isEnabled;
  };

  const handleComplete = async () => {
    if (!activeLessonId) return;

    const res = await completeLessonAction(activeLessonId);
    if (res.success) {
      const newCompletedIds = [...completedIds, activeLessonId];
      setCompletedIds(newCompletedIds);
      toast.success("تم إكمال الدرس! تم فتح الدرس التالي لك.");

      // الانتقال التلقائي للدرس التالي
      const nextLesson = lessons.find(
        (l) => l.order === (activeLesson?.order || 0) + 1,
      );

      // نمرر القائمة الجديدة لضمان الفحص الصحيح في نفس اللحظة
      if (nextLesson && !isLessonLocked(nextLesson, newCompletedIds)) {
        setActiveLessonId(nextLesson.id);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50" dir="rtl">
      {/* Top Navbar */}
      <nav className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-zinc-100 rounded-xl lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block w-px h-6 bg-zinc-100 mx-2" />
          <h2 className="hidden md:block font-bold text-zinc-600 text-sm truncate max-w-[300px]">
            {isPreview ? "معاينة المنهج (وضع القراءة)" : course.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              التقدم المحرز
            </span>
            <div className="w-32 h-1.5 bg-zinc-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(completedIds.length / (lessons.length || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
          {!isPreview ? (
            <Link
              href={userId ? `/dashboardUser/${userId}/courses` : "/"}
              className="text-zinc-400 hover:text-zinc-800 p-2"
            >
              <X className="w-6 h-6" />
            </Link>
          ) : (
            <div className="text-zinc-300 p-2">
              <X className="w-6 h-6" />
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside
          className={`absolute lg:relative inset-y-0 right-0 w-80 bg-white border-l border-zinc-100 z-40 transition-transform duration-300 transform ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full lg:hidden"
          }`}
        >
          <div className="p-4 border-b border-zinc-50 flex gap-2">
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                activeTab === "curriculum"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              المنهج
            </button>
            {meetings && meetings.length > 0 && (
              <button
                onClick={() => setActiveTab("meetings")}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  activeTab === "meetings"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                <Video className="w-4 h-4" />
                اللقاءات
              </button>
            )}
          </div>

          <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-2">
            {activeTab === "curriculum"
              ? lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => {
                    const isLocked = isLessonLocked(lesson);
                    const isCompleted = completedIds.includes(lesson.id);
                    const isActive = activeLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        disabled={isLocked}
                        onClick={() => {
                          setActiveLessonId(lesson.id);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all text-right group ${
                          isActive
                            ? "bg-primary/5 border border-primary/20"
                            : "hover:bg-zinc-50 border border-transparent"
                        } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div
                          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isActive
                                ? "bg-primary text-white"
                                : "bg-zinc-100 text-zinc-400"
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <span>{lesson.order - 1}</span>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p
                            className={`text-sm font-black transition-colors ${isActive ? "text-primary" : "text-zinc-700"}`}
                          >
                            {lesson.mainTitle}
                          </p>
                          {lesson.subTitle && (
                            <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                              {lesson.subTitle}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
              : meetings?.map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-right"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-md">
                        لقاء مباشر #{meeting.meetingNumber}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {new Date(meeting.date).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <h4 className="font-black text-zinc-800 text-sm">
                      {meeting.location?.includes("http")
                        ? "رابط اللقاء المباشر (Zoom/Meet)"
                        : meeting.location || "لقاء وجاهي"}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {meeting.startTime} - {meeting.endTime}
                    </div>
                    {meeting.location?.includes("http") && (
                      <a
                        href={meeting.location}
                        target="_blank"
                        className="mt-2 w-full py-2 bg-zinc-900 text-white rounded-xl text-center text-xs font-black hover:bg-black transition-all flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        انضم الآن
                      </a>
                    )}
                  </div>
                ))}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Player Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 scroll-smooth">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Lesson Title Section */}
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  {completedIds.includes(activeLesson.id) && (
                    <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> تم الإكمال
                    </span>
                  )}
                  <h1 className="text-3xl text-center md:text-5xl font-black text-zinc-900 leading-tight">
                    الدرس {activeLesson.order - 1} : {activeLesson.mainTitle}
                  </h1>
                </div>
                {activeLesson.subTitle && (
                  <p className="text-center text-xl text-zinc-500 font-medium">
                    {activeLesson.subTitle}
                  </p>
                )}
              </div>

              <div className="space-y-8">
                {activeLesson.fields
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((field: any) => (
                    <div
                      key={field.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
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
                          {/* Bunny Stream Player / YouTube / Raw Video */}
                          <iframe
                            src={
                              field.content.includes("mediadelivery.net")
                                ? `${field.content}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`
                                : (() => {
                                    const url = field.content;
                                    // youtu.be/VIDEO_ID
                                    const shortMatch = url.match(
                                      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
                                    );
                                    if (shortMatch)
                                      return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}`;
                                    // youtube.com/watch?v=VIDEO_ID
                                    const watchMatch = url.match(
                                      /[?&]v=([a-zA-Z0-9_-]{11})/,
                                    );
                                    if (watchMatch)
                                      return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`;
                                    // youtube.com/shorts/VIDEO_ID
                                    const shortsMatch = url.match(
                                      /shorts\/([a-zA-Z0-9_-]{11})/,
                                    );
                                    if (shortsMatch)
                                      return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`;
                                    // already an embed link or other
                                    return url;
                                  })()
                            }
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          />

                          {/* Protection Layer: Dynamic Watermark */}
                          <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden">
                            <MovingWatermark info={studentInfo} />
                          </div>

                          {/* Privacy Cover when paused/not started (Optional) */}
                          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white/80 font-black flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            بث محمي للأعضاء فقط
                          </div>
                        </div>
                      )}
                      {field.fieldType === "image" && (
                        <div className="rounded-[32px] overflow-hidden bg-white shadow-xl border-4 border-white ring-1 ring-zinc-100">
                          <Image
                            src={field.content}
                            className="w-full h-auto object-cover"
                            alt="Lesson content"
                            width={500}
                            height={500}
                            priority
                          />
                        </div>
                      )}
                      {field.fieldType === "file" && (
                        <a
                          href={isPreview ? "#" : field.content}
                          target={isPreview ? "_self" : "_blank"}
                          onClick={(e) => {
                            if (isPreview) {
                              e.preventDefault();
                              toast.info("تحميل الملفات معطل في وضع المعاينة");
                            }
                          }}
                          className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="font-black text-zinc-900 group-hover:text-primary transition-colors">
                              تحميل المرفقات
                            </p>
                            <p className="text-xs text-zinc-400 font-bold">
                              اضغط للمعاينة أو التحميل
                            </p>
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
                          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                          <div>
                            <h4 className="font-black text-amber-900 mb-1">
                              ملاحظة هامة
                            </h4>
                            <p className="text-sm font-bold text-amber-800 leading-relaxed">
                              {field.content}
                            </p>
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
                          href={isPreview ? "#" : field.content}
                          target={isPreview ? "_self" : "_blank"}
                          onClick={(e) => {
                            if (isPreview) {
                              e.preventDefault();
                              toast.info(
                                "الروابط الخارجية معطلة في وضع المعاينة",
                              );
                            }
                          }}
                          className="inline-flex items-center gap-2 text-primary font-black hover:underline underline-offset-4"
                        >
                          {field.content}
                          <ChevronLeft className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
              </div>

              {/* Bottom Actions */}
              <div className="pt-10 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    disabled={activeLesson.order === 1}
                    onClick={() => {
                      const prev = lessons.find(
                        (l) => l.order === activeLesson.order - 1,
                      );
                      if (prev) setActiveLessonId(prev.id);
                    }}
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-800 font-bold text-sm disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" /> السابق
                  </button>
                  <button
                    onClick={() => {
                      const next = lessons.find(
                        (l) => l.order === activeLesson.order + 1,
                      );
                      if (next && !isLessonLocked(next))
                        setActiveLessonId(next.id);
                      else if (next)
                        toast.info("أكمل هذا الدرس أولاً لفتح التالي!");
                    }}
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-800 font-bold text-sm"
                  >
                    التالي <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                {!isPreview ? (
                  <button
                    onClick={handleComplete}
                    disabled={completedIds.includes(activeLesson.id)}
                    className={`px-10 py-5 rounded-3xl font-black text-lg transition-all flex items-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 ${
                      completedIds.includes(activeLesson.id)
                        ? "bg-emerald-500 text-white cursor-default"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {completedIds.includes(activeLesson.id) ? (
                      <>
                        <CheckCircle2 className="w-6 h-6" /> تم الإنجاز بنجاح
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />{" "}
                        إكمال الدرس والانتقال
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-primary/10 text-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-3 border border-primary/20">
                    <Info className="w-5 h-5" />
                    أنت الآن في وضع المعاينة، سيتم فتح باقي المحتوى عند تأكيد
                    تسجيلك.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <BookOpen className="w-20 h-20 mb-6 opacity-10" />
              <p className="text-xl font-bold">
                يرجى اختيار درس من القائمة الجانبية للبدء
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * مكون العلامة المائية المتحركة للحماية القصوى
 */
function MovingWatermark({ info }: { info: { name: string; id: string } }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 80, // %
        y: Math.random() * 80, // %
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute transition-all duration-4000 ease-linear whitespace-nowrap"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <div className="flex flex-col items-center opacity-[0.35] select-none pointer-events-none rotate-[-15deg]">
        <span className="text-[12px] font-black text-white uppercase tracking-tighter drop-shadow-md">
          {info.name}
        </span>
        <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">
          {info.id}
        </span>
      </div>
    </div>
  );
}
