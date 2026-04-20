import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Calendar,
  Tag,
  Share2,
  Info,
} from "lucide-react";
import { getPromptByIdAction } from "@/app/actions/ai-prompts";
import { CopyButton } from "@/components/ai-generator/CopyButton";
import Image from "next/image";

export default async function PhotoPromptDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: prompt, success } = await getPromptByIdAction(id);

  if (!success || !prompt) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-12 pb-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/ai/photo-prompts"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-all font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-100"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للمكتبة
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-lg">
              ID: {id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Media Preview */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[40px] overflow-hidden bg-white shadow-2xl border-8 border-white group">
              <Image
                src={prompt.mediaUrl}
                alt={prompt.title || "AI Generated"}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {prompt.category && (
                <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs font-black rounded-2xl border border-white/20 shadow-xl">
                  {prompt.category}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">
                    تاريخ الإضافة
                  </p>
                  <p className="text-sm font-bold text-zinc-800">
                    {new Date(prompt.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">
                    القسم
                  </p>
                  <p className="text-sm font-bold text-zinc-800">
                    {prompt.category || "عام"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details & Prompt */}
          <div className="flex flex-col">
            <div className="bg-white rounded-[40px] p-8 md:p-10 border border-zinc-100 shadow-sm flex-1 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-black text-zinc-900">
                    {prompt.title || "تفاصيل الأمر الذكي"}
                  </h1>
                </div>

                <div className="space-y-8">
                  {/* Prompt Text Card */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                        نص الأمر (Prompt)
                      </label>
                      <CopyButton text={prompt.promptText} />
                    </div>
                    <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 relative group">
                      <p
                        className="text-zinc-700 leading-relaxed font-mono text-sm selection:bg-primary/20"
                        dir="ltr"
                      >
                        {prompt.promptText}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 space-y-4">
                    <Link
                      href={`/ai/pro?mode=imagen&prompt=${encodeURIComponent(prompt.promptText)}`}
                      className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-95"
                    >
                      <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                      استخدام هذا الأمر الآن
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Card */}
            <div className="mt-6 bg-primary/5 rounded-3xl p-6 border border-primary/10 flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-primary mb-1">
                  نصيحة أوركيدة ✨
                </h4>
                <p className="text-xs text-primary/70 font-bold leading-relaxed">
                  يمكنك تعديل الكلمات داخل الأمر للحصول على نتائج مختلفة، جرب
                  تغيير الألوان أو الإضاءة لتناسب ذوقك الخاص.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
