"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "next-view-transitions";
import { motion } from "framer-motion";

const formSchema = z.object({
  currentPassword: z.string().min(1, "أدخل كلمة المرور الحالية"),
  newPassword: z
    .string()
    .min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
});

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pending, setPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setPending(true);

    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    setPending(false);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "فشل التغيير",
        text: error.message ?? "كلمة المرور الحالية غير صحيحة",
        confirmButtonText: "حاول مرة أخرى",
        confirmButtonColor: "#ef4444",
        customClass: { popup: 'rounded-[32px]' }
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "تم التغيير بنجاح",
      text: "تم تحديث كلمة المرور الخاصة بك بنجاح",
      confirmButtonText: "رائع",
      confirmButtonColor: "#3b82f6",
      customClass: { popup: 'rounded-[32px]' }
    }).then(() => {
      router.push(`/${id}/profile`);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 py-12 px-4 md:px-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-bold text-sm">
              <Link href={`/${id}/profile`} className="hover:text-primary transition-colors flex items-center gap-1">
                الملف الشخصي <ArrowRight className="size-3" />
              </Link>
              <span className="text-slate-900 dark:text-white">تغيير كلمة المرور</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white italic">أمان الحساب</h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-zinc-900 rounded-[48px] border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-10">
              
              {/* Icon & Title */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="size-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Lock className="size-10" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">تحديث كلمة المرور</h2>
                  <p className="text-slate-400 font-medium">احرص على استخدام كلمة مرور قوية وفريدة</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                      <KeyRound className="size-4 text-slate-400" /> كلمة المرور الحالية
                    </Label>
                    <Input
                      type="password"
                      {...form.register("currentPassword")}
                      placeholder="••••••••"
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all text-center tracking-widest"
                    />
                    {form.formState.errors.currentPassword && (
                      <p className="text-red-500 text-xs font-bold mt-1 pr-2 flex items-center gap-1">
                        <AlertCircle className="size-3" /> {form.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                      <ShieldCheck className="size-4 text-primary" /> كلمة المرور الجديدة
                    </Label>
                    <Input
                      type="password"
                      {...form.register("newPassword")}
                      placeholder="••••••••"
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all text-center tracking-widest"
                    />
                    {form.formState.errors.newPassword && (
                      <p className="text-red-500 text-xs font-bold mt-1 pr-2 flex items-center gap-1">
                        <AlertCircle className="size-3" /> {form.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 gap-3 text-lg transition-all hover:-translate-y-1" 
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="size-6 animate-spin" />
                        <span>جاري معالجة الطلب...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-6" />
                        <span>تأكيد التغيير الآن</span>
                      </>
                    )}
                  </Button>
                  
                  <Link 
                    href={`/${id}/profile`}
                    className="w-full h-14 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center"
                  >
                    العودة للملف الشخصي
                  </Link>
                </div>

              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
           <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
             <ShieldCheck className="size-5 text-blue-500 shrink-0 mt-0.5" />
             <p className="text-xs text-slate-500 font-medium">استخدم مزيجاً من الحروف الكبيرة والصغيرة والأرقام والرموز.</p>
           </div>
           <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
             <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
             <p className="text-xs text-slate-500 font-medium">لا تشارك كلمة المرور الخاصة بك مع أي شخص آخر حفاظاً على أمان حسابك.</p>
           </div>
        </div>

      </div>
    </div>
  );
}
