"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import { useEdgeStore } from "@/lib/edgestore";

const formSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  duration: z.string(),
  hours: z.number().min(1, "عدد الساعات مطلوب"),
  price: z.string().optional(),
  targetAudience: z.string().optional(),
  topics: z.string().optional(),
  objectives: z.string().optional(),
  isActive: z.boolean(),
});

interface EditCourseFormProps {
  initialData: Courses;
  userId: string;
}

export default function EditCourseForm({
  initialData,
  userId,
}: EditCourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null); // 👈 معاينة الصورة الجديدة
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      imageFile: undefined,
      duration: initialData?.duration ?? "",
      hours: initialData?.hours ?? 0,
      price: initialData?.price ?? "",
      targetAudience: initialData?.targetAudience ?? "",
      topics: initialData?.topics ?? "",
      objectives: initialData?.objectives ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });
  const { edgestore } = useEdgeStore();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let imageUrl = initialData?.imageUrl ?? "";

    if (values.imageFile) {
      // ✅ أولاً نحذف الصورة القديمة إذا موجودة
      if (initialData?.imageUrl) {
        await edgestore.protectedFiles.delete({
          url: initialData.imageUrl,
        });
      }

      // ✅ ثم نرفع الصورة الجديدة
      const resUpload = await edgestore.protectedFiles.upload({
        file: values.imageFile,
        onProgressChange: (progress) => {
          console.log("Upload progress:", progress);
        },
      });

      imageUrl = resUpload.url; // الرابط النهائي من EdgeStore
    }

    const payload = {
      ...values,
      imageUrl,
    };

    const res = await fetch(`/api/courses/${initialData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "تم تعديل الدورة بنجاح",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        router.push(`/admin/${userId}/courses`);
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "فشل في تعديل الدورة",
        text: "حاول مرة أخرى",
      });
    }

    setIsSubmitting(false);
  }

  return (
    <div>
      <h2 className="text-2xl text-primary font-bold mb-4">تعديل الدورة</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto p-6 space-y-4"
        >
          {/* عنوان الدورة */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان الدورة</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: دورة Next.js" {...field} />
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
                  <Textarea placeholder="اكتب وصف الدورة..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* صورة الدورة */}
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>صورة الدورة</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                        setPreview(URL.createObjectURL(file)); // 👈 معاينة الصورة الجديدة
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* عرض الصورة القديمة أو الجديدة */}
          <div className="mt-2">
            <FormLabel>معاينة الصورة</FormLabel>
            {preview ? (
              <Image
                src={preview}
                alt="معاينة الصورة الجديدة"
                width={200}
                height={200}
                className="rounded-md object-cover mt-2"
                unoptimized
              />
            ) : initialData?.imageUrl ? (
              <Image
                src={initialData.imageUrl}
                alt="الصورة القديمة"
                width={200}
                height={200}
                className="rounded-md object-cover mt-2"
                unoptimized
              />
            ) : (
              <p className="text-sm text-gray-500 mt-2">لا توجد صورة حالياً</p>
            )}
          </div>

          {/* باقي الحقول */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مدة الدورة</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: أسبوعين" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد الساعات</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="مثال: 40"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر $</FormLabel>
                <FormControl>
                  <Input placeholder="300$" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الفئة المستهدفة</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: طلاب الجامعات" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>محاور الدورة</FormLabel>
                <FormControl>
                  <Textarea placeholder="اكتب المحاور..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>أهداف الدورة</FormLabel>
                <FormControl>
                  <Textarea placeholder="اكتب الأهداف..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>نشط</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            حفظ التعديلات
          </Button>
        </form>
      </Form>
    </div>
  );
}
