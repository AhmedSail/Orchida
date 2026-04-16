import React from "react";
import { Loader2, Zap } from "lucide-react";

interface ImageGenActionProps {
  userBalance: number | null;
  cost: number;
  isGenerating: boolean;
  onGenerate: () => void;
  provider: string;
}

export const ImageGenAction: React.FC<ImageGenActionProps> = ({
  userBalance,
  cost,
  isGenerating,
  onGenerate,
  provider,
}) => {
  return (
    <div className="mt-auto border-t border-zinc-100 pt-6">
      <div className="flex justify-between items-center bg-white p-2 rounded-2xl">
        <div className="flex flex-col px-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            الرصيد: {userBalance ?? "..."}
          </span>
          <span className="text-[10px] font-bold text-primary">
            التكلفة المتوقعة: {cost} كريدت
          </span>
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`px-8 py-3.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${provider === "Grok" ? "bg-blue-600 text-white" : "bg-primary text-white"}`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جارٍ الرسم...
            </>
          ) : (
            <>
              توليد باستخدام {provider} <Zap className="w-4 h-4 fill-white" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
