"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PromptsGrid({ prompts, type }: { prompts: any[], type: "image" | "video" }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ الأمر بنجاح!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {prompts.map((prompt, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          key={prompt.id}
          className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
        >
          <div className="aspect-square relative bg-zinc-100 overflow-hidden">
            {prompt.type === "video" ? (
              <video
                src={prompt.mediaUrl}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                muted
                loop
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
              />
            ) : (
              <img
                src={prompt.mediaUrl}
                alt={prompt.title || "Prompt Media"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}

            {/* Category Tag */}
            {prompt.category && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20">
                {prompt.category}
              </div>
            )}
            
            {/* Copy overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button
                onClick={() => handleCopy(prompt.id, prompt.promptText)}
                className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-xl font-bold shadow-2xl hover:scale-105 transition-transform"
              >
                {copiedId === prompt.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    نسخ الأمر
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-1">
            {prompt.title && (
              <h3 className="font-black text-zinc-900 mb-2 truncate" title={prompt.title}>
                {prompt.title}
              </h3>
            )}
            <div className="text-xs text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex-1 overflow-y-auto max-h-28 custom-scrollbar relative">
              <p className="font-mono" dir="ltr">{prompt.promptText}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
