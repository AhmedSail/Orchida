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
import { useEdgeStore } from "@/lib/edgestore";
import EditContentDialog from "./EditContentDialog";

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
  const { edgestore } = useEdgeStore();

  const handleModuleAdded = (newModule: AllModules) => {
    setModules((prev) => [...prev, newModule]);
    Swal.fire("نجاح ✅", "تمت إضافة الوحدة بنجاح", "success");
  };

  const handleChapterAdded = (newChapter: AllChapters) => {
    setChapters((prev) => [...prev, newChapter]);
    Swal.fire("نجاح ✅", "تمت إضافة الفصل بنجاح", "success");
  };

  const handleDeleteModule = async (id: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف الوحدة وكل الفصول والمحتويات المرتبطة بها",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`/api/modules/${id}`, { method: "DELETE" });
        setModules((prev) => prev.filter((m) => m.id !== id));
        Swal.fire("تم الحذف ✅", "تم حذف الوحدة بنجاح", "success");
      } catch {
        Swal.fire("خطأ ❌", "فشل حذف الوحدة", "error");
      }
    }
  };

  const handleUpdateModule = async (
    id: string,
    data: { title: string; description: string }
  ) => {
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
      Swal.fire("تم التعديل ✅", "تم تعديل الوحدة بنجاح", "success");
    } catch {
      Swal.fire("خطأ ❌", "فشل تعديل الوحدة", "error");
    }
  };

  const handleUpdateChapter = async (
    id: string,
    data: { title: string; description: string }
  ) => {
    try {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setChapters((prev) => prev.map((c) => (c.id === id ? updated : c)));
      Swal.fire("تم التعديل ✅", "تم تعديل الفصل بنجاح", "success");
    } catch {
      Swal.fire("خطأ ❌", "فشل تعديل الفصل", "error");
    }
  };

  const handleDeleteChapter = async (id: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف الفصل وكل المحتويات المرتبطة به",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      try {
        await fetch(`/api/chapters/${id}`, { method: "DELETE" });
        setChapters((prev) => prev.filter((c) => c.id !== id));
        Swal.fire("تم الحذف ✅", "تم حذف الفصل بنجاح", "success");
      } catch {
        Swal.fire("خطأ ❌", "فشل حذف الفصل", "error");
      }
    }
  };

  const handleDeleteContent = async (id: string, fileUrl?: string) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (confirm.isConfirmed) {
      try {
        if (fileUrl) {
          await edgestore.protectedFiles.delete({ url: fileUrl });
        }
        await fetch(`/api/content/${id}`, { method: "DELETE" });
        setContents((prev) => prev.filter((c) => c.id !== id));
        Swal.fire("تم الحذف ✅", "تم حذف المحتوى بنجاح", "success");
      } catch (error) {
        Swal.fire("خطأ ❌", "فشل حذف المحتوى", "error");
      }
    }
  };

  const handleUpdateContent = async (id: string, data: any) => {
    try {
      let fileUrl: string | null = null;
      let attachmentName: string | null = null;
      let contentType = null; // القيمة الافتراضية من الفورم

      if (data.file) {
        // أولاً نطلب من السيرفر حذف الملف القديم
        await fetch(`/api/content/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            removeFile: true,
          }),
        });

        // ثانياً نرفع الملف الجديد على EdgeStore
        const resUpload = await edgestore.protectedFiles.upload({
          file: data.file,
          onProgressChange: (progress) => {
            console.log("Upload progress:", progress);
          },
        });

        fileUrl = resUpload.url;
        attachmentName = data.file.name;

        // ✅ تحديد نوع المحتوى حسب نوع الملف
        const mimeType = data.file.type; // مثل image/png أو video/mp4 أو application/pdf
        if (mimeType.startsWith("image/")) {
          contentType = "image";
        } else if (mimeType.startsWith("video/")) {
          contentType = "video";
        } else {
          contentType = "attachment"; // أي نوع آخر يعتبر مرفق
        }
      } else {
        // لو ما في ملف جديد، نخلي النوع من الفورم
        contentType = data.contentType;
      }

      // ✅ إرسال البيانات النهائية للـ API
      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          contentType, // النوع الجديد حسب الملف
          fileUrl,
          attachmentName,
          removeFile: data.removeFile, // لو المستخدم اختار حذف بدون رفع جديد
        }),
      });

      if (!res.ok) {
        throw new Error("فشل تحديث المحتوى");
      }

      const updated = await res.json();
      console.log("✅ تم تحديث المحتوى:", updated);
    } catch (err) {
      console.error("❌ خطأ أثناء التحديث:", err);
    }
  };

  return (
    <div>
      <div>
        <Button onClick={() => setActiveModules(true)}>➕ اضافة وحدة</Button>
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

      <Accordion type="single" collapsible className="w-full mt-4">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="text-2xl hover:no-underline">
              <div className="flex items-center gap-3 text-start w-full">
                <span className="text-3xl">📦</span>
                <div className="flex-grow">
                  <h1 className="font-semibold">{module.title}</h1>
                  <p className="text-sm text-gray-500 font-normal">
                    {module.description}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-lg space-y-4 pt-4">
              <div className="flex gap-2 border-b pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModuleId(module.id)}
                >
                  ✏️ تعديل الوحدة
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteModule(module.id)}
                >
                  🗑️ حذف الوحدة
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

              <Button onClick={() => setActiveChapterModuleId(module.id)}>
                ➕ اضافة فصل
              </Button>

              {activeChapterModuleId === module.id && (
                <AddChapterDialog
                  active={true}
                  setActive={() => setActiveChapterModuleId(null)}
                  moduleId={module.id}
                  onChapterAdded={handleChapterAdded}
                />
              )}

              <Accordion
                type="single"
                collapsible
                className="ml-4 border-l pl-4"
              >
                {chapters
                  .filter((ch) => ch.moduleId === module.id)
                  .map((chapter) => (
                    <AccordionItem
                      key={chapter.id}
                      value={chapter.id}
                      className="border-b-0"
                    >
                      <AccordionTrigger className="text-lg hover:no-underline">
                        <div className="flex items-center gap-3 text-start w-full">
                          <span className="text-xl">📖</span>
                          <div className="">
                            <h2 className="font-medium">{chapter.title}</h2>
                            <p className="text-xs text-gray-500 font-normal">
                              {chapter.description}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-3">
                        <div className="flex gap-2 border-b pb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditChapterId(chapter.id)}
                          >
                            ✏️ تعديل الفصل
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteChapter(chapter.id)}
                          >
                            🗑️ حذف الفصل
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

                        <Button
                          size="sm"
                          onClick={() => setActiveContentChapterId(chapter.id)}
                        >
                          ➕ إضافة محتوى
                        </Button>

                        {activeContentChapterId === chapter.id && (
                          <AddContentDialog
                            active={true}
                            setActive={() => setActiveContentChapterId(null)}
                            chapterId={chapter.id}
                          />
                        )}

                        <div className="space-y-2">
                          {contents
                            .filter((c) => c.chapterId === chapter.id)
                            .map((content) => (
                              <div
                                key={content.id}
                                className="border rounded p-3 bg-gray-50 flex justify-between items-center"
                              >
                                <div>
                                  <h3 className="font-semibold">
                                    {content.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {content.description}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => setActiveContent(content)}
                                  >
                                    👁️
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditContentId(content.id)}
                                  >
                                    ✏️
                                  </Button>
                                  {editContentId === content.id && (
                                    <EditContentDialog
                                      active={true}
                                      setActive={() => setEditContentId(null)}
                                      content={content}
                                      onUpdate={handleUpdateContent}
                                    />
                                  )}
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteContent(
                                        content.id,
                                        content.videoUrl ||
                                          content.imageUrl ||
                                          content.attachmentUrl ||
                                          undefined
                                      )
                                    }
                                  >
                                    🗑️
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>

                        {editContentId && (
                          <EditContentDialog
                            active={true}
                            setActive={() => setEditContentId(null)}
                            content={
                              contents.find((c) => c.id === editContentId)!
                            }
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
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SectionContent;
