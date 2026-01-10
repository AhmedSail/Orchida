"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

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

// 1. تعريف المخطط والنوع المستنتج منه
const schema = z.object({
  studentName: z.string().min(2, "الاسم مطلوب وبحد أدنى حرفين"),
  studentEmail: z.string().email("يرجى إدخال بريد إلكتروني صالح"),
  studentPhone: z
    .string()
    .min(7, "رقم الهاتف مطلوب وبحد أدنى 7 أرقام")
    .max(20, "رقم الهاتف طويل جداً"),
  studentAge: z.number({ message: "يرجى إدخال عمر صالح" }).int().positive(),
  studentMajor: z.string().min(2, "يرجى إدخال التخصص الجامعي"),
  studentCountry: z.string().min(2, "يرجى إدخال الدولة"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

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
      notes: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);

      const payload = {
        courseId: coursesSelected.id,
        sectionId: lastSectionRaw.sectionId,
        ...values,
      };

      const res = await fetch("/api/course-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 403 && errorData.code === "REQUIRE_LOGIN") {
          const result = await MySwal.fire({
            title: "تنبيه ⚠️",
            text: errorData.message,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "تسجيل الدخول",
            cancelButtonText: "إلغاء",
            confirmButtonColor: "#6D28D9",
            background: "#fff",
            color: "#18181b",
            customClass: {
              popup: "rounded-3xl shadow-2xl border border-zinc-100",
            },
          });

          if (result.isConfirmed) {
            router.push(`/sign-in?callbackURL=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        if (res.status === 409 && errorData.code === "ALREADY_REGISTERED") {
          await MySwal.fire({
            title: "مسجل مسبقاً",
            text: errorData.message,
            icon: "warning",
            confirmButtonText: "حسناً",
            confirmButtonColor: "#6D28D9",
            background: "#fff",
            color: "#18181b",
            customClass: {
              popup: "rounded-3xl shadow-2xl border border-zinc-100",
            },
          });
          return;
        }

        throw new Error(errorData.message || "فشل إرسال الطلب");
      }

      const responseData = await res.json();

      await MySwal.fire({
        title: "تم استلام طلبك بنجاح! 🎉",
        html: `
          <div class="text-right space-y-4" dir="rtl">
            <p class="text-lg">شكراً لتسجيل اهتمامك بدورة <span class="font-bold text-primary">${coursesSelected.title}</span>.</p>
            <div class="bg-zinc-100 p-4 rounded-2xl border border-zinc-200">
              <p class="text-sm italic text-zinc-700">${responseData.message}</p>
            </div>
            <p class="text-zinc-500 italic">سيتواصل معك فريقنا المختص عبر الواتساب قريباً لتأكيد حجزك.</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "رائع، بانتظاركم",
        confirmButtonColor: "#10b981",
        background: "#fff",
        color: "#18181b",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-zinc-100",
        },
      });

      router.push("/courses");
      form.reset();
    } catch (err: any) {
      await MySwal.fire({
        title: "حدث خطأ",
        text: err?.message ?? "تعذر إرسال الطلب، حاول مرة أخرى.",
        icon: "error",
        confirmButtonText: "حسناً",
        confirmButtonColor: "#ef4444",
        background: "#fff",
        color: "#1c1917",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-red-100",
          confirmButton: "rounded-2xl px-8 font-bold",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onError = (errors: FieldValues) => {
    const errorMessages = Object.values(errors)
      .map((error: any) => error.message)
      .filter((msg) => msg);

    if (errorMessages.length > 0) {
      MySwal.fire({
        title: "بيانات غير مكتملة ⚠️",
        text: errorMessages[0] || "يرجى تعبئة الحقول المطلوبة بشكل صحيح",
        icon: "warning",
        confirmButtonText: "فهمت",
        confirmButtonColor: "#f59e0b",
        background: "#fff",
        color: "#1c1917",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-amber-100",
          confirmButton: "rounded-2xl px-8 font-bold",
        },
      });
    }
  };

  const inputStyles =
    "h-12 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-2xl pl-10";
  const iconStyles =
    "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors";

  return (
    <div
      className="min-h-screen py-12 px-4 relative overflow-hidden bg-zinc-50 dark:bg-black"
      dir="rtl"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Info Card */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-br from-primary to-purple-600 p-8 rounded-4xl text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />

              <div className="relative z-10 space-y-4">
                <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md">
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </div>
                <h1 className="text-3xl font-black leading-tight">
                  انضم إلى دورة
                  <br />
                  <span className="text-yellow-300">
                    {coursesSelected.title}
                  </span>
                </h1>
                <p className="text-white/80 leading-relaxed font-medium">
                  نحن متحمسون جداً لانضمامك! تعبئة هذا النموذج هي الخطوة الأولى
                  لتطوير مهاراتك والوصول لأهدافك.
                </p>

                <div className="pt-6 space-y-4">
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">رقم الشعبة</p>
                      <p className="font-bold">
                        الشعبة رقم {lastSectionRaw.sectionNumber}
                      </p>
                    </div>
                  </div>

                  {lastSectionRaw.instructorName && (
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">المدرب</p>
                        <p className="font-bold">
                          {lastSectionRaw.instructorName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-4xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                ماذا سيحدث بعد التسجيل؟
              </h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                {user ? (
                  <>
                    <li className="flex items-start gap-2 italic">
                      <span>•</span> سيتم تسجيل اهتمامك بالدورة باستخدام حسابك
                      الحالي.
                    </li>
                    <li className="flex items-start gap-2 italic">
                      <span>•</span> سنتواصل معك لتأكيد التسجيل النهائي والدفع.
                    </li>
                    <li className="flex items-start gap-2 italic">
                      <span>•</span> يمكنك متابعة حالة طلبك من لوحة التحكم
                      الخاصة بك.
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2 italic">
                      <span>•</span> سيتم إنشاء حساب "زائر" لك تلقائياً بمجرد
                      إرسال النموذج.
                    </li>
                    <li className="flex items-start gap-2 italic">
                      <span>•</span> ستتمكن من تسجيل الدخول رقم هاتفك هو كلمة
                      المرور.
                    </li>
                    <li className="flex items-start gap-2 italic">
                      <span>•</span> سيتواصل معك فريقنا لتأكيد التسجيل والدفع.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Right Column: The Form */}
          <div className="lg:col-span-7">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 lg:p-10 rounded-4xl shadow-xl border border-white/20 dark:border-zinc-800">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, onError)}
                  className="space-y-8"
                >
                  {/* Section 1: Personal Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">
                        البيانات الأساسية
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-zinc-600 dark:text-zinc-400 font-bold mr-1">
                              الاسم الكامل
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="الاسم الثلاثي"
                                  className={inputStyles}
                                  {...field}
                                  disabled={!!user}
                                />
                                <UserIcon className={iconStyles} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studentEmail"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-zinc-600 dark:text-zinc-400 font-bold mr-1">
                              البريد الإلكتروني
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="example@mail.com"
                                  type="email"
                                  className={inputStyles}
                                  {...field}
                                  disabled={!!user}
                                />
                                <Mail className={iconStyles} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 2: Contact & Age */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">
                        التواصل والمعلومات الشخصية
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="studentPhone"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-zinc-600 dark:text-zinc-400 font-bold mr-1">
                              رقم الواتساب
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="05XXXXXXXX"
                                  className={inputStyles}
                                  {...field}
                                />
                                <Phone className={iconStyles} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="studentAge"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-zinc-600 dark:text-zinc-400 font-bold mr-1">
                              العمر
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="مثلاً 22"
                                  className={inputStyles}
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                />
                                <Calendar className={iconStyles} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 3: Professional Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">
                        البيانات الأكاديمية
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="studentMajor"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-zinc-600 dark:text-zinc-400 font-bold mr-1">
                              التخصص الدراسي
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="هندسة، طب، برمجة..."
                                  className={inputStyles}
                                  {...field}
                                />
                                <GraduationCap className={iconStyles} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studentCountry"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="text-zinc-600 dark:text-zinc-400 font-bold mr-1">
                              الدولة والمدينة
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="فلسطين - غزة"
                                  className={inputStyles}
                                  {...field}
                                />
                                <MapPin className={iconStyles} />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 4: Notes */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-zinc-600 dark:text-zinc-400 font-bold mr-1 flex items-center gap-2">
                            ملاحظات إضافية
                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-4xl font-medium">
                              اختياري
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                placeholder="هل لديك أي استفسار تود طرحه علينا؟"
                                className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-4xl min-h-[120px] p-6 pr-10"
                                {...field}
                              />
                              <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-zinc-400" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-4"
                  >
                    <Button
                      type="submit"
                      className="w-full h-16 text-xl font-black bg-linear-to-r from-primary to-purple-600 hover:shadow-2xl hover:shadow-primary/30 text-white rounded-4xl transition-all relative overflow-hidden group"
                      disabled={submitting}
                    >
                      <AnimatePresence mode="wait">
                        {submitting ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                          >
                            <Loader2 className="w-6 h-6 animate-spin text-yellow-300" />
                            <span>جارٍ معالجة طلبك...</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                          >
                            <span>سجّل اهتمامك الآن</span>
                            <Sparkles className="w-6 h-6 text-yellow-300 group-hover:rotate-12 transition-transform" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterUser;
