import React from "react";
import { Image as ImageIcon, Trash2, Monitor, Smartphone, Square } from "lucide-react";

interface ImageGenSettingsProps {
  provider: string;
  imageReference: File | null;
  setImageReference: (file: File | null) => void;
  numResults: number;
  setNumResults: (num: number) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  orientation: string;
  setOrientation: (orientation: string) => void;
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  resolution: string;
  setResolution: (res: string) => void;
}

export const ImageGenSettings: React.FC<ImageGenSettingsProps> = ({
  provider,
  imageReference,
  setImageReference,
  numResults,
  setNumResults,
  aspectRatio,
  setAspectRatio,
  orientation,
  setOrientation,
  outputFormat,
  setOutputFormat,
  resolution,
  setResolution,
}) => {
  return (
    <div className="space-y-10">
      {/* Image Reference */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          مرجع بصري
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => document.getElementById("image-ref-input")?.click()}
            className="flex items-center gap-3 px-5 py-4 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-600 hover:border-primary/50 hover:bg-primary/5 transition-all flex-1 group"
          >
            <ImageIcon className="size-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="truncate max-w-[200px]">
              {imageReference ? imageReference.name : "إضافة صورة مرجعية"}
            </span>
          </button>
          {imageReference && (
            <button
              onClick={() => {
                setImageReference(null);
                const fileInput = document.getElementById("image-ref-input") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
              }}
              className="size-14 flex items-center justify-center bg-red-50 border border-red-100 rounded-2xl text-red-500 hover:bg-red-500 transition-all hover:text-white"
              title="حذف"
            >
              <Trash2 className="size-5" />
            </button>
          )}
        </div>
        <input
          id="image-ref-input"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => setImageReference(e.target.files?.[0] || null)}
        />
      </div>

      {/* Number of Results */}
      {(provider === "Grok" || provider === "Meta AI") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              عدد الصور
            </label>
            {provider === "Grok" && imageReference && (
              <span className="text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                الحد الأقصى مع الصورة المرجعية: 2
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(() => {
              let options = [1, 2, 3, 4, 5, 6];
              if (provider === "Meta AI") {
                options = [1, 2, 3, 4];
              } else if (provider === "Grok" && imageReference) {
                options = [1, 2];
                if (numResults > 2) setNumResults(1);
              }
              
              return options.map((num) => (
                <button
                  key={num}
                  onClick={() => setNumResults(num)}
                  className={`size-12 flex items-center justify-center rounded-xl border font-black text-xs transition-all ${numResults === num ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400"}`}
                >
                  {num}
                </button>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Orientation */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          {(provider === "Grok" || provider === "Meta AI") ? "نسبة الأبعاد" : "الأبعاد"}
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {(provider === "Grok" || provider === "Meta AI") ? (
            [
              { id: "Landscape (16:9)", label: "16:9", icon: Monitor },
              { id: "Portrait (9:16)", label: "9:16", icon: Smartphone },
              { id: "Square (1:1)", label: "1:1", icon: Square },
              ...(provider === "Grok" ? [
                { id: "Vertical (2:3)", label: "2:3", icon: Smartphone },
                { id: "Horizontal (3:2)", label: "3:2", icon: Monitor },
              ] : [])
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setOrientation(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${orientation === item.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400"}`}
              >
                <item.icon className="size-4 mb-2" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            ))
          ) : (
            [
              { id: "1:1", label: "1:1", icon: Square },
              { id: "16:9", label: "16:9", icon: Monitor },
              { id: "9:16", label: "9:16", icon: Smartphone },
              { id: "3:4", label: "3:4", icon: Smartphone },
              { id: "4:3", label: "4:3", icon: Monitor },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${aspectRatio === item.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400"}`}
              >
                <item.icon className="size-4 mb-2" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Quality (Imagen Only) */}
      {(provider !== "Grok" && provider !== "Meta AI") && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">تنسيق المخرج</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-zinc-600 outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
            >
              <option value="JPEG">JPEG High</option>
              <option value="PNG">PNG Raw</option>
              <option value="WEBP">WEBP Lite</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">الدقة القصوى</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-zinc-600 outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
            >
              <option value="1K">1K (Standard)</option>
              <option value="2K">2K (Full HD)</option>
              <option value="4K">4K (Ultra HD)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
