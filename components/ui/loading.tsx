"use client";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import { Loader2 } from "lucide-react";

export function Loading({
  text = "جاري التحميل...",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={`h-5 w-5 animate-accordion-down ${className}`} />
      {/* هنا يظهر الأيقونة وتلف */}
      <span>{text}</span>
    </div>
  );
}
