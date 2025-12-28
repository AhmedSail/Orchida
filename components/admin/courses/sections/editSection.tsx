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
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Section } from "@/app/admin/[adminId]/courses/sections/[id]/edit/page";
import { Instructor } from "@/app/admin/[adminId]/instructor/page";
import { Courses } from "@/app/admin/[adminId]/courses/page";

const formSchema = z.object({
  courseId: z.string().min(1, "مطلوب"),
  sectionNumber: z.number().min(1, "مطلوب"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxCapacity: z.number().min(1),
  location: z.string().optional(),
  courseType: z.enum(["in_center", "online", "hybrid", "external"]),
  notes: z.string().optional(),
  instructorId: z.string().min(1, "مطلوب"),
  status: z.enum([
    "pending_approval",
    "approved",
    "open",
    "in_progress",
    "completed",
    "closed",
    "cancelled",
  ]),
});

export default function EditSectionForm({
  section,
  instructors,
  course,
  role,
  userId,
}: {
  section: Section;
  instructors: Instructor[];
  course: Courses;
  role: string;
  userId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: section.courseId,
      sectionNumber: section.sectionNumber,
      startDate: section.startDate
        ? new Date(section.startDate).toISOString().split("T")[0]
        : "",
      endDate: section.endDate
        ? new Date(section.endDate).toISOString().split("T")[0]
        : "",
      maxCapacity: section.maxCapacity,
      location: section.location || "",
      courseType: section.courseType || "in_center",
      notes: section.notes || "",
      instructorId: section.instructorId || "",
      status: section.status,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/courses/courseSections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم تعديل الشعبة بنجاح ✅",
          showConfirmButton: false,
          timer: 2000,
        });
        if (role === "admin") {
          router.push(`/admin/${userId}/courses/sections`);
        } else {
          router.push(`/coordinator/${userId}/courses/sections`);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل في تعديل الشعبة ❌",
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

  // خيارات الحالات حسب الدور
  const statusOptions =
    role === "admin"
      ? [
          { value: "pending_approval", label: "بانتظار الموافقة" },
          { value: "approved", label: "معتمدة" },
          { value: "open", label: "نشطة" },
          { value: "in_progress", label: "قيد التنفيذ" },
          { value: "completed", label: "مكتملة" },
          { value: "closed", label: "مغلقة" },
          { value: "cancelled", label: "ملغاة" },
        ]
      : section.status === "pending_approval"
      ? []
      : [
          { value: "approved", label: "معتمدة" },
          { value: "open", label: "نشطة" },
          { value: "in_progress", label: "قيد التنفيذ" },
          { value: "completed", label: "مكتملة" },
          { value: "closed", label: "مغلقة" },
          { value: "cancelled", label: "ملغاة" },
        ];

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-primary">تعديل الشعبة</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* اسم الدورة */}
          <FormItem>
            <FormLabel>اسم الدورة</FormLabel>
            <FormControl>
              <Input value={course.title ?? ""} disabled />
            </FormControl>
          </FormItem>

          {/* رقم الشعبة */}
          <FormField
            control={form.control}
            name="sectionNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الشعبة</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* المدرب */}
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
                      {instructors.map((inst) => (
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
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ البداية</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "تعديل الشعبة"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
