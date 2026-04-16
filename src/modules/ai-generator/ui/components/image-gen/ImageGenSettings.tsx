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
    <>
      {/* Image Reference */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-zinc-700 mb-2">
          مرجع الصورة (Image Reference)
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => document.getElementById("image-ref-input")?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition bg-white flex-1"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="truncate max-w-[150px]">
              {imageReference ? imageReference.name : "اختر صورة مرجعية"}
            </span>
          </button>
          {imageReference && (
            <button
              onClick={() => {
                setImageReference(null);
                const fileInput = document.getElementById("image-ref-input") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
              }}
              className="p-2 border border-red-100 rounded-xl text-red-500 hover:bg-red-50 transition bg-white"
              title="مسح الصورة"
            >
              <Trash2 className="w-4 h-4" />
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

      {/* Number of Results (Grok Only) */}
      {provider === "Grok" && (
        <div className="mb-6">
          <label className="block text-sm font-bold text-zinc-700 mb-3">
            عدد الصور (Number of Results)
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setNumResults(num)}
                className={`w-12 h-10 flex items-center justify-center rounded-xl border transition font-bold text-xs ${numResults === num ? "border-primary bg-primary/5 text-primary" : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"}`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 mt-2 font-medium">سيتم توليد مصفوفة من {numResults} صور.</p>
        </div>
      )}

      {/* Aspect Ratio / Orientation */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-zinc-700 mb-3">
          {provider === "Grok" ? "الاتجاه (Orientation)" : "أبعاد الصورة (Aspect Ratio)"}
        </label>
        <div className="flex flex-wrap gap-2">
          {provider === "Grok" ? (
            [
              { id: "Landscape (16:9)", label: "Landscape (16:9)", icon: Monitor },
              { id: "Portrait (9:16)", label: "Portrait (9:16)", icon: Smartphone },
              { id: "Square (1:1)", label: "Square (1:1)", icon: Square },
              { id: "Vertical (2:3)", label: "Vertical (2:3)", icon: Smartphone },
              { id: "Horizontal (3:2)", label: "Horizontal (3:2)", icon: Monitor },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setOrientation(item.id)}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-[80px] ${orientation === item.id ? "border-primary bg-primary/5 text-primary" : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-zinc-100"}`}
              >
                <item.icon className="w-5 h-5 mb-1.5" />
                <span className="text-[9px] font-bold text-center">{item.label}</span>
              </button>
            ))
          ) : (
            [
              { id: "1:1", label: "مربع (1:1)", icon: Square },
              { id: "16:9", label: "أفقي (16:9)", icon: Monitor },
              { id: "9:16", label: "عمودي (9:16)", icon: Smartphone },
              { id: "3:4", label: "3:4", icon: Smartphone },
              { id: "4:3", label: "4:3", icon: Monitor },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id)}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-[70px] ${aspectRatio === item.id ? "border-primary bg-primary/5 text-primary" : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-zinc-100"}`}
              >
                <item.icon className="w-5 h-5 mb-1.5" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Settings Grid (Imagen Only) */}
      {provider !== "Grok" && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">صيغة الملف</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-zinc-50 font-semibold"
            >
              <option value="JPEG">JPEG</option>
              <option value="PNG">PNG</option>
              <option value="WEBP">WEBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">الدقة</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-zinc-50 font-semibold"
            >
              <option value="1K">1K (HD)</option>
              <option value="2K">2K (Full HD)</option>
              <option value="4K">4K (Ultra HD)</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};
