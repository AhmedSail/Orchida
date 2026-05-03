"use client";

import React, { useState } from "react";
import { 
  Play, 
  BookOpen, 
  AlertCircle, 
  Quote as QuoteIcon, 
  FileText, 
  ChevronLeft 
} from "lucide-react";
import Image from "next/image";

interface Field {
  id: string;
  fieldType: string;
  content: string;
  order: number;
}

interface FreeLessonClientProps {
  fields: Field[];
}

export default function FreeLessonClient({ fields }: FreeLessonClientProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const getYoutubeId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-12">
      {sortedFields.length === 0 ? (
        <div className="p-20 bg-zinc-50 rounded-[40px] text-center border-2 border-dashed border-zinc-200">
          <BookOpen className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
          <p className="font-black text-zinc-400 italic">لا يوجد محتوى لهذا الدرس حالياً.</p>
        </div>
      ) : (
        sortedFields.map((field) => (
          <div key={field.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {field.fieldType === "heading" && (
              <h2 className="text-3xl font-black text-primary border-r-4 border-primary pr-4 py-1">
                {field.content}
              </h2>
            )}
            {field.fieldType === "subheading" && (
              <h3 className="text-lg font-bold text-sky-700 bg-sky-50 border border-sky-100 px-4 py-2 rounded-xl inline-block">
                {field.content}
              </h3>
            )}
            {field.fieldType === "text" && (
              <div className="text-zinc-700 leading-relaxed text-base whitespace-pre-wrap bg-zinc-50/80 border border-zinc-100 rounded-2xl px-5 py-4 font-medium">
                {field.content}
              </div>
            )}
            {field.fieldType === "video" && (
              <div className="relative aspect-video rounded-[32px] overflow-hidden bg-black shadow-2xl border-4 border-white ring-1 ring-zinc-100 group/video cursor-pointer">
                {playingId === field.id ? (
                  <iframe
                    src={
                      field.content.includes("mediadelivery.net")
                        ? `${field.content}${field.content.includes("?") ? "&" : "?"}autoplay=1&loop=false&muted=false&preload=true&responsive=true`
                        : (() => {
                            const id = getYoutubeId(field.content);
                            return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : field.content;
                          })()
                    }
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  />
                ) : (
                  <div className="relative w-full h-full" onClick={() => setPlayingId(field.id)}>
                    {/* Thumbnail Logic */}
                    {(() => {
                      const youtubeId = getYoutubeId(field.content);
                      const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
                      
                      if (thumbUrl) {
                        return (
                          <Image
                            src={thumbUrl}
                            alt="Video Thumbnail"
                            fill
                            className="object-cover opacity-60 group-hover/video:opacity-80 transition-opacity"
                            unoptimized
                          />
                        );
                      }
                      return <div className="w-full h-full bg-zinc-900" />;
                    })()}
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-2xl transform group-hover/video:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-current" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {field.fieldType === "image" && (
              <div className="rounded-[32px] overflow-hidden bg-white shadow-xl border-4 border-white ring-1 ring-zinc-100">
                <img src={field.content} alt="Lesson content" className="w-full h-auto object-cover" />
              </div>
            )}
            {field.fieldType === "file" && (
              <a
                href={field.content}
                target="_blank"
                className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-black text-zinc-900 group-hover:text-primary transition-colors">
                    تحميل المرفقات
                  </p>
                  <p className="text-xs text-zinc-400 font-bold">اضغط للمعاينة أو التحميل</p>
                </div>
              </a>
            )}
            {field.fieldType === "quote" && (
              <div className="relative p-8 bg-zinc-100 rounded-[32px] overflow-hidden">
                <QuoteIcon className="absolute -top-4 -right-4 w-24 h-24 text-zinc-200/50 -rotate-12" />
                <blockquote className="relative text-xl font-bold text-zinc-800 leading-relaxed italic">
                  "{field.content}"
                </blockquote>
              </div>
            )}
            {field.fieldType === "alert" && (
              <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-amber-900 mb-1">ملاحظة هامة</h4>
                  <p className="text-sm font-bold text-amber-800 leading-relaxed">{field.content}</p>
                </div>
              </div>
            )}
            {field.fieldType === "divider" && (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-zinc-200" />
                <div className="flex-1 h-px bg-linear-to-r from-zinc-200 via-zinc-200 to-transparent" />
              </div>
            )}
            {field.fieldType === "link" && (
              <a
                href={field.content}
                target="_blank"
                className="inline-flex items-center gap-2 text-primary font-black hover:underline underline-offset-4"
              >
                {field.content}
                <ChevronLeft className="w-4 h-4" />
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}
