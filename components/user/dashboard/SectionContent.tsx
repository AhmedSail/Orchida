"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  BookOpen,
  Video,
  FileText,
  Image as ImageIcon,
  Eye,
  ChevronLeft,
  PlayCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Lock,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ViewContentDialog from "@/components/instructor/viewContentDialog";
import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import CountdownTimer from "@/components/ui/CountdownTimer";

interface Props {
  modules: AllModules[];
  sectionId: string;
  userId: string;
  courseId: string | null;
  chapters: AllChapters[];
  contents: AllContent[];
}

const SectionContent = ({
  modules,
  userId,
  sectionId,
  courseId,
  chapters,
  contents,
}: Props) => {
  const [activeContent, setActiveContent] = useState<AllContent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الوقت كل ثانية لمراقبة المحتوى المجدول
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="size-5 text-blue-500" />;
      case "image":
        return <ImageIcon className="size-5 text-emerald-500" />;
      case "attachment":
        return <FileText className="size-5 text-orange-500" />;
      case "quiz":
        return <HelpCircle className="size-5 text-indigo-500" />;
      default:
        return <HelpCircle className="size-5 text-slate-400" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "فيديو تعليمي";
      case "image":
        return "وسائط بصريّة";
      case "attachment":
        return "ملف مرفق";
      case "quiz":
        return "اختبار / مسابقة";
      default:
        return "محتوى نصي";
    }
  };

  return (
    <div className="no-copy space-y-6">
      <Accordion type="single" collapsible className="space-y-4">
        {modules.map((module, mIdx) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mIdx * 0.1 }}
          >
            <AccordionItem
              value={module.id}
              className="border-none bg-white dark:bg-zinc-900/50 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-zinc-800"
            >
              <AccordionTrigger className="px-6 py-6 hover:no-underline group">
                <div className="flex items-center gap-5 text-right flex-1">
                  <div className="size-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                    <Package className="size-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                      {module.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {module.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="space-y-4 relative">
                  {/* Decorative Line */}
                  <div className="absolute top-0 right-7 bottom-0 w-px bg-slate-100 dark:bg-zinc-800" />

                  {chapters
                    .filter((ch) => ch.moduleId === module.id)
                    .map((chapter) => (
                      <div key={chapter.id} className="relative z-10 pr-12">
                        {/* Chapter Bullet */}
                        <div className="absolute top-6 right-6 size-2.5 rounded-full bg-slate-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem
                            value={chapter.id}
                            className="border-none"
                          >
                            <AccordionTrigger className="py-4 hover:no-underline text-right group/ch">
                              <div className="flex items-center gap-3">
                                <BookOpen className="size-5 text-primary group-hover/ch:scale-110 transition-transform" />
                                <span className="text-lg font-black text-slate-700 dark:text-slate-200">
                                  {chapter.title}
                                </span>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pt-2 pb-4 pr-2">
                              {chapter.description && (
                                <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6 bg-slate-50/50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 italic">
                                  {chapter.description}
                                </p>
                              )}

                              <div className="grid gap-3">
                                <AnimatePresence mode="popLayout">
                                  {contents
                                    .filter((c) => c.chapterId === chapter.id)
                                    .map((content, cIdx) => {
                                      const isLocked =
                                        content.scheduledAt &&
                                        new Date(content.scheduledAt) >
                                          currentTime;

                                      return (
                                        <motion.div
                                          layout
                                          key={content.id}
                                          initial={{ opacity: 0, x: 10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: cIdx * 0.05 }}
                                          className={`group/item flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white dark:bg-zinc-950/50 rounded-2xl border transition-all ${
                                            isLocked
                                              ? "border-slate-100 opacity-80"
                                              : "border-slate-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                          }`}
                                        >
                                          <div className="flex items-center gap-4">
                                            <div
                                              className={`size-12 rounded-xl flex items-center justify-center transition-transform border ${
                                                isLocked
                                                  ? "bg-slate-100 text-slate-400 group-hover/item:scale-100 border-slate-200"
                                                  : "bg-slate-50 dark:bg-zinc-900 group-hover/item:scale-110 border-slate-100 dark:border-zinc-800"
                                              }`}
                                            >
                                              {isLocked ? (
                                                <Lock className="size-5" />
                                              ) : (
                                                getContentIcon(
                                                  content.contentType || "text",
                                                )
                                              )}
                                            </div>
                                            <div className="space-y-1">
                                              <h4
                                                className={`font-bold transition-colors ${
                                                  isLocked
                                                    ? "text-slate-400"
                                                    : "text-slate-800 dark:text-zinc-100"
                                                }`}
                                              >
                                                {content.title}
                                              </h4>
                                              <div className="flex items-center gap-2">
                                                <Badge
                                                  variant="outline"
                                                  className={`text-[10px] font-black uppercase transition-colors h-5 ${
                                                    isLocked
                                                      ? "text-slate-300 border-slate-200"
                                                      : "text-slate-400 group-hover/item:text-primary"
                                                  }`}
                                                >
                                                  {getContentTypeLabel(
                                                    content.contentType ||
                                                      "text",
                                                  )}
                                                </Badge>
                                                {!isLocked && (
                                                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Clock className="size-3" />
                                                    متاح للعرض
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="mt-4 md:mt-0">
                                            {isLocked ? (
                                              <CountdownTimer
                                                targetDate={
                                                  new Date(content.scheduledAt!)
                                                }
                                                onComplete={() =>
                                                  setCurrentTime(new Date())
                                                }
                                              />
                                            ) : (
                                              <Button
                                                onClick={() =>
                                                  setActiveContent(content)
                                                }
                                                className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-100 font-black text-xs gap-2 shadow-xl shadow-black/5"
                                              >
                                                <Eye className="size-4" />
                                                ابدأ التعلم
                                              </Button>
                                            )}
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                </AnimatePresence>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      {activeContent && (
        <ViewContentDialog
          active={true}
          setActive={() => setActiveContent(null)}
          content={activeContent}
        />
      )}
    </div>
  );
};

export default SectionContent;
