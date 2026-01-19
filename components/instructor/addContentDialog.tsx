import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import {
  UploadCloud,
  File,
  Video,
  Image as ImageIcon,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InstructorMediaLibrary from "./InstructorMediaLibrary";
import { FolderOpen } from "lucide-react";

const contentSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  description: z.string().optional(),
  contentType: z.enum(["text", "video", "image", "attachment"]),
  textContent: z.string().optional(),
  attachmentName: z.string().optional(),
  scheduledAt: z.string().optional(),
});

type ContentForm = z.infer<typeof contentSchema>;

export default function AddContentDialog({
  active,
  setActive,
  chapterId,
}: {
  active: boolean;
  setActive: (open: boolean) => void;
  chapterId: string;
}) {
  const form = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: "text",
      textContent: "",
      attachmentName: "",
      scheduledAt: "",
    },
  });

  const [fileUrl, setFileUrl] = React.useState<string>("");
  const [showLibrary, setShowLibrary] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentType = form.watch("contentType");

  React.useEffect(() => {
    if (!active) {
      form.reset();
      setFileUrl("");
    }
  }, [active, form]);

  const handleLibrarySelect = (selected: {
    url: string;
    type: "image" | "video" | "file";
    name: string;
  }) => {
    setFileUrl(selected.url);

    // Map library type to form content type
    const typeMap = {
      image: "image",
      video: "video",
      file: "attachment",
    } as const;

    form.setValue(
      "contentType",
      (typeMap[selected.type] as any) || "attachment",
    );
    form.setValue("attachmentName", selected.name);
  };

  const onSubmit = async (data: ContentForm) => {
    try {
      const formData = new FormData();
      formData.append("chapterId", chapterId);
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("contentType", data.contentType);
      if (data.scheduledAt) formData.append("scheduledAt", data.scheduledAt);

      if (data.contentType === "text") {
        if (data.textContent) {
          formData.append("textContent", data.textContent);
        }
      } else {
        if (!fileUrl) {
          Swal.fire("تنبيه", "يرجى اختيار ملف من المكتبة", "warning");
          return;
        }
        formData.append("fileUrl", fileUrl);
        if (data.attachmentName) {
          formData.append("attachmentName", data.attachmentName);
        }
      }

      const res = await fetch("/api/content", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح ✅",
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: "rounded-[32px]",
          },
        });
        setActive(false);
        setTimeout(() => window.location.reload(), 200);
      } else {
        const errorData = await res.json();
        Swal.fire({
          icon: "error",
          title: "فشل حفظ المحتوى ❌",
          text: errorData.error || "حاول مرة أخرى",
          customClass: {
            popup: "rounded-[32px]",
          },
        });
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ غير متوقع",
        text: "يرجى التحقق من الكونسول لمزيد من التفاصيل.",
        customClass: {
          popup: "rounded-[32px]",
        },
      });
    }
  };

  const getFileIcon = () => {
    // Attempt to guess type from form
    const type = form.getValues("contentType");

    if (type === "image")
      return <ImageIcon className="size-10 text-emerald-500" />;
    if (type === "video") return <Video className="size-10 text-blue-500" />;
    return <FileText className="size-10 text-orange-500" />;
  };

  return (
    <>
      <Dialog open={active} onOpenChange={setActive}>
        <DialogContent
          className="sm:max-w-2xl rounded-5xl border-none shadow-2xl p-0 overflow-hidden"
          dir="rtl"
        >
          <div className="bg-slate-900 border-b border-white/10 p-8">
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Plus className="size-6" />
              </div>
              إضافة درس جديد
            </DialogTitle>
            <p className="text-slate-400 font-medium text-sm mt-2 pr-14">
              قم بتعبئة البيانات أدناه لإضافة محتوى تعليمي للفصل
            </p>
          </div>

          <div className="p-8">
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
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
                            placeholder="مثلاً: مقدمة في لغة البرمجة"
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
                          placeholder="أضف وصفاً بسيطاً لهذا الدرس..."
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
                      ملف المحتوى (الفيديو / الصورة / المرفق)
                    </FormLabel>

                    {!fileUrl ? (
                      <div
                        onClick={() => setShowLibrary(true)}
                        className="border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all gap-4 group"
                      >
                        <div className="size-16 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center shadow-sm transition-all">
                          <FolderOpen className="size-8 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="font-black text-slate-700 group-hover:text-primary text-lg">
                            اضغط لاختيار ملف من المكتبة
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">
                            يجب رفع الملفات للمكتبة أولاً ثم اختيارها هنا
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 flex items-center gap-6">
                        <div className="size-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-slate-100">
                          {getFileIcon()}
                        </div>
                        <div className="grow">
                          <h4 className="font-bold text-slate-800 text-lg truncate">
                            {form.watch("attachmentName")}
                          </h4>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            معاينة الملف
                          </a>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowLibrary(true)}
                          className="shrink-0 font-bold"
                        >
                          تغيير الملف
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter className="pt-4">
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
                      disabled={
                        form.formState.isSubmitting ||
                        (contentType !== "text" && !fileUrl)
                      }
                      className="flex-2 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {form.formState.isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <div className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جاري الحفظ...</span>
                        </div>
                      ) : (
                        "حفظ الدرس وتأكيد المحتوى"
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </div>

          <style jsx global>{`
            @keyframes shimmer {
              from {
                background-position: 0 0;
              }
              to {
                background-position: 24px 0;
              }
            }
          `}</style>
        </DialogContent>
      </Dialog>
      <InstructorMediaLibrary
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelect={handleLibrarySelect}
      />
    </>
  );
}
