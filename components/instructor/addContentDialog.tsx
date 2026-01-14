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
import { uploadFile } from "@/lib/multipart-upload";
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

const contentSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  description: z.string().optional(),
  contentType: z.enum(["text", "video", "image", "attachment"]),
  textContent: z.string().optional(),
  attachmentName: z.string().optional(),
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
    },
  });

  const [file, setFile] = React.useState<File>();
  const [fileUrl, setFileUrl] = React.useState<string>("");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [uploadStatus, setUploadStatus] = React.useState<
    "idle" | "uploading" | "complete" | "error"
  >("idle");
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentType = form.watch("contentType");

  React.useEffect(() => {
    if (!active) {
      form.reset();
      setFile(undefined);
      setFileUrl("");
      setUploadProgress(0);
      setUploadStatus("idle");
    }
  }, [active, form]);

  const handleFileChange = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Auto-detect content type based on file
    const mimeType = selectedFile.type;
    if (mimeType.startsWith("image/")) form.setValue("contentType", "image");
    else if (mimeType.startsWith("video/"))
      form.setValue("contentType", "video");
    else form.setValue("contentType", "attachment");

    form.setValue("attachmentName", selectedFile.name);

    try {
      const url = await uploadFile(selectedFile, (progress) =>
        setUploadProgress(Math.round(progress))
      );
      setFileUrl(url);
      setUploadStatus("complete");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      Swal.fire({
        icon: "error",
        title: "فشل الرفع",
        text: "حدث خطأ أثناء رفع الملف، يرجى المحاولة مرة أخرى.",
      });
    }
  };

  const onSubmit = async (data: ContentForm) => {
    try {
      const formData = new FormData();
      formData.append("chapterId", chapterId);
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("contentType", data.contentType);

      if (data.contentType === "text") {
        if (data.textContent) {
          formData.append("textContent", data.textContent);
        }
      } else if (fileUrl) {
        formData.append("fileUrl", fileUrl);
        if (data.attachmentName) {
          formData.append("attachmentName", data.attachmentName);
        }
      } else if (file && uploadStatus !== "complete") {
        // Fallback for safety, though it should be handled by submit disabling
        Swal.fire("يرجى الانتظار", "جاري رفع الملف...", "info");
        return;
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
    if (!file) return <UploadCloud className="size-10 text-primary/40" />;
    const type = file.type;
    if (type.startsWith("image/"))
      return <ImageIcon className="size-10 text-emerald-500" />;
    if (type.startsWith("video/"))
      return <Video className="size-10 text-blue-500" />;
    return <FileText className="size-10 text-orange-500" />;
  };

  return (
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
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                      relative group cursor-pointer border-2 border-dashed rounded-4xl p-8 transition-all duration-300
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
                            اسحب الملف هنا أو انقر للإضافة
                          </p>
                          <p className="text-sm text-slate-500 font-medium">
                            يدعم كافة التنسيقات (Video, Image, PDF, etc.)
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {uploadStatus === "uploading" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 p-6 bg-slate-900 rounded-4xl text-white shadow-2xl relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center px-1 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full animate-ping" />
                            <span className="text-xs font-black uppercase tracking-widest text-primary">
                              Uploading to Cloud...
                            </span>
                          </div>
                          <span className="text-xl font-black">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="h-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[shimmer_1s_linear_infinite]" />
                          </motion.div>
                        </div>
                        <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-[0.2em] relative z-10">
                          يرجى عدم إغلاق النافذة حتى اكتمال الرفع
                        </p>

                        {/* Background Decorative Glow */}
                        <div className="absolute -right-20 -top-20 size-64 bg-primary/10 blur-[100px] pointer-events-none" />
                      </motion.div>
                    )}

                    {uploadStatus === "complete" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500"
                      >
                        <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                          <CheckCircle2 className="size-6" />
                        </div>
                        <div className="grow">
                          <p className="font-black text-sm">
                            اكتمل الرفع بنجاح!
                          </p>
                          <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">
                            File is ready for submission
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFile(undefined);
                            setFileUrl("");
                            setUploadStatus("idle");
                          }}
                          className="hover:bg-emerald-500/20 text-emerald-500"
                        >
                          <X className="size-4" />
                        </Button>
                      </motion.div>
                    )}

                    {uploadStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500"
                      >
                        <div className="size-10 rounded-xl bg-red-500 text-white flex items-center justify-center">
                          <AlertCircle className="size-6" />
                        </div>
                        <div className="grow">
                          <p className="font-black text-sm">فشل في رفع الملف</p>
                          <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">
                            Something went wrong
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileChange(file)}
                          className="hover:bg-red-500/20 text-red-500"
                        >
                          إعادة المحاولة
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                      (contentType !== "text" && uploadStatus !== "complete")
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
  );
}
