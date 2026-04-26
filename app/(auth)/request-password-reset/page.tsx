"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { Link } from "next-view-transitions";

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setIsError(true);
      setMessage(error.message ?? "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
      return;
    }

    setIsError(false);
    setMessage("تم إرسال رابط إعادة التعيين بنجاح! يرجى التحقق من بريدك الإلكتروني.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden" dir="rtl">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 relative z-10 mx-4"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
          نسيت كلمة المرور؟
        </h1>
        <p className="text-center text-slate-500 mb-8 text-sm leading-relaxed">
          لا تقلق، أدخل بريدك الإلكتروني أدناه وسنرسل لك رابطاً لإنشاء كلمة مرور جديدة بأمان.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pr-10 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50"
              />
            </div>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl flex gap-3 text-sm font-medium ${
                isError 
                  ? "bg-red-50 text-red-600 border border-red-100" 
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {isError ? (
                <AlertCircle className="w-5 h-5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              )}
              <p>{message}</p>
            </motion.div>
          )}

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
          >
            {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors group"
          >
            <ArrowRight className="w-4 h-4 ml-2 group-hover:-translate-x-1 transition-transform" />
            العودة إلى صفحة تسجيل الدخول
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
