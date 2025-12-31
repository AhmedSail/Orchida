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
import { useRouter } from "next/navigation";

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
  studentPhone?: string | "";
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
    .min(7, "رقم الهاتف غير صالح")
    .max(20, "رقم الهاتف طويل جداً")
    .optional()
    .or(z.literal("")),
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
  // --- بداية التعديل ---
  // استخدام <FormValues> هنا يحل جميع مشاكل عدم تطابق الأنواع
  const form = useForm<FormValues>({
    // --- نهاية التعديل ---
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

  // لا حاجة لتحديد النوع هنا مرة أخرى، سيتم استنتاجه بشكل صحيح
  const onSubmit = async (values: FormValues) => {
    const exists = allUsers.some((u) => u.email === values.studentEmail);
    if (!exists) {
      try {
        // ✅ إنشاء حساب جديد
        const newUserPayload = {
          name: values.studentName,
          email: values.studentEmail,
          password: values.studentPhone, // رقم الجوال ككلمة مرور
          phone: values.studentPhone,
        };

        const userRes = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUserPayload),
        });

        if (!userRes.ok) throw new Error("فشل إنشاء الحساب");
        const newUser = await userRes.json();

        // ✅ بناء بيانات التسجيل وربطها بالمستخدم الجديد
        const enrollment = {
          sectionId: lastSectionRaw.sectionId,
          studentId: newUser.id, // ربط التسجيل بالمستخدم الجديد
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

        if (!res.ok) throw new Error("فشل إنشاء التسجيل");

        const result = await MySwal.fire({
          title: "تم إنشاء الحساب والتسجيل",
          text: "تم تسجيلك في الدورة بنجاح ولقد حصلت على عضوية في الموقع الخاص بنا على الايميل الخاص بك يرجى اعادة تعيين كلمة المرور للاستفادة من خدماتنا والدخول الى لوحة التحكم الخاصة بك",
          icon: "success",
          confirmButtonText: "حسناً",
        });

        // ✅ إذا ضغط OK → تحويل لصفحة إعادة تعيين كلمة المرور
        if (result.isConfirmed) {
          window.location.href = "/request-password-reset"; // غيّر المسار حسب صفحة إعادة التعيين عندك
        }

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
    }
    try {
      setSubmitting(true);

      // ✅ بناء بيانات التسجيل وربطها بالمستخدم الجديد
      const enrollment = {
        sectionId: lastSectionRaw.sectionId,
        studentId: user?.id, // ربط التسجيل بالمستخدم الجديد
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

      if (!res.ok) throw new Error("فشل إنشاء التسجيل");

      const result = await MySwal.fire({
        title: "تم ",
        text: "تم تسجيلك في الدورة بنجاح",
        icon: "success",
        confirmButtonText: "حسناً",
      });
      router.push(`/${user?.id}/myCourses`);
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
  const [emailHasAccount, setEmailHasAccount] = useState(false);
  const checkEmail = async (email: string) => {
    try {
      const exists = allUsers.some((u) => u.email === email);
      if (exists) {
        if (!user) {
          // له حساب لكنه غير مسجل دخول → تعطيل + تنبيه
          setEmailHasAccount(true);
          const result = await MySwal.fire({
            title: "البريد مسجل مسبقاً",
            text: "هذا البريد مرتبط بحساب. يجب تسجيل الدخول لإكمال التسجيل.",
            icon: "warning",
            confirmButtonText: "حسناً",
          });

          if (result.isConfirmed) {
            window.location.href = "/sign-in";
          }
        } else {
          // له حساب وهو مسجل دخول → لا تعطيل
          setEmailHasAccount(false);
        }
      } else {
        // ما له حساب → لا تعطيل
        setEmailHasAccount(false);
      }
    } catch (err) {
      console.error("Error checking email:", err);
    }
  };
  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h2 className="text-2xl font-bold mb-4 text-primary">
        التسجيل في الشعبة رقم {lastSectionRaw.sectionNumber} من دورة{" "}
        {coursesSelected.title}
      </h2>

      {!user && (
        <div className="mb-4 text-sm text-muted-foreground">
          لم تسجّل الدخول. يمكنك المتابعة كزائر، لكن يُفضّل تسجيل الدخول لضمان
          حفظ بياناتك.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    disabled={!!user || emailHasAccount}
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
                    disabled={!!user || emailHasAccount}
                    onBlur={(e) => checkEmail(e.target.value)}
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
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input
                    placeholder="05XXXXXXXX"
                    {...field}
                    disabled={emailHasAccount}
                  />
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
                  <Input
                    placeholder="مثال: هندسة الحاسوب"
                    {...field}
                    disabled={emailHasAccount}
                  />
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
                <FormLabel>الدولة</FormLabel>
                <FormControl>
                  <Input
                    placeholder="مثال: فلسطين"
                    {...field}
                    disabled={emailHasAccount}
                  />
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
                    disabled={emailHasAccount}
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
              disabled={emailHasAccount || submitting}
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
