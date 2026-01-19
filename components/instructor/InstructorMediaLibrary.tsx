"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import InstructorMediaLibraryContent from "./InstructorMediaLibraryContent";

interface InstructorMediaLibraryProps {
  onSelect: (file: {
    url: string;
    type: "image" | "video" | "file";
    name: string;
  }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InstructorMediaLibrary({
  onSelect,
  open,
  onOpenChange,
}: InstructorMediaLibraryProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[80vh]" dir="rtl">
        <InstructorMediaLibraryContent
          onSelect={(file) => {
            onSelect(file);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
