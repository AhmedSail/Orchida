"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import type { Services } from "../service/servicesPage";
import { MultiUploader } from "@/components/MultiUploader";
import { SingleUploader } from "@/components/SingleUploader";

// ✅ Schema
const workSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().optional(),
  serviceId: z.string().min(1, "الخدمة مطلوبة"),
  category: z.string().min(2, "الفئة مطلوبة"),
  projectUrl: z.string().url("رابط غير صالح").optional(),
  priceRange: z.string().optional(),
  duration: z.string().optional(),
  imageUrl: z.string().url().min(1, "الصورة الرئيسية مطلوبة"),
  mediaUrls: z.array(z.string().url()).optional(),
});

type WorkFormValues = z.infer<typeof workSchema>;

const NewWorks = ({
  allServices,
  userId,
}: {
  allServices: Services;
  userId: string;
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      projectUrl: "",
      priceRange: "",
      duration: "",
      imageUrl: "",
      mediaUrls: [],
    },
  });

  // ✅ تجهيز البيانات قبل الإرسال
  const buildMediaFileObject = (url: string) => {
    const filename = url.split("/").pop() || "";
    const ext = filename.split(".").pop()?.toLowerCase();

    let type = "file";
    let mimeType = "application/octet-stream";

    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      type = "image";
      mimeType = "image/" + ext;
    } else if (["mp4", "mov", "avi"].includes(ext || "")) {
      type = "video";
      mimeType = "video/" + ext;
    } else if (ext === "pdf") {
      type = "document";
      mimeType = "application/pdf";
    }

    return {
      url,
      type,
      filename,
      mimeType,
      size: 0, // لو مش متاح الحجم من edgestore
    };
  };

  // داخل ملف NewWorks.tsx

  const onSubmit = async (values: WorkFormValues) => {
    setLoading(true);
    try {
      // ✅ تحقق من وجود صورة رئيسية
      if (!values.imageUrl || values.imageUrl.length === 0) {
        Swal.fire({
          icon: "error",
          title: "خطأ في الإدخال",
          text: "يجب إضافة صورة رئيسية قبل حفظ العمل.",
        });
        setLoading(false);
        return;
      }

      const mainUrl = values.imageUrl;
      const ext = mainUrl.split(".").pop()?.toLowerCase();

      let mainType = "file";
      if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
        mainType = "image";
      } else if (["mp4", "mov", "avi"].includes(ext || "")) {
        mainType = "video";
      }

      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          imageUrl: mainUrl,
          type: mainType,
          mediaFiles: values.mediaUrls?.map((url) => buildMediaFileObject(url)),
          uploaderId: userId,
        }),
      });

      if (res.ok) {
        // ✅✅✅  التعديل هنا: إعادة زر التأكيد والشرط
        const result = await Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح ✅",
          text: "هل تريد الانتقال إلى صفحة الأعمال الآن؟",
          showCancelButton: true, // إظهار زر الإلغاء
          confirmButtonText: "نعم، انتقل الآن",
          cancelButtonText: "لا، ابق هنا",
        });

        // ✅✅✅ التحقق من أن المستخدم ضغط على زر "نعم"
        if (result.isConfirmed) {
          router.push(`/admin/${userId}/works`);
        }
      } else {
        throw new Error("فشل حفظ العمل");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 space-y-8">
      <h2 className="text-2xl font-bold mb-2 text-primary">
        ➕ إضافة عمل جديد
      </h2>

      <Form {...form}>
        <form className="space-y-4">
          {/* العنوان */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل عنوان العمل" {...field} />
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
                  <Textarea placeholder="أدخل وصف العمل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الصورة / الفيديو الرئيسي</FormLabel>
                <FormControl>
                  <SingleUploader
                    bucket="protectedFiles"
                    onChange={(url) => field.onChange(url)} // رابط واحد فقط
                    initialUrl={field.value ?? ""}
                    required={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* الخدمة */}
          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الخدمة</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      const selectedService = allServices.find(
                        (s) => s.id === val
                      );
                      if (selectedService)
                        form.setValue("category", selectedService.name);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full" dir="rtl">
                      <SelectValue placeholder="اختر الخدمة" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {allServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* رابط المشروع */}
          <FormField
            control={form.control}
            name="projectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط المشروع</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* نطاق السعر */}
          <FormField
            control={form.control}
            name="priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نطاق السعر</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: 500$ - 1000$" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* المدة */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المدة</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: أسبوعين" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* وسائط إضافية */}
          <FormField
            control={form.control}
            name="mediaUrls"
            render={({ field }) => (
              <FormItem>
                <FormLabel>📂 وسائط إضافية (صور، فيديو، ملفات)</FormLabel>
                <FormControl>
                  <MultiUploader
                    bucket="protectedFiles"
                    onChange={(files) => field.onChange(files)} // files لازم تكون [{url, type, filename, mimeType, size}, ...]
                    initialUrls={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* زر الحفظ */}
          <Button
            type="submit"
            className="bg-primary w-full text-white"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> جاري الحفظ...
              </>
            ) : (
              "حفظ العمل"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewWorks;
