"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AllContent } from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import Image from "next/image";

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
    }
  ) => Promise<void>;
}

export default function EditContentDialog({
  active,
  setActive,
  content,
  onUpdate,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ إعداد الفورم
  const form = useForm({
    defaultValues: {
      title: content.title,
      description: content.description ?? "",
      contentType: content.contentType ?? "text",
    },
  });

  const handleSave = async (values: any) => {
    setLoading(true);
    await onUpdate(content.id, {
      ...values,
      file,
      removeFile,
    });
    setLoading(false);
    setActive(false);
  };

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>✏️ تعديل المحتوى</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {/* العنوان */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="عنوان المحتوى" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الوصف */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="وصف المحتوى" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الملف الحالي */}
            {content.contentType !== "text" && (
              <div className="border p-2 rounded">
                <p className="text-sm text-gray-600 mb-2">الملف الحالي:</p>
                {content.imageUrl && (
                  <Image
                    width={40}
                    height={40}
                    src={content.imageUrl}
                    alt={content.title}
                    className="w-full object-cover rounded h-96"
                    unoptimized
                  />
                )}
                {content.videoUrl && (
                  <video
                    src={content.videoUrl}
                    controls
                    className="w-full rounded mt-2 h-96"
                  />
                )}
                {content.attachmentUrl && (
                  <a
                    href={content.attachmentUrl}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    {content.attachmentName || "ملف مرفق"}
                  </a>
                )}
              </div>
            )}

            {/* نوع المحتوى */}
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

            {/* رفع ملف جديد */}
            <div>
              <p className="text-sm text-gray-600 mb-1">رفع ملف جديد:</p>
              <Input
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);

                  if (selectedFile) {
                    const mimeType = selectedFile.type;
                    if (mimeType.startsWith("image/")) {
                      form.setValue("contentType", "image");
                    } else if (mimeType.startsWith("video/")) {
                      form.setValue("contentType", "video");
                    } else {
                      form.setValue("contentType", "attachment");
                    }
                  }
                }}
              />
            </div>

            {/* أزرار التحكم */}
            <DialogFooter>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setActive(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
