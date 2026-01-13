"use client";

import React from "react";
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
import { uploadToR2 } from "@/lib/r2-client";

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
    // 🔴 الحل الرئيسي هنا: تحديد القيم الافتراضية بشكل صريح
    defaultValues: {
      title: "",
      description: "",
      contentType: "text",
      textContent: "",
      attachmentName: "",
    },
  });

  const [file, setFile] = React.useState<File>();

  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  const contentType = form.watch("contentType");

  // دالة لإعادة تعيين الفورم عند إغلاق الـ Dialog
  React.useEffect(() => {
    if (!active) {
      form.reset(); // إعادة تعيين قيم الفورم إلى القيم الافتراضية
      setFile(undefined); // مسح الملف المختار
      setUploadProgress(0); // إعادة تعيين شريط التقدم
    }
  }, [active, form]);

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
      } else if (file) {
        const url = await uploadToR2(file, (progress) =>
          setUploadProgress(progress)
        );
        formData.append("fileUrl", url);
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
        });
        setActive(false);
        setTimeout(() => window.location.reload(), 200);
      } else {
        // عرض رسالة خطأ من الـ API إذا كانت موجودة
        const errorData = await res.json();
        Swal.fire({
          icon: "error",
          title: "فشل حفظ المحتوى ❌",
          text: errorData.error || "حاول مرة أخرى",
        });
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      Swal.fire({
        icon: "error",
        title: "حدث خطأ غير متوقع",
        text: "يرجى التحقق من الكونسول لمزيد من التفاصيل.",
      });
    }
  };

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">➕ إضافة محتوى جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* ... حقول الفورم تبقى كما هي ... */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>نوع المحتوى</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="text">📝 نص</option>
                      <option value="video">🎥 فيديو</option>
                      <option value="image">🖼️ صورة</option>
                      <option value="attachment">📎 ملف</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {contentType === "text" && (
              <FormField
                control={form.control}
                name="textContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>النص</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(contentType === "video" ||
              contentType === "image" ||
              contentType === "attachment") && (
              <FormItem>
                <FormLabel>اختر ملف</FormLabel>
                <FormControl>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0])}
                  />
                </FormControl>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-sm mt-1">{uploadProgress}%</p>
                  </div>
                )}
              </FormItem>
            )}

            {contentType === "attachment" && (
              <FormField
                control={form.control}
                name="attachmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الملف</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
