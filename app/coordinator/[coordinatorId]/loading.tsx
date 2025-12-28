"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-4 shadow-sm shadow-primary space-y-2"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>

      {/* News + Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
