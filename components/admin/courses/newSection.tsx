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
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import Swal from "sweetalert2";

import { useRouter } from "next/navigation";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import { Instructor } from "@/app/instructor/[instructorId]/complete-profile/page";

const formSchema = z
  .object({
    courseId: z.string().min(1, "مطلوب"),
    sectionNumber: z.number().min(0, "مطلوب"), // ✅ السماح بالرقم 0 للأونلاين
    startDate: z.string().min(1, "مطلوب"),
    endDate: z.string().min(1, "مطلوب"),
    maxCapacity: z.number().min(1),
    location: z.string().optional(),
    courseType: z.enum(["in_center", "online", "hybrid", "external"]),
    notes: z.string().optional(),
    instructorId: z.string().min(1, "مطلوب"),
    isHidden: z.boolean(),
    isFree: z.boolean(),
  })
  .refine(
    (data) => {
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
  nextWajahi,
  nextHybrid,
  instructor,
  role,
  userId,
}: {
  course: Courses;
  nextWajahi: number;
  nextHybrid: number;
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
      sectionNumber: nextWajahi, // القيمة الافتراضية للوجاهي
      startDate: "",
      endDate: "",
      maxCapacity: 40,
      location: "",
      courseType: "in_center",
      notes: "",
      instructorId: "",
      isHidden: false,
      isFree: false,
    },
  });

  // ✅ مراقبة تغيير نوع الدورة لتحديث رقم الشعبة تلقائياً
  const watchedCourseType = form.watch("courseType");

  useEffect(() => {
    if (watchedCourseType === "online") {
      form.setValue("sectionNumber", 0);
      form.setValue("location", "أونلاين (تسجيلات)");
    } else if (watchedCourseType === "in_center") {
      form.setValue("sectionNumber", nextWajahi);
      form.setValue("location", "قاعة المركز");
    } else if (watchedCourseType === "hybrid") {
      form.setValue("sectionNumber", nextHybrid);
      form.setValue("location", "مدمج (قاعة + زوم)");
    }
  }, [watchedCourseType, nextWajahi, nextHybrid, form]);

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
      <h2 className="text-2xl font-bold mb-4 text-primary">
        إضافة شعبة جديدة للكورس: {course.title}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* نوع الدورة أولاً لأنه يؤثر على الرقم */}
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
                        <SelectItem value="in_center">حضوري (وجاهي)</SelectItem>
                        <SelectItem value="online">أونلاين (كامل)</SelectItem>
                        <SelectItem value="hybrid">مدمج (متابعة)</SelectItem>
                        <SelectItem value="external">خارجي</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المكان / التفاصيل</FormLabel>
                  <FormControl>
                    <Input placeholder="قاعة التدريب / أونلاين" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem dir="rtl">
                  <FormLabel dir="rtl">تاريخ البداية</FormLabel>
                  <FormControl dir="rtl">
                    <Input type="date" {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ النهاية</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "إضافة الشعبة"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
