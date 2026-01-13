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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import { deleteFromR2, uploadToR2 } from "@/lib/r2-client";

const formSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  duration: z.string().min(1, "المدة مطلوبة"),
  hours: z.number().min(0, "عدد الساعات يجب أن يكون 0 أو أكثر"),
  price: z.string().optional(),
  currency: z.enum(["ILS", "USD", "JOD"]),
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
  const [preview, setPreview] = useState<string | null>(null);
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
      currency: (initialData?.currency as any) ?? "ILS",
      targetAudience: initialData?.targetAudience ?? "",
      topics: initialData?.topics ?? "",
      objectives: initialData?.objectives ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const cleanUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("proxy-file?url=")) {
      return decodeURIComponent(url.split("proxy-file?url=")[1])
        .trim()
        .replace(/\s/g, "");
    }
    return url.trim().replace(/\s/g, "");
  };
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let imageUrl = initialData?.imageUrl ?? "";

    if (values.imageFile) {
      // ✅ حذف القديمة من أي بكت كانت فيه
      if (initialData?.imageUrl) {
        try {
          await deleteFromR2(cleanUrl(initialData.imageUrl));
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }

      // ✅ الرفع إلى publicFiles للحصول على رابط مباشر
      imageUrl = await uploadToR2(values.imageFile);
    }

    const payload = {
      ...values,
      imageUrl: cleanUrl(imageUrl), // ✅ تنظيف الرابط النهائي قبل الحفظ
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
                    value={field.value ?? 0}
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* السعر والعملة */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="مثال: 300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العملة</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العملة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ILS">₪ - شيكل</SelectItem>
                      <SelectItem value="USD">$ - دولار</SelectItem>
                      <SelectItem value="JOD"> JOD - دينار</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
