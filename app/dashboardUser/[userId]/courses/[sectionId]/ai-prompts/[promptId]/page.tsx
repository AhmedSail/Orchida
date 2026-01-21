"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Image as ImageIcon,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function AiPromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await fetch(`/api/ai-prompts/${params.promptId}`);
        if (res.ok) {
          const data = await res.json();
          setPrompt(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.promptId) {
      fetchPrompt();
    }
  }, [params.promptId]);

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-black">البرومبت غير موجود</h2>
        <Button onClick={() => router.back()}>العودة للخلف</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8" dir="rtl">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors group"
        >
          <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          العودة للبرومبتات
        </button>

        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black px-4 py-1.5 rounded-full">
            <Sparkles className="size-4 mr-2 inline" />
            برومبت ذكي احترافي
          </Badge>
          {prompt.updatedAt && (
            <Badge
              variant="outline"
              className="text-slate-400 border-slate-200 font-bold px-4 py-1.5 rounded-full"
            >
              <Clock className="size-4 mr-2 inline" />
              تحديث: {new Date(prompt.updatedAt).toLocaleDateString("ar-EG")}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Image & Title */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white leading-tight">
              {prompt.title}
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              هذا البرومبت مصمم بدقة ليساعدك في الحصول على أفضل النتائج من أدوات
              الذكاء الاصطناعي. قم بنسخ النص واستخدامه مباشرة.
            </p>
          </div>

          {prompt.imageUrl ? (
            <div className="relative aspect-video rounded-[48px] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 ring-1 ring-slate-100 dark:ring-zinc-800">
              <img
                src={prompt.imageUrl}
                alt={prompt.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-[48px] bg-slate-50 dark:bg-zinc-900 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 dark:border-zinc-800 gap-4">
              <ImageIcon className="size-20" />
              <p className="font-bold">لا توجد صورة معاينة</p>
            </div>
          )}
        </motion.div>

        {/* Right Side: Prompt Text & Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="bg-white dark:bg-zinc-950 rounded-[48px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-slate-100 dark:ring-zinc-800">
            <div className="p-8 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Copy className="size-5" />
                </div>
                <h3 className="text-xl font-black">نص البرومبت</h3>
              </div>
              <Button
                onClick={handleCopy}
                className="h-11 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    نسخ النص
                  </>
                )}
              </Button>
            </div>

            <div className="p-8 flex-1 overflow-auto bg-white dark:bg-zinc-950">
              <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-zinc-800 text-lg font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {prompt.prompt}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 dark:bg-zinc-900/50 dark:border-zinc-800">
              <div className="flex items-start gap-4 p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/10">
                <Sparkles className="size-6 text-emerald-500 mt-1 shrink-0" />
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 leading-relaxed">
                  نصيحة: يمكنك تعديل بعض الكلمات في النص أعلاه ليتناسب بشكل أدق
                  مع احتياجك الخاص، النسخة الحالية هي النموذج الاحترافي العام.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
