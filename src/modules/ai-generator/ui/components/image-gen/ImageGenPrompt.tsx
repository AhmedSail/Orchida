import React from "react";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

interface ImageGenPromptProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isEnhancing: boolean;
  onEnhance: () => void;
  provider: string;
}

export const ImageGenPrompt: React.FC<ImageGenPromptProps> = ({
  prompt,
  setPrompt,
  isEnhancing,
  onEnhance,
  provider
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-sm font-bold text-zinc-700">
          وصف الصورة (Prompt)
        </label>
        <button
          onClick={onEnhance}
          disabled={isEnhancing || !prompt.trim()}
          className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition disabled:opacity-50"
        >
          {isEnhancing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          تحسين الوصف ذكياً ✨
        </button>
        {prompt && (
          <button
            onClick={() => setPrompt("")}
            className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition ml-auto"
          >
            <Trash2 className="w-3 h-3" />
            مسح
          </button>
        )}
      </div>
      <textarea
        className="w-full border border-zinc-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none leading-relaxed transition-all"
        placeholder={
          provider === "Grok"
            ? "وصف الصورة التي تريد توليدها باستخدام Grok..."
            : "صف الصورة التي تريد إنشاؤها بالتفصيل..."
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      ></textarea>
    </div>
  );
};
