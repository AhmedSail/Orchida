"use client";

import React, { useState } from "react";
import {
  BookOpen,
  MessageSquare,
  AlertCircle,
  CreditCard,
  StickyNote,
  Activity,
  ArrowLeft,
  GraduationCap,
  Star,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SectionContent from "./SectionContent";
import ChatForm from "../../ChatForm";
import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";

interface Section {
  id: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
  notes?: string | null;
  instructorId?: string | null;
}

interface Props {
  user: string;
  userId: string;
  section: Section | null;
  allModules: AllModules[];
  courseId: string;
  chapters: AllChapters[];
  contents: AllContent[];
  IBAN: string | null;
  role?: string;
  posts?: any[];
  userData?: any[];
}

const Clasification = ({
  user,
  section,
  allModules,
  userId,
  courseId,
  chapters,
  contents,
  IBAN,
  role,
  posts = [],
  userData = [],
}: Props) => {
  const [activeTab, setActiveTab] = useState<
    "content" | "forum" | "recommendations" | "aiPrompts"
  >("content");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [aiPrompts, setAiPrompts] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  const fetchRecommendations = async () => {
    if (!section?.instructorId) return;
    setLoadingRecs(true);
    try {
      const res = await fetch(
        `/api/recommendations?instructorId=${section.instructorId}&sectionId=${section.id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchAiPrompts = async () => {
    if (!section?.id) return;
    setLoadingPrompts(true);
    try {
      const res = await fetch(`/api/ai-prompts?sectionId=${section.id}`);
      if (res.ok) {
        const data = await res.json();
        setAiPrompts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPrompts(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "recommendations") {
      fetchRecommendations();
    }
    if (activeTab === "aiPrompts") {
      fetchAiPrompts();
    }
  }, [activeTab, section?.instructorId, section?.id]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
        <Activity className="size-12 animate-pulse" />
        <h2 className="text-xl font-bold">❌ لا يوجد بيانات لهذه الشعبة</h2>
      </div>
    );
  }

  const tabItems: Array<{
    id: "content" | "forum" | "recommendations" | "aiPrompts";
    label: string;
    icon: any;
    color: string;
    link: string;
    action?: () => void;
  }> = [
    {
      id: "content",
      label: "المحتوى التعليمي",
      icon: BookOpen,
      color: "text-blue-500",
      link: `/${role === "user" ? "dashboardUser" : role}/${userId}/courses/${
        section?.id
      }/content`,
    },
    {
      id: "forum",
      label: "المنتدى الطلابي",
      icon: MessageSquare,
      color: "text-indigo-500",
      link: "#",
      action: () => setActiveTab("forum"),
    },
    {
      id: "recommendations",
      label: "توصيات المدرب",
      icon: Star,
      color: "text-amber-500",
      action: () => setActiveTab("recommendations"),
      link: "#",
    },
  ];

  if (courseId === "a837434d-58c3-422e-a21b-1d3fd4b485a5") {
    tabItems.splice(1, 0, {
      id: "aiPrompts",
      label: "برومبات جاهزة",
      icon: Sparkles,
      color: "text-emerald-500",
      action: () => setActiveTab("aiPrompts"),
      link: "#",
    });
  }

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Cinematic Header */}
      <div className="relative overflow-hidden p-8 md:p-14 rounded-[48px] bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)] opacity-50" />
        <div className="absolute -bottom-24 -left-24 size-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest"
            >
              <Activity className="size-4" />
              <span>أكاديمية أوركيدة - منصة الطالب</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                مرحباً <span className="text-primary">{user}</span> 👋
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium mt-4 max-w-2xl">
                أهلاً بك في محتوى{" "}
                <span className="text-white font-black">
                  {section.courseTitle}
                </span>
                <br />
                نحن هنا لندعم رحلتك التعليمية في الشعبة رقم{" "}
                <span className="text-primary font-black">
                  {section.sectionNumber}
                </span>
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6 bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10"
          >
            <div className="text-center px-4">
              <span className="block text-4xl font-black text-white">
                {allModules.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                وحدة تعليمية
              </span>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <GraduationCap className="size-6" />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                مستوى متقدم
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex flex-wrap gap-3 p-2 bg-slate-100 dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-zinc-800">
        {tabItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.link && item.link !== "#") {
                  router.push(item.link);
                }
              }}
              className={`
                relative px-8 py-4 rounded-3xl flex items-center gap-3 transition-all duration-300
                ${
                  isActive
                    ? "bg-white dark:bg-zinc-800 shadow-xl shadow-black/5"
                    : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5"
                }
              `}
            >
              <item.icon
                className={`size-5 ${isActive ? item.color : "text-slate-400"}`}
              />
              <span
                className={`font-black text-sm ${
                  isActive ? "text-slate-800 dark:text-white" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-student-tab"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === "content" && (
            <div className="space-y-8">
              {/* Important Notes & IBAN Redesign */}
              {(IBAN || section.notes || true) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* General Notes Box */}
                  <div className="p-8 rounded-[40px] bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                      <AlertCircle className="size-24 text-blue-600" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                        <StickyNote className="size-6" />
                        <h3 className="text-xl font-black tracking-tight">
                          ملاحظات هامة
                        </h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {section.notes ||
                          "سوف يتم إضافة جميع الملاحظات المهمة الخاصة بالدورة في هذا القسم لمتابعتها باستمرار."}
                      </p>
                    </div>
                  </div>

                  {/* IBAN Box (Conditional) */}
                  {IBAN && (
                    <div className="p-8 rounded-[40px] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <CreditCard className="size-24 text-emerald-600" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                          <CreditCard className="size-6" />
                          <h3 className="text-xl font-black tracking-tight">
                            بيانات الدفع (IBAN)
                          </h3>
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                          <span className="font-mono text-lg font-black text-slate-800 dark:text-emerald-400 tracking-wider">
                            {IBAN}
                          </span>
                          <Badge className="bg-emerald-500 text-white border-none font-bold">
                            نشط
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Course Content Section Title */}
              <div className="flex items-center gap-4 px-2">
                <div className="h-8 w-1.5 bg-primary rounded-full" />
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                  منهاج الدورة
                </h2>
              </div>

              {/* Actual Content Wrapper */}
              <div className="bg-white/50 dark:bg-zinc-900/30 rounded-[48px] p-2 border border-slate-100 dark:border-zinc-800">
                <SectionContent
                  modules={allModules}
                  sectionId={section.id}
                  userId={userId}
                  courseId={courseId}
                  chapters={chapters}
                  contents={contents}
                />
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                <div className="h-8 w-1.5 bg-amber-500 rounded-full" />
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                    توصيات المدرب للطلاب
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    نصائح، أدوات، ومنتجات مهمة يوصي بها مدرب الدورة
                  </p>
                </div>
              </div>

              {loadingRecs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-64 rounded-[40px] bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative flex flex-col bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all h-full"
                    >
                      <div className="relative h-44 overflow-hidden">
                        {rec.imageUrl ? (
                          <img
                            src={rec.imageUrl}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-300">
                            <ImageIcon className="size-16" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="p-6 flex flex-col flex-1 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg">
                            توصية المدرب
                          </span>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                            {rec.title}
                          </h4>
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs line-clamp-3 leading-relaxed">
                          {rec.description}
                        </p>

                        <div className="pt-4 mt-auto">
                          <a
                            href={rec.linkUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-100 text-white font-black flex items-center justify-center gap-2 group/btn transition-all text-sm"
                          >
                            <LinkIcon className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                            فتح التوصية
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-center gap-6">
                  <div className="size-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <Star className="size-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      لا توجد توصيات حالياً
                    </h3>
                    <p className="text-slate-500 font-medium">
                      سوف تظهر هنا أي أدوات أو منتجات ينصح بها المدرب.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "forum" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ChatForm
                section={[
                  {
                    id: section.id,
                    sectionNumber: section.sectionNumber,
                    startDate: section.startDate,
                    endDate: section.endDate,
                    courseTitle: section.courseTitle,
                    status: (section as any).status,
                  },
                ]}
                userData={userData}
                posts={posts}
                isEmbedded={true}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Placeholder Badge if UI folder doesn't have it (though most our projects do)
const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${className}`}
  >
    {children}
  </span>
);

export default Clasification;
