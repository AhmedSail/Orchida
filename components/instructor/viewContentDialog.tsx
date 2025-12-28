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
  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">
            👁️ عرض المحتوى: {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {content.description && (
            <p className="text-gray-600">{content.description}</p>
          )}

          {content.contentType === "text" && content.textContent && (
            <p className="whitespace-pre-line">{content.textContent}</p>
          )}

          {content.contentType === "video" && content.videoUrl && (
            <div className="mt-2">
              <VideoPlayer src={content.videoUrl} />
            </div>
          )}

          {content.contentType === "image" && content.imageUrl && (
            <div>
              <Image
                src={content.imageUrl}
                alt={content.title}
                className="mt-2 rounded w-full"
                width={200}
                height={200}
                unoptimized
                priority
              />
            </div>
          )}

          {content.contentType === "attachment" && content.attachmentUrl && (
            <div className="flex flex-col space-y-2">
              <Link
                href={content.attachmentUrl}
                download
                className="text-green-600 hover:text-green-800 underline flex items-center space-x-2"
                target="_blank"
              >
                <span>
                  تحميل الملف ({content.attachmentName || "ملف مرفق"})
                </span>
              </Link>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setActive(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
