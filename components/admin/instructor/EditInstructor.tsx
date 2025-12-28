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
import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Instructor } from "@/app/admin/[adminId]/instructor/page";

// ✅ مخطط التحقق
const formSchema = z.object({
  name: z.string().min(2, "اسم المدرب مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().optional(),
  specialty: z.string().min(2, "التخصص مطلوب"),
  bio: z.string().optional(),
  experienceYears: z.string().min(1, "عدد سنوات الخبرة مطلوب"), // نص
});

export default function EditInstructorForm({
  instructor,
  userId,
}: {
  instructor: Instructor;
  userId: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone,
      specialty: instructor.specialty,
      bio: instructor.bio,
      experienceYears: instructor.experienceYears,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/instructors/${instructor.id}`, {
        method: "PUT", // ✅ تعديل
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم تعديل بيانات المدرب بنجاح ✅",
          showConfirmButton: false,
          timer: 2000,
        });
        router.push(`/admin/${userId}/instructor`); // رجوع لصفحة المدربين
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل في تعديل بيانات المدرب ❌",
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
        تعديل بيانات المدرب
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* الاسم */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المدرب</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم المدرب" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* البريد الإلكتروني */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* الهاتف */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="05XXXXXXXX" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* التخصص */}
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التخصص</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: برمجة، إدارة..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* نبذة */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نبذة</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="اكتب نبذة قصيرة عن المدرب..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* سنوات الخبرة */}
          <FormField
            control={form.control}
            name="experienceYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد سنوات الخبرة</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="مثال: خمس سنوات أو 5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "تعديل المدرب"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
