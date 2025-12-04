"use client";
import React from "react";

export default function NewsTicker({ headlines }: { headlines: string[] }) {
  return (
    <div className="w-full bg-primary text-white overflow-hidden whitespace-nowrap mb-10">
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      <div className="inline-block animate-marquee py-2">
        {headlines.map((text, i) => (
          <span key={i} className="mx-6 font-semibold text-sm">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
