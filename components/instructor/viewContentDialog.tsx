"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AllContent } from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { Maximize2, X, FileText } from "lucide-react";
import VideoPlayer from "../VideoPlayer";

interface ViewContentDialogProps {
  active: boolean;
  setActive: (open: boolean) => void;
  content: AllContent;
}

export default function ViewContentDialog({
  active,
  setActive,
  content,
}: ViewContentDialogProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <>
      <Dialog open={active} onOpenChange={setActive}>
        <DialogContent dir="rtl" className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-black text-xl">
              👁️ عرض المحتوى: {content.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pl-2">
            {content.description && (
              <p className="text-slate-500 font-medium">
                {content.description}
              </p>
            )}

            {content.contentType === "text" && content.textContent && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-700">
                <p className="whitespace-pre-line">{content.textContent}</p>
              </div>
            )}

            {content.contentType === "video" && content.videoUrl && (
              <div className="mt-2 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <VideoPlayer src={content.videoUrl} />
              </div>
            )}

            {content.contentType === "image" && (
              <div className="space-y-4">
                {content.imageUrls ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      try {
                        const urls = JSON.parse(content.imageUrls);
                        return Array.isArray(urls)
                          ? urls.map((url: string, index: number) => (
                              <div
                                key={index}
                                className="relative aspect-video rounded-xl overflow-hidden shadow-sm group cursor-zoom-in border border-slate-100 hover:border-primary/50 transition-all"
                                onClick={() => setSelectedImage(url)}
                              >
                                <Image
                                  src={url}
                                  alt={`${content.title}-${index}`}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                  <div className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 className="size-5 text-white" />
                                  </div>
                                </div>
                              </div>
                            ))
                          : null;
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                ) : (
                  content.imageUrl && (
                    <div
                      className="relative aspect-video rounded-2xl overflow-hidden shadow-md group cursor-zoom-in border border-slate-100 hover:border-primary/50 transition-all"
                      onClick={() => setSelectedImage(content.imageUrl!)}
                    >
                      <Image
                        src={content.imageUrl}
                        alt={content.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                        <div className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="size-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {content.contentType === "attachment" && content.attachmentUrl && (
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <Link
                  href={content.attachmentUrl}
                  download
                  className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-3"
                  target="_blank"
                >
                  <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <FileText className="size-5" />
                  </div>
                  <span>
                    تحميل الملف ({content.attachmentName || "ملف مرفق"})
                  </span>
                </Link>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              className="w-full h-12 rounded-xl font-black"
              onClick={() => setActive(false)}
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox for Image Expansion */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/90 border-none">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Expanded view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all"
            >
              <X className="size-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
