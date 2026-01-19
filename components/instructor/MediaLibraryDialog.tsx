"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InstructorMediaLibraryContent from "./InstructorMediaLibraryContent";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibraryDialog({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            اختر من مكتبة الملفات
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <InstructorMediaLibraryContent
            className="h-full"
            onSelect={(file) => {
              if (file.type === "image") {
                onSelect(file.url);
                onClose();
              } else {
                // You can add logic for other types if needed
                alert("يرجى اختيار صورة فقط");
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
