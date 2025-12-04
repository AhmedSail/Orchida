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
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { Checkbox } from "../ui/checkbox"; // ✅ Checkbox

type News = {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  publishedAt: string | Date | null;
  isActive?: boolean;
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
  isActive: z.boolean().catch(false),
});

export default function EditNewsForm({ currentNews }: { currentNews: News }) {
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
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      let imageUrl: string | undefined = oldImage || undefined;
      let imagePublicId: string | undefined;

      if (values.imageFile && values.imageFile[0]) {
        const uploadData = new FormData();
        uploadData.append("image", values.imageFile[0]);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
        imagePublicId = uploadJson.public_id;
      }

      const payload = {
        title: values.title,
        summary: values.summary || "",
        content: values.content || "",
        publishedAt: new Date().toISOString(),
        imageUrl,
        imagePublicId,
        eventType: values.eventType,
        isActive: values.isActive,
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
        router.push("/admin/news");
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

        {/* نوع الحدث */}
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

        {/* نشط */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormLabel>نشط</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* رفع صورة */}
        <FormField
          control={form.control}
          name="imageFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الصورة</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              {oldImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">الصورة الحالية:</p>
                  <img
                    src={oldImage}
                    alt="الصورة القديمة"
                    className="w-48 rounded-md border"
                  />
                </div>
              )}
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
