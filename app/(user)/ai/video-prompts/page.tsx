import React from "react";
import Link from "next/link";
import { ArrowRight, Video } from "lucide-react";
import { getPromptsByTypeAction } from "@/app/actions/ai-prompts";
import PromptsGrid from "@/components/ai-generator/PromptsGrid"; 

export const metadata = {
  title: "مكتبة أوامر الفيديو | أوركيدة للذكاء الاصطناعي",
  description: "اكتشف أفضل الأوامر لتوليد فيديوهات سينمائية.",
};

export default async function VideoPromptsPage() {
  const { data: prompts } = await getPromptsByTypeAction("video");

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
          <div className="w-20 h-20 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-zinc-800 mb-4">
            مكتبة أوامر الفيديو (Video Prompts)
          </h1>
          <p className="text-zinc-500 max-w-lg mx-auto text-lg mb-8">
            اكتشف أفضل الأوامر للحصول على فيديوهات سينمائية واقعية ومبهرة باستخدام نماذج الذكاء الاصطناعي وانسخها بضغطة زر.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/ai/pro?mode=video"
              className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              توليد فيديو الآن
            </Link>
          </div>
        </div>

        {/* Dynamic Prompts Grid */}
        {prompts && prompts.length > 0 ? (
          <PromptsGrid prompts={prompts} type="video" />
        ) : (
          <div className="text-center py-20 text-zinc-400 font-medium">
            جاري إضافة الأوامر لهذه المكتبة. عد قريباً!
          </div>
        )}
      </div>
    </div>
  );
}
