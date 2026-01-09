"use client";

import React, { useState } from "react";
import { z } from "zod";
// --- بداية التعديل ---
// استيراد FieldValues من react-hook-form
import { useForm, FieldValues } from "react-hook-form";
// --- نهاية التعديل ---
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { Button } from "@/components/ui/button";
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
import { Courses } from "@/app/admin/[adminId]/courses/page";
import { User } from "../user/edit-profile";
import { useRouter, usePathname } from "next/navigation";

// types
type Section = {
  sectionId: string;
  sectionNumber: number;
  instructorId: string | null;
  instructorName: string | null;
};
type SessionUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  role: string;
};

const MySwal = withReactContent(Swal);

// 1. تعريف النوع بشكل صريح
type FormValues = {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentAge: number;
  studentMajor: string;
  studentCountry: string;
  paymentReceiptUrl?: string | "";
  notes?: string | "";
};

// 2. جعل المخطط يلتزم بالنوع المحدد
const schema = z.object({
  studentName: z.string().min(2, "الاسم مطلوب وبحد أدنى حرفين"),
  studentEmail: z.string().email("يرجى إدخال بريد إلكتروني صالح"),
  studentPhone: z
    .string()
    .min(7, "رقم الهاتف مطلوب وبحد أدنى 7 أرقام")
    .max(20, "رقم الهاتف طويل جداً"),
  studentAge: z.number().int().positive(),
  studentMajor: z.string().min(2, "يرجى إدخال التخصص الجامعي"),
  studentCountry: z.string().min(2, "يرجى إدخال الدولة"),
  paymentReceiptUrl: z
    .string()
    .url("يرجى إدخال رابط صالح للصورة")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

const RegisterUser = ({
  lastSectionRaw,
  user,
  coursesSelected,
  allUsers,
}: {
  lastSectionRaw: Section;
  user?: SessionUser;
  coursesSelected: Courses;
  allUsers: User[];
}) => {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentName: user?.name ?? "",
      studentEmail: user?.email ?? "",
      studentPhone: "",
      studentAge: 18,
      studentMajor: "",
      studentCountry: "",
      paymentReceiptUrl: "",
      notes: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      const result = await MySwal.fire({
        title: "تنبيه ⚠️",
        text: "يجب تسجيل الدخول قبل التسجيل في الدورة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#f59e0b",
      });

      if (result.isConfirmed) {
        router.push(`/sign-in?callbackURL=${encodeURIComponent(pathname)}`);
      }
      return;
    }

    try {
      setSubmitting(true);

      const enrollment = {
        sectionId: lastSectionRaw.sectionId,
        studentId: user.id,
        studentName: values.studentName,
        studentEmail: values.studentEmail,
        studentPhone: values.studentPhone || null,
        studentAge: values.studentAge,
        studentMajor: values.studentMajor,
        studentCountry: values.studentCountry,
        paymentReceiptUrl: values.paymentReceiptUrl || null,
        confirmationStatus: "pending",
        paymentStatus: values.paymentReceiptUrl ? "paid" : "pending",
      };

      const res = await fetch("/api/course-enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollment),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 409) {
          await MySwal.fire({
            title: "تنبيه ⚠️",
            text: errorData.message || "أنت مسجل بالفعل في هذه الشعبة",
            icon: "warning",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#f59e0b",
          });
          return; // Stop execution here
        }
        throw new Error(errorData.message || "فشل إنشاء التسجيل");
      }

      await MySwal.fire({
        title: "تم ",
        text: "تم تسجيلك في الدورة بنجاح",
        icon: "success",
        confirmButtonText: "حسناً",
      });
      router.push(`/${user.id}/myCourses`);
      form.reset();
    } catch (err: any) {
      await MySwal.fire({
        title: "حدث خطأ",
        text: err?.message ?? "تعذر إرسال النموذج، حاول مرة أخرى.",
        icon: "error",
        confirmButtonText: "حسناً",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onError = (errors: FieldValues) => {
    // Collect error messages
    const errorMessages = Object.values(errors)
      .map((error: any) => error.message)
      .filter((msg) => msg);

    if (errorMessages.length > 0) {
      // Show the first error or join them
      MySwal.fire({
        title: "تنبيه ⚠️",
        text: errorMessages[0] || "يرجى تعبئة الحقول المطلوبة بشكل صحيح",
        icon: "warning",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#f59e0b",
      });
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        التسجيل في الشعبة رقم {lastSectionRaw.sectionNumber} من دورة{" "}
        {coursesSelected.title}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الاسم الكامل</FormLabel>
                <FormControl>
                  <Input
                    placeholder="اكتب اسمك الكامل"
                    {...field}
                    disabled={!!user}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    {...field}
                    disabled={!!user}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف للتواصل </FormLabel>
                <FormControl>
                  <Input placeholder="05XXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العمر</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="أدخل عمرك"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentMajor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التخصص الجامعي</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: هندسة الحاسوب" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مكان السكن (الدولة والمدينة)</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: فلسطين" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات (اختياري)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="أضف أي معلومات إضافية هنا"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 ">
            <Button
              type="submit"
              className="w-1/2 block mx-auto"
              disabled={submitting}
            >
              {submitting ? "جارٍ الإرسال..." : "سجّل الآن"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterUser;
