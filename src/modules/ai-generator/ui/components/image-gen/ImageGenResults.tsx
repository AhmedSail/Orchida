import React from "react";
import Image from "next/image";
import { Download, Maximize, Sparkles, Image as ImageIcon } from "lucide-react";

interface ImageGenResultsProps {
  isGenerating: boolean;
  resultImageUrls: string[];
  onOpenLightbox: (url: string, index: number) => void;
}

export const ImageGenResults: React.FC<ImageGenResultsProps> = ({
  isGenerating,
  resultImageUrls,
  onOpenLightbox,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-zinc-800">معاينة النتيجة</h2>
        {resultImageUrls.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold">{resultImageUrls.length} صورة</span>
            <a
              href={resultImageUrls[0]}
              download
              target="_blank"
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
            >
              <Download className="w-3.5 h-3.5" /> تحميل الكل
            </a>
          </div>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden flex-1 bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 flex items-center justify-center p-3 min-h-[400px]">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <ImageIcon className="w-7 h-7 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-zinc-700 font-bold text-base">فناننا الرقمي يرسم الآن...</p>
              <p className="text-zinc-400 text-xs mt-1">عادةً ما يستغرق التوليد من 5 إلى 15 ثانية</p>
            </div>
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : resultImageUrls.length > 0 ? (
          <div className={`grid w-full gap-2.5 ${
            resultImageUrls.length === 1 ? "grid-cols-1" :
            resultImageUrls.length <= 2 ? "grid-cols-2" :
            resultImageUrls.length <= 4 ? "grid-cols-2" :
            "grid-cols-3"
          }`}>
            {resultImageUrls.map((url, idx) => (
              <div
                key={idx}
                onClick={() => onOpenLightbox(url, idx)}
                className="relative aspect-square group rounded-2xl overflow-hidden border border-white shadow-md cursor-zoom-in transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={url}
                  fill
                  alt={`Generated Result ${idx + 1}`}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-2 right-2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                  #{idx + 1}
                </span>
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <span className="text-white text-[10px] font-bold flex items-center gap-1">
                    <Maximize className="w-3 h-3" /> عرض
                  </span>
                  <a
                    href={url}
                    download
                    onClick={e => e.stopPropagation()}
                    className="p-1 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/40 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-zinc-300">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-zinc-200">
              <Sparkles className="w-10 h-10 text-zinc-200" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-zinc-400">جاهز للإبداع؟</p>
              <p className="text-xs mt-1 text-zinc-300">اكتب وصفاً واضغط توليد</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
