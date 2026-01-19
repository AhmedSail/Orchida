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
      default:
        return <HelpCircle className="size-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800 dark:text-white">
            إدارة الوحدات
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            قم بتنظيم محتوى الدورة التدريبية
          </p>
        </div>
        <Button
          onClick={() => setActiveModules(true)}
          className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-black flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="size-5" />
          إضافة وحدة جديدة
        </Button>

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
      </div>

      {/* Modules List */}
      <Accordion type="single" collapsible className="space-y-4">
        {modules.map((module) => (
          <AccordionItem
            key={module.id}
            value={module.id}
            className="border-none bg-white dark:bg-black/20 rounded-[32px] overflow-hidden border border-slate-100 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-all"
          >
            <AccordionTrigger className="px-6 py-6 hover:no-underline group">
              <div className="flex items-center gap-5 text-right w-full">
                <div className="size-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Package className="size-8" />
                </div>
                <div className="grow text-right">
                  <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                    {module.title}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">
                    {module.description}
                  </p>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-800 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditModuleId(module.id)}
                  className="h-9 px-4 rounded-xl font-bold gap-2 text-slate-600 hover:text-primary transition-colors"
                >
                  <Edit3 className="size-4" /> تعديل
                </Button>
                <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteModule(module.id)}
                  className="h-9 px-4 rounded-xl font-bold gap-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="size-4" /> حذف
                </Button>
                <div className="grow" />
                <Button
                  onClick={() => setActiveChapterModuleId(module.id)}
                  className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold gap-2"
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
                className="space-y-3 mr-8 border-r-2 border-slate-100 dark:border-zinc-800 pr-4"
              >
                {chapters
                  .filter((ch) => ch.moduleId === module.id)
                  .map((chapter) => (
                    <AccordionItem
                      key={chapter.id}
                      value={chapter.id}
                      className="border-none bg-slate-50/50 dark:bg-zinc-900/30 rounded-2xl border border-slate-100 dark:border-zinc-800/50 overflow-hidden"
                    >
                      <AccordionTrigger className="px-5 py-4 hover:no-underline group/ch">
                        <div className="flex items-center gap-4 text-right w-full">
                          <div className="size-10 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center text-slate-400 group-hover/ch:text-emerald-500 group-hover/ch:shadow-lg group-hover/ch:shadow-emerald-500/10 transition-all">
                            <Book className="size-5" />
                          </div>
                          <div className="grow text-right">
                            <h5 className="font-bold text-slate-800 dark:text-zinc-200">
                              {chapter.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {chapter.description?.slice(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-5 pb-5">
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-zinc-800 pb-4 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditChapterId(chapter.id)}
                            className="h-8 px-3 rounded-lg text-[11px] font-black text-slate-500 gap-1.5 hover:bg-white transition-all"
                          >
                            <Edit3 className="size-3" /> تعديل الفصل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="h-8 px-3 rounded-lg text-[11px] font-black text-red-400 gap-1.5 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="size-3" /> حذف
                          </Button>
                          <div className="grow" />
                          <Button
                            size="sm"
                            onClick={() =>
                              setActiveContentChapterId(chapter.id)
                            }
                            className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black gap-1.5 shadow-md shadow-emerald-500/10"
                          >
                            <Plus className="size-3" /> إضافة درس
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
                        <div className="space-y-2">
                          <AnimatePresence mode="popLayout">
                            {contents
                              .filter((c) => c.chapterId === chapter.id)
                              .map((content, idx) => (
                                <motion.div
                                  layout
                                  key={content.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="group/item flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center group-hover/item:scale-110 transition-transform shadow-sm">
                                      {getContentIcon(content.contentType)}
                                    </div>
                                    <div className="space-y-0.5">
                                      <h6 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                                        {content.title}
                                      </h6>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-[8px] px-1.5 py-0 rounded-md font-black uppercase text-slate-400 border-slate-100"
                                        >
                                          {content.contentType}
                                        </Badge>
                                        {content.scheduledAt && (
                                          <Badge
                                            variant="secondary"
                                            className="text-[8px] px-1.5 py-0 rounded-md font-black text-blue-500 bg-blue-50 border-blue-100"
                                          >
                                            <Clock className="size-2 mr-1" />
                                            {new Date(
                                              content.scheduledAt,
                                            ).toLocaleString("ar-EG")}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => setActiveContent(content)}
                                      className="size-9 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 shadow-sm"
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setEditContentId(content.id)
                                      }
                                      className="size-9 p-0 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                                    >
                                      <Edit3 className="size-4" />
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
                                      className="size-9 p-0 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border-none shadow-sm"
                                    >
                                      <Trash2 className="size-4" />
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

      {/* Global Dialogs */}
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
          content={activeContent}
        />
      )}
    </div>
  );
};

export default SectionContent;
