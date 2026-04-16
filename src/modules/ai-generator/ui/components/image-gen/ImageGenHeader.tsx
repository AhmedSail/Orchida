import React from "react";
import { Image as ImageIcon, Sparkles, Trash2 } from "lucide-react";

interface ImageGenHeaderProps {
  onClearAll: () => void;
}

export const ImageGenHeader: React.FC<ImageGenHeaderProps> = ({ onClearAll }) => {
  return (
    <div className="text-center px-4 mb-4">
      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
        <ImageIcon className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
        مولّد الصور الذكي
      </h1>
      <p className="text-zinc-500 font-medium">
        أدخل وصفاً وحوّل كلماتك إلى لوحات فنية رائعة
      </p>
      
      <div className="flex bg-zinc-100 mx-auto w-full md:w-[300px] p-1 rounded-xl mt-6 gap-1">
        <button className="flex-[2] flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg shadow transition-all active:scale-95">
          <Sparkles className="w-3.5 h-3.5" />
          إنشاء جديد
        </button>
        <button 
          onClick={onClearAll}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-zinc-500 hover:text-red-500 text-xs font-bold py-2 rounded-lg border border-zinc-200 hover:border-red-200 transition-all active:scale-95 group"
        >
          <Trash2 className="w-3.5 h-3.5 group-hover:animate-bounce" />
          مسح
        </button>
      </div>
    </div>
  );
};
