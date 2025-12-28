"use client";

import { useForm, SubmitHandler } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEdgeStore } from "@/lib/edgestore";

// 1) Zod schema أولاً
const sliderSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  imageFile: z.instanceof(File).refine((file) => file.size > 0, "يجب رفع صورة"),
  description: z.string().optional(),
  isActive: z.boolean(),
  order: z.coerce
    .number()
    .min(1, "ترتيب العرض يجب أن يكون رقم موجب")
    .default(1),
});

// 2) النوع المستنتج من Zod
type SliderFormValues = z.infer<typeof sliderSchema>;

export default function AddPhotoToSlider({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  // 3) useForm مضبوط بنفس النوع
  const form = useForm<SliderFormValues>({
    resolver: zodResolver(sliderSchema) as any,
    defaultValues: {
      title: "",
      imageFile: undefined,
      description: "",
      isActive: true,
      order: 1,
    },
    mode: "onSubmit",
  });
  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const isValid = img.width === 1920 && img.height === 1072;
        resolve(isValid);
      };

      img.onerror = () => resolve(false);
    });
  };

  // 4) onSubmit مطابق لـ SubmitHandler
  const onSubmit: SubmitHandler<SliderFormValues> = async (values) => {
    try {
      setLoading(true);

      let imageUrl: string | undefined;

      if (values.imageFile) {
        const isValid = await validateImageDimensions(values.imageFile);

        if (!isValid) {
          Swal.fire({
            icon: "error",
            title: "الصورة غير مناسبة ❌",
            text: "يجب اختيار صورة بأبعاد 1920 عرض × 1072 ارتفاع.",
          });
          setLoading(false);
          return;
        }

        if (values.imageFile) {
          const resUpload = await edgestore.publicFiles.upload({
            file: values.imageFile,
            onProgressChange: (progress) => {
              // لو بدك تعمل progress bar
              console.log("Upload progress:", progress);
            },
          });

          imageUrl = resUpload.url; // الرابط النهائي من EdgeStore
        }
      }

      if (!imageUrl) {
        Swal.fire({
          icon: "error",
          title: "خطأ في رفع الصورة",
          text: "تأكد من رفع الصورة وإعادة المحاولة",
        });
        return;
      }

      const payload = {
        id: uuidv4(),
        title: values.title,
        description: values.description ?? "",
        isActive: values.isActive,
        order: values.order ?? 1,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تمت الإضافة بنجاح ✅",
          text: "تم إضافة السلايدر مع الصورة",
        });
        form.reset();
        router.push(`/admin/${userId}/slider`);
      } else {
        const errText = await res.text();
        Swal.fire({
          icon: "error",
          title: "خطأ ❌",
          text: `حدث خطأ أثناء إضافة السلايدر: ${errText || "غير معروف"}`,
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
    <div className="mx-auto p-6 bg-white rounded-xl" dir="rtl">
      <h1 className="text-xl font-bold text-primary mb-4">
        ➕ إضافة سلايدر جديد
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* العنوان */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان</FormLabel>
                <FormControl>
                  <Input placeholder="اكتب عنوان السلايدر" {...field} />
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
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
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
                  <Textarea
                    placeholder="اكتب وصف السلايدر (اختياري)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ترتيب العرض */}
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ترتيب العرض</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="مثال: 1 أو 2 أو 3"
                    value={field.value ?? 1}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : 1
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* حالة التفعيل */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>مفعل</FormLabel>
              </FormItem>
            )}
          />

          {/* زر الإرسال مع سبينر */}
          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary/80 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                جاري الحفظ...
              </>
            ) : (
              "حفظ السلايدر"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
