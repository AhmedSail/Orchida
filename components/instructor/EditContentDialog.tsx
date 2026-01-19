"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AllContent } from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import {
  UploadCloud,
  File,
  Video,
  Image as ImageIcon,
  FileText,
  X,
  Edit3,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const contentSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  description: z.string().optional(),
  contentType: z.enum(["text", "video", "image", "attachment"]),
  textContent: z.string().optional(),
  attachmentName: z.string().optional(),
  scheduledAt: z.string().optional(),
});

type ContentForm = z.infer<typeof contentSchema>;

interface Props {
  active: boolean;
  setActive: (val: boolean) => void;
  content: AllContent;
  onUpdate: (
    id: string,
    data: {
      title: string;
      description: string;
      contentType: string;
      file?: File | null;
      removeFile?: boolean;
      textContent?: string;
      scheduledAt?: string;
    },
  ) => Promise<void>;
}

export default function EditContentDialog({
  active,
  setActive,
  content,
  onUpdate,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: content.title,
      description: content.description ?? "",
      contentType: (content.contentType as any) ?? "text",
      textContent: content.textContent ?? "",
      attachmentName: content.attachmentName ?? "",
      scheduledAt: content.scheduledAt
        ? new Date(content.scheduledAt).toISOString().slice(0, 16)
        : "",
    },
  });

  const contentType = form.watch("contentType");

  useEffect(() => {
    if (active) {
      form.reset({
        title: content.title,
        description: content.description ?? "",
        contentType: (content.contentType as any) ?? "text",
        textContent: content.textContent ?? "",
        attachmentName: content.attachmentName ?? "",
        scheduledAt: content.scheduledAt
          ? new Date(content.scheduledAt).toISOString().slice(0, 16)
          : "",
      });
      setFile(null);
      setUploadProgress(0);
    }
  }, [active, content, form]);

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    // Auto-detect content type based on file
    const mimeType = selectedFile.type;
    if (mimeType.startsWith("image/")) form.setValue("contentType", "image");
    else if (mimeType.startsWith("video/"))
      form.setValue("contentType", "video");
    else form.setValue("contentType", "attachment");

    form.setValue("attachmentName", selectedFile.name);
  };

  const handleSave = async (data: ContentForm) => {
    await onUpdate(content.id, {
      title: data.title,
      description: data.description || "",
      contentType: data.contentType,
      textContent: data.textContent,
      scheduledAt: data.scheduledAt,
      file: file,
    });
    setActive(false);
  };

  const getFileIcon = () => {
    if (file) {
      const type = file.type;
      if (type.startsWith("image/"))
        return <ImageIcon className="size-10 text-emerald-500" />;
      if (type.startsWith("video/"))
        return <Video className="size-10 text-blue-500" />;
      return <FileText className="size-10 text-orange-500" />;
    }

    // Return icon based on existing content if no new file
    switch (content.contentType) {
      case "image":
        return <ImageIcon className="size-10 text-emerald-500" />;
      case "video":
        return <Video className="size-10 text-blue-500" />;
      case "attachment":
        return <FileText className="size-10 text-orange-500" />;
      default:
        return <UploadCloud className="size-10 text-primary/40" />;
    }
  };

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent
        className="sm:max-w-2xl rounded-4xl border-none shadow-2xl p-0 overflow-hidden"
        dir="rtl"
      >
        <div className="bg-slate-900 border-b border-white/10 p-8">
          <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Edit3 className="size-6" />
            </div>
            تعديل محتوى الدرس
          </DialogTitle>
          <p className="text-slate-400 font-medium text-sm mt-2 pr-14">
            تحديث بيانات المحتوى التعليمي الحالي
          </p>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">
                        عنوان الدرس
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="عنوان الدرس..."
                          className="rounded-2xl h-12 border-slate-200 focus:ring-primary shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">
                        نوع المحتوى
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full h-12 rounded-2xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-600 bg-slate-50"
                        >
                          <option value="text">📝 نص تعليمي</option>
                          <option value="video">🎥 فيديو تدريبي</option>
                          <option value="image">🖼️ صورة توضيحية</option>
                          <option value="attachment">📎 ملف مرفق</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      وصف قصير
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="أضف وصفاً بسيطاً..."
                        className="rounded-2xl h-12 border-slate-200 focus:ring-primary shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      وقت الظهور (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        className="rounded-2xl h-12 border-slate-200 focus:ring-primary shadow-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {contentType === "text" ? (
                <FormField
                  control={form.control}
                  name="textContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">
                        محتوى النص
                      </FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={6}
                          placeholder="اكتب المحتوى التعليمي هنا..."
                          className="w-full rounded-3xl border border-slate-200 p-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-600 resize-none min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <FormLabel className="font-bold text-slate-700">
                    الملف التعليمي
                  </FormLabel>

                  {/* Current File Preview if exists and no new file selected */}
                  {!file &&
                    (content.videoUrl ||
                      content.imageUrl ||
                      content.attachmentUrl) && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                        <p className="text-xs font-bold text-slate-400 mb-2">
                          المحتوى الحالي:
                        </p>
                        {content.imageUrl && (
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-sm">
                            <Image
                              fill
                              src={content.imageUrl}
                              alt={content.title}
                              className="object-cover"
                            />
                          </div>
                        )}
                        {content.videoUrl && (
                          <div className="rounded-xl overflow-hidden shadow-sm border bg-black aspect-video flex items-center justify-center">
                            <Video className="size-12 text-white/20" />
                            <p className="absolute text-white/50 text-xs font-bold mt-16 text-center px-4 truncate w-full">
                              {content.videoUrl.split("/").pop()}
                            </p>
                          </div>
                        )}
                        {content.attachmentUrl && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                            <FileText className="size-6 text-orange-500" />
                            <span className="text-sm font-bold text-slate-600 truncate flex-1">
                              {content.attachmentName || "ملف مرفق"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  <motion.div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) handleFileChange(droppedFile);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative group cursor-pointer border-2 border-dashed rounded-[32px] p-8 transition-all duration-300
                      ${
                        isDragging
                          ? "bg-primary/10 border-primary scale-95"
                          : "bg-slate-50 border-slate-200 hover:border-primary/50 hover:bg-white"
                      }
                      ${file ? "border-emerald-500/50 bg-emerald-50/50" : ""}
                    `}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                      accept={
                        contentType === "video"
                          ? "video/*"
                          : contentType === "image"
                            ? "image/*"
                            : "*"
                      }
                    />

                    <div className="flex flex-col items-center justify-center text-center gap-4">
                      <div
                        className={`p-4 rounded-2xl ${
                          file ? "bg-emerald-100" : "bg-white"
                        } shadow-xl group-hover:scale-110 transition-transform`}
                      >
                        {getFileIcon()}
                      </div>

                      {file ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-lg font-black text-emerald-700 truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-sm text-emerald-600/60 font-medium">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • جاهز
                            للرفع
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-black text-slate-700">
                            انقر هنا لتغيير الملف أو اسحبه
                          </p>
                          <p className="text-sm text-slate-500 font-medium">
                            يمكنك استبدال الملف الحالي بملف جديد
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-slate-100">
                <div className="flex w-full gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setActive(false)}
                    className="flex-1 h-14 rounded-2xl font-black text-slate-500 hover:bg-slate-100"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="flex-2 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري الحفظ...</span>
                      </div>
                    ) : (
                      "حفظ التعديلات"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
