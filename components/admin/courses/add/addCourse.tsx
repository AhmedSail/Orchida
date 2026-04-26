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
import { uploadToR2 } from "@/lib/r2-client";

const formSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  slug: z.string().min(3, "الرابط (Slug) مطلوب").regex(/^[a-z0-9-]+$/, "يجب أن يحتوي الرابط على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
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

export default function AddCourseForm({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      imageFile: undefined,
      duration: "",
      hours: 0,
      price: "",
      currency: "ILS",
      targetAudience: "",
      topics: "",
      objectives: "",
      isActive: true,
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let imageUrl = "";

    if (values.imageFile) {
      imageUrl = await uploadToR2(values.imageFile, (progress) => {
        // لو بدك تعمل progress bar
      });
    }

    const payload = {
      ...values,
      imageUrl,
    };

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "تمت إضافة الدورة بنجاح",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        router.push(`/admin/${userId}/courses`); // 👈 تحويل لصفحة الدورات
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "فشل في إضافة الدورة",
        text: "حاول مرة أخرى",
      });
    }

    setIsSubmitting(false);
  }
  return (
    <div>
      <h2 className="text-2xl text-primary font-bold mb-4">دورة جديدة</h2>
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
          {/* الرابط (Slug) */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرابط (Slug) - بالإنجليزية</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: ecommerce-course" {...field} />
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
                      field.onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* مدة الدورة */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مدة الدورة (أيام/أسابيع)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="مثال: 14"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* عدد الساعات */}
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

          {/* الفئة المستهدفة */}
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

          {/* محاور الدورة */}
          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>محاور الدورة</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="اكتب المحاور (مثال: أساسيات، مشاريع عملية...)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* أهداف الدورة */}
          <FormField
            control={form.control}
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>أهداف الدورة</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="اكتب الأهداف (مثال: تعلم Next.js، بناء مشروع كامل...)"
                    {...field}
                  />
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
            {isSubmitting ? "جاري الإضافة..." : "إضافة الدورة"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
