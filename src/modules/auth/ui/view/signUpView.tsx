"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import React, { useState } from "react";
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
import { OctagonAlertIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z
  .object({
    email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
    name: z.string({ message: "الاسم مطلوب" }),
    password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
    confirmPassword: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export default function SignUpView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    await authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: baseUrl,
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message ?? "خطأ غير متوقع");
        },
      }
    );
  };
  const onSocial = async (provider: "github" | "google") => {
    setError(null);
    setPending(true);
    await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: baseUrl,
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message ?? "خطأ غير متوقع");
        },
      }
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
    <div className="flex flex-col gap-6 " dir="rtl">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              action=""
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8 bg-primary/80"
            >
              <div className="flex flex-col gap-6 text-white">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">لنبدأ رحلتك</h1>
                  <p className="text-white text-balance">أنشئ حساباً جديداً</p>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">الاسم</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="أحمد"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="*********"
                            type="password"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تأكيد كلمة المرور</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="*********"
                            type="password"
                            {...field}
                            className="bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button disabled={pending} type="submit" className="w-full">
                  {pending ? <Spinner /> : <div>إنشاء حساب</div>}
                </Button>
                <span className="text-white text-center">أو تابع باستخدام</span>
                <div className="grid grid-cols-2 gap-4 text-black">
                  <Button
                    onClick={() => onSocial("google")}
                    variant={"outline"}
                    type="button"
                    className="w-full"
                  >
                    <FaGoogle />
                    Google
                  </Button>
                  <Button
                    onClick={() => onSocial("github")}
                    variant={"outline"}
                    type="button"
                    className="w-full"
                  >
                    <FaGithub />
                    Github
                  </Button>
                </div>
                <div className="text-center text-white">
                  {" "}
                  لديك حساب بالفعل؟{" "}
                  <Link href="/sign-in" className="underline">
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className=" relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={200}
                height={200}
                className="w-[200px] h-[250px]"
                unoptimized
                loading="eager"
              />
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 hoverEffect">
        بالمتابعة أنت توافق على <a href="#">شروط الخدمة</a> و{" "}
        <a href="#">سياسة الخصوصية</a>
      </div>
    </div>
  );
}
