"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";

import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa"; // ✅ أيقونة سبينر
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ✅ تعريف Schema
const formSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  summary: z.string().optional(),
  content: z.string().optional(),
  imageFile: z.any().optional(),
  isActive: z.boolean().optional(),
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
});

export default function NewNewsForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      isActive: false,
      eventType: "news", // القيمة الافتراضية
    },
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false); // ✅ حالة التحميل

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true); // ✅ إظهار السبينر

      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;

      // ✅ رفع الصورة
      if (values.imageFile && values.imageFile[0]) {
        const uploadData = new FormData();
        uploadData.append("file", values.imageFile[0]);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
        imagePublicId = uploadJson.public_id;
      }

      // ✅ إرسال البيانات
      const payload = {
        title: values.title,
        summary: values.summary || "",
        content: values.content || "",
        publishedAt: new Date().toISOString(),
        imageUrl,
        imagePublicId,
        isActive: values.isActive, // ✅ هنا التعديل
        eventType: values.eventType, // ✅ إضافة النوع
      };

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تمت الإضافة بنجاح ✅",
          text: "تم إضافة الحدث الجديد مع الصورة",
        });
        form.reset();
        router.push("/admin/news");
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ ❌",
          text: "حدث خطأ أثناء إضافة الحدث",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تعذر الاتصال بالسيرفر",
      });
    } finally {
      setLoading(false); // ✅ إخفاء السبينر بعد الانتهاء
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
                <Input placeholder="أدخل عنوان الحدث" {...field} />
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
                <Textarea placeholder="أدخل ملخص الحدث" {...field} />
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
                <Textarea placeholder="أدخل تفاصيل الحدث" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="isActive"
          render={({ field }) => (
            <FormItem>
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* زر الإضافة مع سبينر */}
        <Button
          type="submit"
          className="bg-primary text-white w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              جاري الإضافة...
            </>
          ) : (
            "إضافة الحدث"
          )}
        </Button>
      </form>
    </Form>
  );
}
