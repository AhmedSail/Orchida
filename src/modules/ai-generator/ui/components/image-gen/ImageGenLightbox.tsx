import React from "react";
import { X, ChevronDown, Download } from "lucide-react";

interface ImageGenLightboxProps {
  lightboxUrl: string | null;
  lightboxIdx: number;
  resultImageUrls: string[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (url: string, index: number) => void;
}

export const ImageGenLightbox: React.FC<ImageGenLightboxProps> = ({
  lightboxUrl,
  lightboxIdx,
  resultImageUrls,
  onClose,
  onPrev,
  onNext,
  onSelect,
}) => {
  if (!lightboxUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      {resultImageUrls.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-5 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
        >
          <ChevronDown className="w-6 h-6 rotate-90" />
        </button>
      )}

      {/* Next */}
      {resultImageUrls.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
        >
          <ChevronDown className="w-6 h-6 -rotate-90" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={lightboxUrl}
          alt="Preview"
          className="max-w-[90vw] max-h-[88vh] object-contain rounded-2xl"
        />
        {/* Bottom bar */}
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-5 py-3 bg-gradient-to-t from-black/70 to-transparent">
          <span className="text-white/70 text-xs font-semibold">
            {lightboxIdx + 1} / {resultImageUrls.length}
          </span>
          <a
            href={lightboxUrl}
            download
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" /> تحميل
          </a>
        </div>
      </div>

      {/* Thumbnails strip */}
      {resultImageUrls.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {resultImageUrls.map((u, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onSelect(u, i); }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === lightboxIdx ? "border-white scale-110 shadow-lg" : "border-white/30 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={u} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
