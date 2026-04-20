"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
        copied ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          تم النسخ!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          نسخ الأمر
        </>
      )}
    </button>
  );
}
