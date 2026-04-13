"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Video,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Play,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  Filter,
  Trash2,
} from "lucide-react";
import { 
  fetchGenerationHistoryAction, 
  deleteGenerationAction 
} from "@/app/actions/ai-common";
import Swal from 'sweetalert2';

type HistoryItem = {
  id: string;
  taskUuid: string;
  model: string;
  prompt: string;
  type: "video" | "image";
  status: "pending" | "completed" | "failed";
  createdAt: string;
  thumbnailUrl?: string;
  resultUrl?: string;
  resolution?: string;
  duration?: number;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "جارٍ العمل", color: "text-blue-500 bg-blue-50 border-blue-200", icon: Loader2 },
  completed: { label: "مكتمل", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle },
  failed: { label: "فشل", color: "text-red-500 bg-red-50 border-red-200", icon: XCircle },
};

export default function HistoryView() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<"all" | "video" | "image">("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const loadHistory = useCallback(async (p: number, f: typeof filter) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchGenerationHistoryAction(p, 12, f);
      if (!res.success) {
        setError(res.error || "فشل تحميل السجل");
        return;
      }
      // GeminiGen returns { data: [...], total, page, page_size } or similar
      const list: HistoryItem[] = (res.data as any) ?? [];
      setItems(list);
      setHasMore(list.length === 12);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(page, filter);
  }, [page, filter, loadHistory]);

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    setPage(1);
    setSelectedItem(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة هذا السجل بعد حذفه!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، احذفه!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      background: '#fff',
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteGenerationAction(id);
        if (res.success) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          
          Swal.fire({
            title: 'تم الحذف!',
            text: 'تم إزالة السجل بنجاح.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire('خطأ!', res.error || 'حدث خطأ أثناء الحذف', 'error');
        }
      } catch (err) {
        Swal.fire('خطأ!', 'فشلت عملية الحذف', 'error');
      }
    }
  };

  const getVideoUrl = (item: HistoryItem) =>
    item.type === "video" ? item.resultUrl : null;

  const getImageUrl = (item: HistoryItem) =>
    item.type === "image" ? item.resultUrl : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative z-10 w-full pb-20" dir="rtl">
      {/* Header */}
      <div className="text-center px-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          سجل التوليدات
        </h1>
        <p className="text-zinc-500 font-medium">
          استعرض جميع الفيديوهات والصور التي قمت بتوليدها سابقاً
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto px-4">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Filter Tabs */}
          <div className="flex bg-white border border-zinc-200 rounded-xl p-1 gap-1 shadow-sm">
            {([
              { id: "all", label: "الكل", icon: History },
              { id: "video", label: "فيديو", icon: Video },
              { id: "image", label: "صور", icon: ImageIcon },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleFilterChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filter === id
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadHistory(page, filter)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="font-medium">جارٍ تحميل السجل...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <History className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-semibold text-lg mb-1">لا توجد توليدات بعد</p>
            <p className="text-sm">ابدأ بتوليد فيديو أو صورة لتظهر هنا</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {items.map((item) => {
              const statusInfo = STATUS_MAP[item.status] ?? STATUS_MAP.pending;
              const StatusIcon = statusInfo.icon;
              const videoUrl = getVideoUrl(item);
              const thumb = item.thumbnailUrl;
              const resUrl = item.resultUrl;

              return (
                <div
                  key={item.id}
                  onClick={() => item.status === "completed" ? setSelectedItem(item) : null}
                  className={`bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col transition hover:shadow-md ${
                    item.status === "completed" ? "cursor-pointer" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative bg-zinc-900 aspect-video flex items-center justify-center overflow-hidden">
                    {thumb || resUrl ? (
                      <img
                        src={thumb || resUrl || ""}
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-zinc-600">
                        {item.type === "video" ? (
                          <Video className="w-10 h-10 opacity-30" />
                        ) : (
                          <ImageIcon className="w-10 h-10 opacity-30" />
                        )}
                      </div>
                    )}

                    {/* Play overlay for completed videos */}
                    {item.status === "completed" && videoUrl && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-primary fill-primary mr-[-2px]" />
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${statusInfo.color}`}>
                      <StatusIcon className={`w-3 h-3 ${item.status === "pending" ? "animate-spin" : ""}`} />
                      {statusInfo.label}
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.type === "video" ? "فيديو" : "صورة"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {/* Prompt */}
                    <p className="text-sm font-semibold text-zinc-800 line-clamp-2 leading-relaxed">
                      {item.prompt || "—"}
                    </p>

                    {/* Model & details */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.model}
                      </span>
                      {item.resolution && (
                        <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.resolution}
                        </span>
                      )}
                      {item.duration ? (
                        <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.duration}ث
                        </span>
                      ) : null}
                    </div>

                    {/* Date & Actions */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100">
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        {item.status === "completed" && videoUrl && (
                          <a
                            href={videoUrl}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            تحميل
                          </a>
                        )}
                        
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && items.length > 0 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </button>
            <span className="text-sm font-semibold text-zinc-500 bg-white border border-zinc-200 rounded-xl px-4 py-2">
              صفحة {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Video Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-zinc-900 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <p className="text-white font-semibold text-sm line-clamp-1">
                  {selectedItem.prompt}
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  {selectedItem.model} · {formatDate(selectedItem.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getVideoUrl(selectedItem) && (
                  <a
                    href={getVideoUrl(selectedItem)!}
                    download
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    تحميل
                  </a>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-zinc-400 hover:text-white text-2xl leading-none transition"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black">
              {getVideoUrl(selectedItem) ? (
                <video
                  src={getVideoUrl(selectedItem)!}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  لا يوجد رابط فيديو متاح
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
