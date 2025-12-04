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
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// ✅ Zod schema
const sliderSchema = z.object({
  title: z.string().min(2, "العنوان مطلوب"),
  imageFile: z.instanceof(File).optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  order: z.coerce
    .number()
    .min(1, "ترتيب العرض يجب أن يكون رقم موجب")
    .default(1),
});

type SliderFormValues = z.infer<typeof sliderSchema>;

export default function EditSliderPage() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams();

  const form = useForm<SliderFormValues>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      title: "",
      description: "",
      isActive: true,
      order: 1,
      imageFile: undefined,
    },
  });

  // ✅ جلب بيانات السلايدر عند فتح الصفحة
  useEffect(() => {
    const fetchSlider = async () => {
      const res = await fetch(`/api/slider/${id}`);
      const data = await res.json();
      if (data) {
        form.reset({
          title: data.title,
          description: data.description,
          isActive: data.isActive,
          order: data.order,
          imageFile: undefined,
        });
        setImagePreview(data.imageUrl);
      }
    };
    fetchSlider();
  }, [id]);

  // ✅ إرسال التعديلات
  const onSubmit: SubmitHandler<SliderFormValues> = async (values) => {
    try {
      setLoading(true);

      let imageUrl = imagePreview || "";

      if (values.imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", values.imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
      }

      const payload = {
        title: values.title,
        description: values.description ?? "",
        isActive: values.isActive,
        order: values.order ?? 1,
        imageUrl,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/slider/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم التعديل ✅",
          text: "تم تحديث السلايدر",
        });
        router.push("/admin/slider");
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ ❌",
          text: "فشل تعديل السلايدر",
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
      <h1 className="text-xl font-bold text-primary mb-4">✏️ تعديل السلايدر</h1>

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

          {/* عرض الصورة القديمة */}
          {imagePreview && (
            <div>
              <FormLabel>الصورة الحالية</FormLabel>
              <img
                src={imagePreview}
                alt="الصورة الحالية"
                className="w-64 rounded-lg"
              />
            </div>
          )}

          {/* رفع صورة جديدة */}
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تغيير الصورة</FormLabel>
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

          {/* زر الحفظ */}
          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary/80 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
