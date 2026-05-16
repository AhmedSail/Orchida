import React from "react";
import Image from "next/image";
import {
  Download,
  Maximize,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Terminal,
} from "lucide-react";

interface ImageGenResultsProps {
  isGenerating: boolean;
  resultImageUrls: string[];
  onOpenLightbox: (url: string, index: number) => void;
}

const handleDownload = async (url: string, index: number) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `orchida-image-${index + 1}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // fallback: open in new tab
    window.open(url, "_blank");
  }
};

export const ImageGenResults: React.FC<ImageGenResultsProps> = ({
  isGenerating,
  resultImageUrls,
  onOpenLightbox,
}) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex flex-col min-h-[500px] overflow-hidden relative group/results">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
            <Sparkles className="size-5" />
          </div>
          <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">
            مختبر النتائج
          </h2>
        </div>
        {resultImageUrls.length > 0 && !isGenerating && (
          <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100 flex items-center gap-2 tracking-widest">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            جاهزة للتحميل
          </div>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#0a0a0c] rounded-3xl group">
        {/* Subtle Scanline Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
            backgroundSize: "100% 2px, 3px 100%",
          }}
        />

        {/* Overlay Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none z-10" />

        {isGenerating ? (
          <div className="relative z-20 flex flex-col items-center gap-8">
            <div className="relative">
              <div className="size-24 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-black text-white italic tracking-tight">
                جاري التوليد...
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                يتم بناء الصورة الآن، لحظة من فضلك
              </p>
            </div>
          </div>
        ) : resultImageUrls.length > 0 ? (
          <div
            className={`grid w-full h-full p-6 gap-6 relative z-10 ${
              resultImageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {resultImageUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square group/item rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500"
              >
                <Image
                  src={url}
                  fill
                  alt={`صورة مولّدة ${idx + 1}`}
                  className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                  unoptimized
                />
                {/* Hover overlay with two buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                  {/* View full */}
                  <button
                    onClick={() => onOpenLightbox(url, idx)}
                    className="size-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center scale-90 group-hover/item:scale-100 transition-transform duration-500 hover:bg-white/20"
                  >
                    <Maximize className="size-5 text-white" />
                  </button>
                  {/* Download */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(url, idx);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/90 hover:bg-primary backdrop-blur-xl border border-primary/40 rounded-full text-white text-[9px] font-black tracking-widest transition-all hover:scale-105"
                  >
                    <Download className="size-3.5" />
                    تحميل
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center opacity-40 relative z-20">
            <div className="size-20 rounded-full border border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900 shadow-inner">
              <ImageIcon className="size-8 text-zinc-600" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                في انتظار الطلب...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div
              className={`size-1.5 rounded-full ${isGenerating ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
            />
            الحالة: {isGenerating ? "جاري العمل" : "جاهز"}
          </div>
          <div className="h-3 w-px bg-zinc-200" />
          <span>الملفات: {resultImageUrls.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Terminal className="size-3 text-primary/40" />
          محرك أوركيدة
        </div>
      </div>
    </div>
  );
};
