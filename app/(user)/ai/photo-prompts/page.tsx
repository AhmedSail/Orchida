import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Image as ImageIcon, Copy } from "lucide-react";
import { getPromptsByTypeAction } from "@/app/actions/ai-prompts";
import PromptsGrid from "@/components/ai-generator/PromptsGrid";

export const metadata = {
  title: "مكتبة أوامر الصور | أوركيدة للذكاء الاصطناعي",
  description: "اكتشف آلاف الأوامر (Prompts) لتوليد صور احترافية.",
};

export default async function PhotoPromptsPage() {
  const { data: prompts } = await getPromptsByTypeAction("image");

  return (
    <div className="min-h-screen bg-zinc-50 pt-12 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href="/ai"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="font-semibold text-sm">العودة للرئيسية</span>
        </Link>

        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-zinc-100 mb-10">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-zinc-800 mb-4">
            مكتبة أوامر الصور (Photo Prompts)
          </h1>
          <p className="text-zinc-500 max-w-lg mx-auto text-lg mb-8">
            تصفح مكتبة متجددة من الأوامر الاحترافية، وانسخ ما يعجبك لتوليد صور
            مذهلة بضغطة زر.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/ai/pro?mode=imagen"
              className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              توليد صورة الآن
            </Link>
          </div>
        </div>

        {/* Dynamic Prompts Grid */}
        {prompts && prompts.length > 0 ? (
          <PromptsGrid prompts={prompts} type="image" />
        ) : (
          <div className="text-center py-20 text-zinc-400 font-medium">
            جاري إضافة الأوامر لهذه المكتبة. عد قريباً!
          </div>
        )}
      </div>
    </div>
  );
}
