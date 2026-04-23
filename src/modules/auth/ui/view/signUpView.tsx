"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import React, { useState, Suspense } from "react";
import { z } from "zod";
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
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  OctagonAlertIcon,
  User,
  Mail,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Rocket,
} from "lucide-react";
import { Link } from "next-view-transitions";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

const formSchema = z
  .object({
    email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
    name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
    password: z
      .string()
      .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
    confirmPassword: z.string().min(1, { message: "يرجى تأكيد كلمة المرور" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export default function SignUpView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-zinc-950">
          <Spinner className="size-12" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const callbackURL =
    searchParams.get("callbackURL") || searchParams.get("callbackUrl") || "/";

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    await authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL,
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push(callbackURL);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message ?? "خطأ غير متوقع");
        },
      },
    );
  };

  const onSocial = async (provider: "github" | "google") => {
    setError(null);
    setPending(true);
    await authClient.signIn.social(
      { provider, callbackURL },
      {
        onSuccess: () => setPending(false),
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message ?? "خطأ غير متوقع");
        },
      },
    );
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div
      className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAFC] dark:bg-zinc-950"
      dir="rtl"
    >
      {/* Left Side: Cinematic Branding */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-indigo-600/30 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />

        <div className="absolute top-[-10%] left-[-10%] size-[60%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] size-[60%] bg-indigo-500/20 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center space-y-8"
        >
          <Link
            href="/"
            className="hover:scale-110 transition-transform duration-500"
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={160}
              height={160}
              className="w-[160px] h-auto"
              unoptimized
            />
          </Link>

          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl font-black text-white italic drop-shadow-lg">
              اوركيدة للخدمات الرقمية والتدريب
            </h1>
            <p className="text-xl text-white/70 font-medium leading-relaxed">
              بوابتك لمستقبل تعليمي مشرق. <br /> دورات احترافية، برمجة،
              تصميم،خدمات رقمية،مدربون متميزون، ومجتمع متكامل.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-4 text-right">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <Rocket className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">انطلاقة سريعة</p>
                <p className="text-white/50 text-xs">
                  سجل حسابك وابدأ التعلم في دقائق
                </p>
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-4 text-right">
              <div className="size-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center shrink-0">
                <Sparkles className="size-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">مزايا حصرية</p>
                <p className="text-white/50 text-xs">
                  خصومات وعروض خاصة للمشتركين الجدد
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Sign-Up Form */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] size-[50%] bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md z-10"
        >
          <div className="lg:hidden flex justify-center mb-10">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={80}
              height={80}
              unoptimized
            />
          </div>

          <div className="text-center md:text-right space-y-2 mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              إنشاء حساب جديد
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 font-medium">
              خطوة واحدة تفصلك عن عالم من المعرفة.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="font-black text-slate-700 dark:text-zinc-300 pr-2 flex items-center gap-2">
                        <User className="size-4 text-slate-400" /> الاسم الكامل
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أحمد علي"
                          {...field}
                          className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold shadow-sm transition-all"
                        />
                      </FormControl>
                      <FormMessage className="font-bold text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="font-black text-slate-700 dark:text-zinc-300 pr-2 flex items-center gap-2">
                        <Mail className="size-4 text-slate-400" /> البريد
                        الإلكتروني
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          {...field}
                          className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold shadow-sm transition-all"
                        />
                      </FormControl>
                      <FormMessage className="font-bold text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="font-black text-slate-700 dark:text-zinc-300 pr-2 flex items-center gap-2">
                          <Lock className="size-4 text-slate-400" /> كلمة المرور
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                            className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold shadow-sm transition-all"
                          />
                        </FormControl>
                        <FormMessage className="font-bold text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="font-black text-slate-700 dark:text-zinc-300 pr-2 flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-slate-400" />{" "}
                          تأكيدها
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                            className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold shadow-sm transition-all"
                          />
                        </FormControl>
                        <FormMessage className="font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {!!error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Alert className="bg-red-500/10 border-none text-red-600 rounded-2xl py-3 shadow-sm">
                    <OctagonAlertIcon className="size-5" />
                    <AlertTitle className="font-bold text-sm mr-2">
                      {error}
                    </AlertTitle>
                  </Alert>
                </motion.div>
              )}

              <Button
                disabled={pending}
                type="submit"
                className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 gap-3 transition-all hover:-translate-y-1 hover:bg-primary/90"
              >
                {pending ? (
                  <Spinner />
                ) : (
                  <>
                    <span>إنشاء الحساب الآن</span>{" "}
                    <ArrowRight className="size-5" />
                  </>
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F8FAFC] dark:bg-zinc-950 px-4 text-slate-400 font-black tracking-widest">
                    أو عبر التواصل الاجتماعي
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => onSocial("google")}
                  variant="outline"
                  type="button"
                  className="h-14 rounded-2xl border-slate-200 dark:border-zinc-800 font-bold gap-2 hover:bg-white dark:hover:bg-zinc-900 shadow-sm transition-all"
                >
                  <FaGoogle className="text-red-500" /> Google
                </Button>
                <Button
                  onClick={() => onSocial("github")}
                  variant="outline"
                  type="button"
                  className="h-14 rounded-2xl border-slate-200 dark:border-zinc-800 font-bold gap-2 hover:bg-white dark:hover:bg-zinc-900 shadow-sm transition-all"
                >
                  <FaGithub className="dark:text-white" /> Github
                </Button>
              </div>

              <p className="text-center text-slate-500 dark:text-zinc-400 font-medium pt-2">
                لديك حساب بالفعل؟{" "}
                <Link
                  href={`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`}
                  className="text-primary font-black hover:underline"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          </Form>

          <footer className="mt-10 text-center text-[10px] text-slate-400 font-medium">
            بالنقر على إنشاء حساب، فإنك توافق على{" "}
            <a
              href="#"
              className="underline hover:text-primary transition-colors"
            >
              شروط الخدمة
            </a>{" "}
            و{" "}
            <a
              href="#"
              className="underline hover:text-primary transition-colors"
            >
              سياسة الخصوصية
            </a>
            .
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
