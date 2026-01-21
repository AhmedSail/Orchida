"use client";

import Swal from "sweetalert2";
import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React, { useState } from "react";
import { Button } from "../ui/button";
import AddModuleDialog from "./addModuleDialog";
import AddChapterDialog from "./addChapterDialog";
import AddContentDialog from "./addContentDialog";
import ViewContentDialog from "./viewContentDialog";
import EditModuleDialog from "./EditModuleDialog";
import EditChapterDialog from "./EditChapterDialog";
import { deleteFromR2, uploadToR2 } from "@/lib/r2-client";
import EditContentDialog from "./EditContentDialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Book,
  FileInput,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Video,
  FileText,
  HelpCircle,
  ChevronRight,
  GripVertical,
  Clock,
} from "lucide-react";
import { Badge } from "../ui/badge";
import AddAiPromptDialog from "./AddAiPromptDialog";
import EditAiPromptDialog from "./EditAiPromptDialog";
import { Sparkles, MessageSquare } from "lucide-react";

interface Props {
  modules: AllModules[];
  sectionId: string;
  userId: string;
  courseId: string | null;
  chapters: AllChapters[];
  contents: AllContent[];
}

const SectionContent = ({
  modules: initialModules,
  userId,
  sectionId,
  courseId,
  chapters: initialChapters,
  contents: initialContents,
}: Props) => {
  const [modules, setModules] = useState(initialModules);
  const [chapters, setChapters] = useState(initialChapters);
  const [contents, setContents] = useState(initialContents);

  const [activeModules, setActiveModules] = useState(false);
  const [activeChapterModuleId, setActiveChapterModuleId] = useState<
    string | null
  >(null);
  const [activeContentChapterId, setActiveContentChapterId] = useState<
    string | null
  >(null);
  const [activeContent, setActiveContent] = useState<AllContent | null>(null);
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  const [editChapterId, setEditChapterId] = useState<string | null>(null);
  const [editContentId, setEditContentId] = useState<string | null>(null);
  const [activeAiPrompt, setActiveAiPrompt] = useState(false);
  const [editingAiPrompt, setEditingAiPrompt] = useState<any | null>(null);
  const [aiPrompts, setAiPrompts] = useState<any[]>([]);

  const fetchAiPrompts = async () => {
    try {
      const res = await fetch(`/api/ai-prompts?sectionId=${sectionId}`);
      if (res.ok) {
        const data = await res.json();
        setAiPrompts(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    if (courseId === "a837434d-58c3-422e-a21b-1d3fd4b485a5") {
      fetchAiPrompts();
    }
  }, [courseId, sectionId]);

  const handleDeleteAiPrompt = async (id: string) => {
    const confirm = await Swal.fire({
      title: "حذف البرومبت؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "تراجع",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`/api/ai-prompts/${id}`, { method: "DELETE" });
        setAiPrompts((prev) => prev.filter((p) => p.id !== id));
        Swal.fire("تم!", "تم حذف البرومبت بنجاح", "success");
      } catch (error) {
        Swal.fire("خطأ", "فشل الحذف", "error");
      }
    }
  };

  const handleModuleAdded = (newModule: AllModules) => {
    setModules((prev) => [...prev, newModule]);
    Swal.fire({
      title: "تمت الإضافة بنجاح",
      text: "تم إنشاء الوحدة التدريبية الجديدة",
      icon: "success",
      confirmButtonColor: "#3b82f6",
    });
  };

  const handleChapterAdded = (newChapter: AllChapters) => {
    setChapters((prev) => [...prev, newChapter]);
    Swal.fire({
      title: "تمت إضافة الفصل",
      icon: "success",
      confirmButtonColor: "#10b981",
    });
  };

  const handleDeleteModule = async (id: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيؤدي هذا لحذف كافة الفصول والمحتويات المرتبطة بهذه الوحدة!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "تراجع",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`/api/modules/${id}`, { method: "DELETE" });
        setModules((prev) => prev.filter((m) => m.id !== id));
        Swal.fire("تم الحذف", "تمت إزالة الوحدة بنجاح", "success");
      } catch {
        Swal.fire("خطأ", "لم نتمكن من الحذف حالياً", "error");
      }
    }
  };

  const handleUpdateModule = async (
    id: string,
    data: { title: string; description: string },
  ) => {
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
      Swal.fire("تم التحديث", "تم حفظ التعديلات بنجاح", "success");
    } catch {
      Swal.fire("خطأ", "فشل في تحديث البيانات", "error");
    }
  };

  const handleUpdateChapter = async (
    id: string,
    data: { title: string; description: string },
  ) => {
    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setChapters((prev) => prev.map((c) => (c.id === id ? updated : c)));
      Swal.fire("تم التعديل", "تم تعديل الفصل بنجاح", "success");
    } catch {
      Swal.fire("خطأ", "فشل التعديل", "error");
    }
  };

  const handleDeleteChapter = async (id: string) => {
    const confirm = await Swal.fire({
      title: "حذف الفصل؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "نعم",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`/api/chapters/${id}`, { method: "DELETE" });
        setChapters((prev) => prev.filter((c) => c.id !== id));
        Swal.fire("تم الحذف", "تمت إزالة الفصل", "success");
      } catch {
        Swal.fire("خطأ", "فشل الحذف", "error");
      }
    }
  };

  const handleDeleteContent = async (id: string, fileUrl?: string) => {
    const confirm = await Swal.fire({
      title: "حذف المحتوى؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (confirm.isConfirmed) {
      try {
        if (fileUrl) {
          await deleteFromR2(fileUrl);
        }
        await fetch(`/api/content/${id}`, { method: "DELETE" });
        setContents((prev) => prev.filter((c) => c.id !== id));
        Swal.fire("تم!", "تم حذف المحتوى", "success");
      } catch (error) {
        Swal.fire("خطأ", "فشل الحذف", "error");
      }
    }
  };

  const handleUpdateContent = async (id: string, data: any) => {
    try {
      let fileUrl: string | null = null;
      let attachmentName: string | null = null;
      let contentType = null;

      if (data.file) {
        await fetch(`/api/content/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ removeFile: true }),
        });

        const url = await uploadToR2(data.file);

        fileUrl = url;
        attachmentName = data.file.name;
        const mimeType = data.file.type;
        if (mimeType.startsWith("image/")) contentType = "image";
        else if (mimeType.startsWith("video/")) contentType = "video";
        else contentType = "attachment";
      } else {
        contentType = data.contentType;
      }

      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          contentType,
          fileUrl,
          attachmentName,
          removeFile: data.removeFile,
          scheduledAt: data.scheduledAt,
        }),
      });

      if (!res.ok) throw new Error();
      Swal.fire("تم التحديث", "تم تعديل المحتوى بنجاح", "success");
      window.location.reload(); // Refresh to get latest data
    } catch (err) {
      Swal.fire("خطأ", "فشل التحديث", "error");
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="size-5 text-blue-500" />;
      case "image":
        return <Book className="size-5 text-emerald-500" />;
      case "attachment":
        return <FileText className="size-5 text-orange-500" />;
      case "quiz":
        return <HelpCircle className="size-5 text-indigo-500" />;
      default:
        return <HelpCircle className="size-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Action Bar */}
      <div className="p-8 bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="size-6 text-primary" />
              </div>
              إدارة محتوى الدورة
            </h3>
            <p className="text-slate-500 font-medium mr-15">
              قم بتنظيم الوحدات التدريبية والمحتوى التعليمي
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setActiveModules(true)}
              className="rounded-2xl h-14 px-8 bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-100 text-white font-black flex items-center gap-3 shadow-xl transition-all active:scale-95"
            >
              <Plus className="size-5" />
              إضافة وحدة جديدة
            </Button>

            {courseId === "a837434d-58c3-422e-a21b-1d3fd4b485a5" && (
              <Button
                onClick={() => setActiveAiPrompt(true)}
                className="rounded-2xl h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-3 shadow-xl transition-all active:scale-95 border-b-4 border-emerald-800 active:border-b-0"
              >
                <Sparkles className="size-5" />
                إضافة برومبت ذكي
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Global Dialogs */}
      {activeAiPrompt && (
        <AddAiPromptDialog
          active={activeAiPrompt}
          setActive={setActiveAiPrompt}
          sectionId={sectionId}
          onSuccess={fetchAiPrompts}
        />
      )}

      {editingAiPrompt && (
        <EditAiPromptDialog
          active={!!editingAiPrompt}
          setActive={() => setEditingAiPrompt(null)}
          prompt={editingAiPrompt}
          onSuccess={fetchAiPrompts}
        />
      )}

      {activeModules && (
        <AddModuleDialog
          userId={userId}
          sectionId={sectionId}
          active={activeModules}
          setActive={setActiveModules}
          courseId={courseId}
          onModuleAdded={handleModuleAdded}
        />
      )}

      {editContentId && (
        <EditContentDialog
          active={true}
          setActive={() => setEditContentId(null)}
          content={contents.find((c) => c.id === editContentId)!}
          onUpdate={handleUpdateContent}
        />
      )}

      {activeContent && (
        <ViewContentDialog
          active={true}
          setActive={() => setActiveContent(null)}
          content={activeContent!}
        />
      )}

      {/* Modules List */}
      <div className="space-y-6">
        <Accordion type="single" collapsible className="space-y-4">
          {modules.map((module) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border-none bg-white dark:bg-zinc-900/50 rounded-[32px] overflow-hidden border border-slate-100 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-all"
            >
              <AccordionTrigger className="px-8 py-8 hover:no-underline group">
                <div className="flex items-center gap-6 text-right w-full">
                  <div className="size-16 rounded-3xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                    <Package className="size-8" />
                  </div>
                  <div className="grow text-right space-y-1">
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                      {module.title}
                    </h4>
                    <p className="text-base text-slate-500 font-medium line-clamp-1">
                      {module.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-8 pb-8 pt-2">
                <div className="flex flex-wrap items-center gap-4 p-5 bg-slate-50 dark:bg-zinc-950/50 rounded-3xl border border-slate-100 dark:border-zinc-800 mb-8">
                  <Button
                    variant="ghost"
                    onClick={() => setEditModuleId(module.id)}
                    className="h-11 px-5 rounded-2xl font-bold gap-2 text-slate-600 hover:text-primary hover:bg-white transition-all shadow-sm"
                  >
                    <Edit3 className="size-4" /> تعديل الوحدة
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteModule(module.id)}
                    className="h-11 px-5 rounded-2xl font-bold gap-2 text-red-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                  >
                    <Trash2 className="size-4" /> حذف بالكامل
                  </Button>
                  <div className="md:grow" />
                  <Button
                    onClick={() => setActiveChapterModuleId(module.id)}
                    className="h-11 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="size-4" /> إضافة فصل جديد
                  </Button>
                </div>

                {editModuleId === module.id && (
                  <EditModuleDialog
                    active={true}
                    setActive={() => setEditModuleId(null)}
                    moduleId={module.id}
                    initialTitle={module.title}
                    initialDescription={module.description ?? ""}
                    onUpdate={handleUpdateModule}
                  />
                )}

                {activeChapterModuleId === module.id && (
                  <AddChapterDialog
                    active={true}
                    setActive={() => setActiveChapterModuleId(null)}
                    moduleId={module.id}
                    onChapterAdded={handleChapterAdded}
                  />
                )}

                {/* Chapters List */}
                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4 mr-10 border-r-2 border-slate-100 dark:border-zinc-800 pr-6"
                >
                  {chapters
                    .filter((ch) => ch.moduleId === module.id)
                    .map((chapter) => (
                      <AccordionItem
                        key={chapter.id}
                        value={chapter.id}
                        className="border-none bg-slate-50/50 dark:bg-zinc-900/30 rounded-3xl border border-slate-100 dark:border-zinc-800/50 overflow-hidden"
                      >
                        <AccordionTrigger className="px-6 py-5 hover:no-underline group/ch">
                          <div className="flex items-center gap-5 text-right w-full">
                            <div className="size-12 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center text-slate-400 group-hover/ch:text-emerald-500 group-hover/ch:shadow-lg transition-all border border-slate-100 dark:border-zinc-800">
                              <Book className="size-6" />
                            </div>
                            <div className="grow text-right">
                              <h5 className="text-xl font-black text-slate-800 dark:text-zinc-200">
                                {chapter.title}
                              </h5>
                              <p className="text-xs text-slate-400 font-bold tracking-wide mt-1">
                                {chapter.description?.slice(0, 100)}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 pb-6">
                          <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-slate-200/50 dark:border-zinc-800 pb-5 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditChapterId(chapter.id)}
                              className="h-10 px-4 rounded-xl font-bold text-slate-500 gap-2 hover:bg-white transition-all"
                            >
                              <Edit3 className="size-4" /> تعديل
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="h-10 px-4 rounded-xl font-bold text-red-400 gap-2 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="size-4" /> حذف
                            </Button>
                            <div className="grow" />
                            <Button
                              size="sm"
                              onClick={() =>
                                setActiveContentChapterId(chapter.id)
                              }
                              className="h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                            >
                              <Plus className="size-4" /> إضافة درس
                            </Button>
                          </div>

                          {editChapterId === chapter.id && (
                            <EditChapterDialog
                              active={true}
                              setActive={() => setEditChapterId(null)}
                              chapterId={chapter.id}
                              initialTitle={chapter.title}
                              initialDescription={chapter.description ?? ""}
                              onUpdate={handleUpdateChapter}
                            />
                          )}

                          {activeContentChapterId === chapter.id && (
                            <AddContentDialog
                              active={true}
                              setActive={() => setActiveContentChapterId(null)}
                              chapterId={chapter.id}
                            />
                          )}

                          {/* Lessons List */}
                          <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                              {contents
                                .filter((c) => c.chapterId === chapter.id)
                                .map((content, idx) => (
                                  <motion.div
                                    layout
                                    key={content.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group/item flex items-center justify-between p-5 bg-white dark:bg-zinc-950 rounded-[28px] border border-slate-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all"
                                  >
                                    <div className="flex items-center gap-5">
                                      <div className="size-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center group-hover/item:scale-110 transition-all shadow-sm border border-slate-100 dark:border-zinc-800">
                                        {getContentIcon(content.contentType)}
                                      </div>
                                      <div className="space-y-1">
                                        <h6 className="font-black text-slate-800 dark:text-zinc-200">
                                          {content.title}
                                        </h6>
                                        <div className="flex items-center gap-3">
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] px-2 py-0.5 rounded-lg font-black uppercase text-slate-400 border-slate-200"
                                          >
                                            {content.contentType}
                                          </Badge>
                                          {content.scheduledAt && (
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px] px-2 py-0.5 rounded-lg font-black text-blue-600 bg-blue-50 border-blue-100"
                                            >
                                              <Clock className="size-3 mr-1" />
                                              {new Date(
                                                content.scheduledAt,
                                              ).toLocaleString("ar-EG")}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                          setActiveContent(content)
                                        }
                                        className="size-11 p-0 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 shadow-sm border border-slate-100"
                                      >
                                        <Eye className="size-5" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setEditContentId(content.id)
                                        }
                                        className="size-11 p-0 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                                      >
                                        <Edit3 className="size-5" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteContent(
                                            content.id,
                                            content.videoUrl ||
                                              content.imageUrl ||
                                              content.attachmentUrl ||
                                              undefined,
                                          )
                                        }
                                        className="size-11 p-0 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 border-none shadow-sm"
                                      >
                                        <Trash2 className="size-5" />
                                      </Button>
                                    </div>
                                  </motion.div>
                                ))}
                            </AnimatePresence>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* AI Prompts Section for specific course */}
      {courseId === "a837434d-58c3-422e-a21b-1d3fd4b485a5" &&
        aiPrompts.length > 0 && (
          <div className="mt-16 space-y-8 bg-slate-50/50 dark:bg-zinc-950/50 p-10 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4">
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                  <Sparkles className="size-8 text-emerald-500 animate-pulse" />
                  إدارة البرومبتات الذكية
                </h3>
                <p className="text-slate-500 font-medium">
                  البرومبتات الجاهزة التي قمت بإضافتها لهذا القسم
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiPrompts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 border border-slate-100 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div className="space-y-6">
                    {p.imageUrl && (
                      <div className="aspect-video rounded-[32px] overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-inner">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <h4 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {p.title}
                      </h4>
                      <div className="relative">
                        <p className="text-sm text-slate-500 font-mono line-clamp-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-3xl border border-slate-100 dark:border-zinc-800 leading-relaxed">
                          {p.prompt}
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-slate-50 dark:from-zinc-950 to-transparent" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800">
                      <Button
                        variant="ghost"
                        onClick={() => setEditingAiPrompt(p)}
                        className="flex-1 h-12 rounded-2xl text-amber-600 bg-amber-50 hover:bg-amber-100 font-black gap-2 transition-all shadow-sm"
                      >
                        <Edit3 className="size-4" /> تعديل
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteAiPrompt(p.id)}
                        className="flex-1 h-12 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 font-black gap-2 transition-all shadow-sm"
                      >
                        <Trash2 className="size-4" /> حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default SectionContent;
