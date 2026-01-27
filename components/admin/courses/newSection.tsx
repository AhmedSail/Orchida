"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
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
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import Swal from "sweetalert2";

import { useRouter } from "next/navigation";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import { Instructor } from "@/app/instructor/[instructorId]/complete-profile/page";
import { CourseWithSections } from "@/app/coordinator/[coordinatorId]/courses/page";

const formSchema = z
  .object({
    courseId: z.string().min(1, "مطلوب"),
    sectionNumber: z.number().min(1, "مطلوب"),
    startDate: z.string().min(1, "مطلوب"), // لازم يكون موجود
    endDate: z.string().min(1, "مطلوب"),
    maxCapacity: z.number().min(1),
    location: z.string().optional(),
    courseType: z.enum(["in_center", "online", "hybrid", "external"]),
    notes: z.string().optional(),
    instructorId: z.string().min(1, "مطلوب"), // ✅ إضافة حقل المدرب
    isHidden: z.boolean(),
  })
  .refine(
    (data) => {
      // تحقق أن تاريخ البداية بعد اليوم
      const today = new Date();
      const start = new Date(data.startDate);
      return start > today;
    },
    {
      path: ["startDate"],
      message: "تاريخ البداية يجب أن يكون بعد تاريخ اليوم",
    },
  )
  .refine(
    (data) => {
      // تحقق أن تاريخ النهاية بعد البداية
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      path: ["endDate"],
      message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    },
  );

export default function NewSectionForm({
  course,
  nextSectionNumber,
  instructor,
  role,
  userId,
}: {
  course: Courses;
  nextSectionNumber: number;
  instructor: Instructor[];
  role: string;
  userId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: course.id,
      sectionNumber: nextSectionNumber,
      startDate: "",
      endDate: "",
      maxCapacity: 40,
      location: "",
      courseType: "in_center",
      notes: "",
      instructorId: "", // ✅ إضافة حقل المدرب
      isHidden: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/courses/courseSections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تمت إضافة الشعبة بنجاح ✅",
          showConfirmButton: false,
          timer: 2000,
        });
        if (role === "admin") {
          router.push(`/admin/${userId}/courses/sections`);
        } else {
          router.push(`/coordinator/${userId}/courses/sections`);
        }
        form.reset();
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل في إضافة الشعبة ❌",
          text: "حاول مرة أخرى",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تأكد من الشبكة أو السيرفر",
      });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-primary">إضافة شعبة جديدة</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* رقم الدورة */}
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الدورة</FormLabel>
                <FormControl>
                  <Input
                    placeholder="اسم الدورة"
                    {...field}
                    value={course.title}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* رقم الشعبة */}
          <FormField
            control={form.control}
            name="sectionNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الشعبة</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    value={nextSectionNumber}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المدرب</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    dir="rtl"
                  >
                    <SelectTrigger dir="rtl" className="w-full">
                      <SelectValue placeholder="اختر المدرب" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructor.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* تاريخ البداية */}
          {/* تاريخ البداية */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem dir="rtl">
                <FormLabel dir="rtl">تاريخ البداية</FormLabel>
                <FormControl dir="rtl">
                  <Input type="date" {...field} dir="rtl" />
                </FormControl>
                <FormMessage /> {/* 👈 لازم تحطها هنا */}
              </FormItem>
            )}
          />

          {/* تاريخ النهاية */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ النهاية</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage /> {/* 👈 وهنا كمان */}
              </FormItem>
            )}
          />

          {/* السعة */}
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأقصى للطلاب</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* المكان */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المكان</FormLabel>
                <FormControl>
                  <Input placeholder="قاعة التدريب / أونلاين" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* طريقة التقديم */}
          <FormField
            control={form.control}
            name="courseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>طريقة التقديم</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    dir="rtl"
                  >
                    <SelectTrigger dir="rtl" className="w-full">
                      <SelectValue placeholder="اختر الطريقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_center">حضوري</SelectItem>
                      <SelectItem value="online">أونلاين</SelectItem>
                      <SelectItem value="hybrid">مدمج</SelectItem>
                      <SelectItem value="external">خارجي</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* ملاحظات */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات</FormLabel>
                <FormControl>
                  <Textarea placeholder="أي ملاحظات إضافية..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isHidden"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>إخفاء الشعبة</FormLabel>
                  <div className="text-sm text-slate-500">
                    عند تفعيل هذا الخيار، ستختفي الشعبة من الصفحة الرئيسية وصفحة
                    الدورات.
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "إضافة الشعبة"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
