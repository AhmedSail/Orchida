"use client";
import React, { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ✅ Schema مضبوط
const workSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب").max(255),
  description: z.string().optional(),
  category: z.string().min(1, "الفئة مطلوبة"),
  priceRange: z.string().optional(),
  duration: z.string().optional(),
  isActive: z.boolean(), // خليها boolean مباشرة
});

type WorkFormData = z.infer<typeof workSchema>;

function EditWorkPage({
  work,
  userId,
  role,
}: {
  work: any;
  userId: string;
  role: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WorkFormData>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      title: work.title,
      description: work.description || "",
      category: work.category,
      priceRange: work.priceRange || "",
      duration: work.duration || "",
      isActive: work.isActive ?? true, // ✅ ضمان قيمة افتراضية
    },
  });

  const onSubmit: SubmitHandler<WorkFormData> = async (data) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/works/${work.id}/media`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        Swal.fire("تم بنجاح!", "تم تحديث بيانات العمل.", "success");
        router.push(`/${role}/${userId}/works`);
        router.refresh();
      } else {
        Swal.fire("خطأ", "حدث خطأ أثناء تحديث العمل", "error");
      }
    } catch (error) {
      Swal.fire("خطأ", "فشل الاتصال بالسيرفر", "error");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-3xl text-primary ">تعديل العمل</h1>
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-right mb-2">
          عنوان العمل
        </Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-right mb-2">
          الوصف
        </Label>
        <Textarea id="description" {...register("description")} />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category" className="text-right mb-2">
          الفئة
        </Label>
        <Input id="category" {...register("category")} />
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Price Range */}
      <div>
        <Label htmlFor="priceRange" className="text-right mb-2">
          النطاق السعري (اختياري)
        </Label>
        <Input id="priceRange" {...register("priceRange")} />
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="duration" className="text-right mb-2">
          المدة (اختياري)
        </Label>
        <Input id="duration" {...register("duration")} />
      </div>

      <div className="flex items-center gap-4">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <Label htmlFor="isActive" className="text-right">
                حالة العمل (نشط)
              </Label>
            </div>
          )}
        />
      </div>

      {/* Submit Button */}

      {/* Submit Button مع سبينر */}
      <Button
        type="submit"
        className="w-full flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            جاري الحفظ...
          </>
        ) : (
          "حفظ التعديلات"
        )}
      </Button>
    </form>
  );
}

export default EditWorkPage;
