"use client";
import React from "react";

export default function NewsTicker({ headlines }: { headlines: string[] }) {
  if (!headlines || headlines.length === 0) return null;

  return (
    <div
      className="w-full bg-primary text-white overflow-hidden relative h-10 border-y border-white/20 flex items-center"
      dir="ltr"
    >
      <style jsx>{`
        @keyframes ticker-swipe {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
        .ticker-wrapper {
          display: flex;
          white-space: nowrap;
          position: absolute;
          left: 0;
          animation: ticker-swipe 30s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="ticker-wrapper" dir="rtl">
        {/* نكرر المحتوى لضمان عدم وجود فراغات كبيرة */}
        {[...headlines].map((text, i) => (
          <div key={i} className="flex items-center px-8">
            <span className="w-2 h-2 bg-white/40 rounded-full ml-4 shrink-0" />
            <span className="font-bold text-sm tracking-wide">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
