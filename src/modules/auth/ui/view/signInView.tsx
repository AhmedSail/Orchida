"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useState, Suspense } from "react";
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
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  OctagonAlertIcon,
  Copy,
  Check,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { Link } from "next-view-transitions";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

export default function SignInView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-zinc-950">
          <Spinner className="size-12" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL =
    searchParams.get("callbackURL") || searchParams.get("callbackUrl") || "/";

  const tempEmail = searchParams.get("email");
  const tempPass = searchParams.get("pass");

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const copyToClipboard = (text: string, type: "email" | "pass") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    await authClient.signIn.email(
      { email: data.email, password: data.password, callbackURL },
      {
        onSuccess: () => {
          setPending(false);
          router.push(callbackURL);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message ?? "خطأ غير متوقع");
          if (error?.status === 403) {
            setError("يرجى تأكيد البريد الإلكتروني الخاص بك");
          }
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
      email: tempEmail || "",
      password: tempPass || "",
    },
  });

  return (
    <div
      className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F8FAFC] dark:bg-zinc-950 w-full"
      dir="rtl"
    >
      {/* Left Side: Cinematic Branding (Hidden on mobile) */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-indigo-600/30 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />

        {/* Animated Background Orbs */}
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
              width={180}
              height={180}
              className="w-[180px] h-auto "
              unoptimized
            />
          </Link>

          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl font-black text-white italic drop-shadow-lg">
              اوركيدة للخدمات الرقمية والتدريب
            </h1>
            <p className="text-xl text-white/70 font-medium leading-relaxed">
              بوابتك لمستقبل تعليمي مشرق.
              <br />
              دورات احترافية، برمجة، تصميم،خدمات رقمية،مدربون متميزون، ومجتمع
              متكامل.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center gap-2">
              <Sparkles className="size-6 text-yellow-400" />
              <p className="text-white font-bold text-sm">محتوى مميز</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center gap-2">
              <ShieldCheck className="size-6 text-green-400" />
              <p className="text-white font-bold text-sm">أمان تام</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Sign-In Form */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative overflow-hidden">
        {/* Mobile Background Ornaments */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] size-[50%] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] size-[50%] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md z-10"
        >
          <div className="lg:hidden flex justify-center mb-12">
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
              تسجيل الدخول
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 font-medium">
              مرحباً بك! يرجى إدخال بياناتك للمتابعة.
            </p>
          </div>

          {/* Guest Credentials Notice */}
          <AnimatePresence mode="wait">
            {tempEmail && tempPass && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="mb-8"
              >
                <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 border-2 border-primary/20 space-y-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 size-24 bg-primary/10 rounded-full -ml-12 -mt-12 blur-2xl group-hover:scale-125 transition-transform" />

                  <div className="flex items-center gap-3 text-primary relative z-10">
                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="size-6" />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-widest">
                      بيانات حسابك الجديد
                    </h3>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase">
                          البريد الإلكتروني
                        </span>
                        <span className="text-sm font-bold text-slate-700 dark:text-zinc-200 truncate max-w-[200px]">
                          {tempEmail}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => copyToClipboard(tempEmail, "email")}
                      >
                        {copiedEmail ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4 text-slate-400" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase">
                          كلمة المرور
                        </span>
                        <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                          ********
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Info className="size-3 text-amber-500" />
                          <span className="text-[10px] text-amber-600 font-bold">
                            كلمة المرور هي رقم جوالك
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-10 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                        onClick={() => copyToClipboard(tempPass, "pass")}
                      >
                        {copiedPass ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <FormLabel className="font-black text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                          <Lock className="size-4 text-slate-400" /> كلمة المرور
                        </FormLabel>
                        <Link
                          href="/request-password-reset"
                          className="text-xs font-black text-primary hover:underline"
                        >
                          نسيت كلمة المرور؟
                        </Link>
                      </div>
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

              {!!error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Alert className="bg-red-500/10 border-none text-red-600 rounded-2xl py-4 shadow-sm">
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
                className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-slate-900/10 dark:shadow-primary/20 gap-3 transition-all hover:-translate-y-1 hover:bg-slate-800"
              >
                {pending ? (
                  <Spinner />
                ) : (
                  <>
                    <span>تسجيل الدخول الآن</span>{" "}
                    <ArrowRight className="size-5" />
                  </>
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F8FAFC] dark:bg-zinc-950 px-4 text-slate-400 font-black tracking-widest">
                    أو المتابعة عبر
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

              <p className="text-center text-slate-500 dark:text-zinc-400 font-medium">
                لا تمتلك حساباً؟{" "}
                <Link
                  href={`/sign-up?callbackURL=${encodeURIComponent(callbackURL)}`}
                  className="text-primary font-black hover:underline"
                >
                  سجّل الآن مجاناً
                </Link>
              </p>
            </form>
          </Form>

          <footer className="mt-12 text-center text-xs text-slate-400 font-medium">
            بالنقر على متابعة، فإنك توافق على{" "}
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
