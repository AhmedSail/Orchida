"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox"; // ✅ Checkbox
import Image from "next/image";
import { deleteFromR2, uploadToR2 } from "@/lib/r2-client";
import { UploaderProvider } from "@/src/components/upload/uploader-provider";
import { SingleImageDropzone } from "@/src/components/upload/single-image";

type News = {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  publishedAt: string | Date | null;
  isActive?: boolean;
  isSlider: boolean;
  bgColor: string | null;
  eventType?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

const formSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  summary: z.string().optional(),
  content: z.string().optional(),
  imageFile: z.any().optional(),
  eventType: z.enum([
    "news",
    "announcement",
    "article",
    "event",
    "update",
    "blog",
    "pressRelease",
    "promotion",
    "alert",
  ]),
  isActive: z.boolean(),
  isSlider: z.boolean(),
  bgColor: z.string().optional(),
});

export default function EditNewsForm({
  currentNews,
  userId,
  role,
}: {
  currentNews: News;
  userId: string;
  role: string;
}) {
  const [oldImage, setOldImage] = useState<string | null>(
    currentNews.imageUrl || null
  );
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentNews.title || "",
      summary: currentNews.summary || "",
      content: currentNews.content || "",
      eventType: (currentNews.eventType as any) || "news",
      isActive: currentNews.isActive ?? false,
      isSlider: currentNews.isSlider ?? false,
      bgColor: currentNews.bgColor || "#6e5e9b",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      let imageUrl = currentNews?.imageUrl ?? "";

      if (values.imageFile) {
        // ✅ أولاً نحذف الصورة القديمة إذا موجودة
        if (currentNews?.imageUrl) {
          await deleteFromR2(currentNews.imageUrl);
        }

        // ✅ ثم نرفع الصورة الجديدة
        imageUrl = await uploadToR2(values.imageFile, (progress) => {});
      }

      const payload = {
        title: values.title,
        summary: values.summary || "",
        content: values.content || "",
        publishedAt: new Date().toISOString(),
        imageUrl,
        eventType: values.eventType,
        isActive: values.isActive,
        isSlider: values.isSlider,
        bgColor: values.bgColor,
      };

      const res = await fetch(`/api/news/${currentNews.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم التعديل بنجاح ✅",
          text: "تم تحديث الحدث",
        });
        router.push(`/${role}/${userId}/news`);
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ ❌",
          text: "حدث خطأ أثناء تعديل الحدث",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تعذر الاتصال بالسيرفر",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-6 border rounded-lg shadow-sm"
      >
        {/* العنوان */}
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

        {/* الملخص */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الملخص</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* المحتوى */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المحتوى</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الحدث</FormLabel>
                <FormControl>
                  <select {...field} className="border rounded-md p-2 w-full">
                    <option value="news">خبر</option>
                    <option value="announcement">إعلان</option>
                    <option value="article">مقال</option>
                    <option value="event">فعالية</option>
                    <option value="update">تحديث</option>
                    <option value="blog">مدونة</option>
                    <option value="pressRelease">بيان صحفي</option>
                    <option value="promotion">عرض ترويجي</option>
                    <option value="alert">تنبيه</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bgColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>لون الخلفية (للسلايدر)</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border rounded-md p-2 w-full bg-white transition-all focus:ring-2 focus:ring-purple-500"
                    style={{ borderRight: `8px solid ${field.value}` }}
                  >
                    <option value="#6e5e9b">البنفسجي</option>
                    <option value="#e0b016">الذهبي</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-10 bg-gray-50 p-4 rounded-xl">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="mr-3 leading-none">
                  <FormLabel className="text-sm font-medium">نشط</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isSlider"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="mr-3 leading-none">
                  <FormLabel className="text-sm font-medium">
                    تفعيل السلايدر
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الصورة</FormLabel>
              <FormControl>
                <UploaderProvider
                  uploadFn={async ({ file, onProgressChange, signal }) => {
                    // رفع الصورة عبر EdgeStore
                    const url = await uploadToR2(file, onProgressChange);
                    // نخزن الملف في الفورم
                    field.onChange(file);
                    // إذا بدك تحفظ الرابط مباشرةً:
                    // field.onChange(res.url);
                    return { url };
                  }}
                  autoUpload
                >
                  <SingleImageDropzone
                    height={200}
                    width={200}
                    dropzoneOptions={{
                      maxSize: 1024 * 1024 * 1, // 1 MB
                    }}
                  />
                  {oldImage && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">الصورة الحالية:</p>
                      <Image
                        src={oldImage}
                        alt="الصورة القديمة"
                        width={100}
                        height={100}
                        className="w-48 rounded-md border"
                        unoptimized
                      />
                    </div>
                  )}
                </UploaderProvider>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* زر التعديل مع سبينر */}
        <Button
          type="submit"
          className="bg-primary text-white w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              جاري التعديل...
            </>
          ) : (
            "تعديل الحدث"
          )}
        </Button>
      </form>
    </Form>
  );
}
