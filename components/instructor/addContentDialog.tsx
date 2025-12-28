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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import { useEdgeStore } from "@/lib/edgestore";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: { contentType: "text" },
  });

  const [file, setFile] = React.useState<File>();
  const { edgestore } = useEdgeStore();
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  const contentType = watch("contentType");

  const onSubmit = async (data: ContentForm) => {
    let finalUrl: string | undefined;

    // لو فيه ملف لازم يترفع أولاً
    if (file) {
      const resUpload = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => setUploadProgress(progress),
      });
      finalUrl = resUpload.url;
    }

    const formData = new FormData();
    formData.append("chapterId", chapterId);
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("contentType", data.contentType);

    if (data.contentType === "text" && data.textContent) {
      formData.append("textContent", data.textContent);
    }

    if (finalUrl) {
      formData.append("fileUrl", finalUrl);
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
      Swal.fire({
        icon: "error",
        title: "فشل حفظ المحتوى ❌",
        text: "حاول مرة أخرى",
      });
    }
  };

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">➕ إضافة محتوى جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>العنوان</label>
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label>الوصف</label>
            <Input {...register("description")} />
          </div>

          <div>
            <label>نوع المحتوى</label>
            <select
              {...register("contentType")}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="text">📝 نص</option>
              <option value="video">🎥 فيديو</option>
              <option value="image">🖼️ صورة</option>
              <option value="attachment">📎 ملف</option>
            </select>
          </div>

          {contentType === "text" && (
            <div>
              <label>النص</label>
              <Input {...register("textContent")} />
            </div>
          )}

          {(contentType === "video" ||
            contentType === "image" ||
            contentType === "attachment") && (
            <div>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
              />

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-sm mt-1">{uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {contentType === "attachment" && (
            <div>
              <label>اسم الملف</label>
              <Input {...register("attachmentName")} />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
