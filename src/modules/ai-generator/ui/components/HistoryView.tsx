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
  Lock,
} from "lucide-react";
import {
  fetchGenerationHistoryAction,
  deleteGenerationAction,
  checkGenerationStatus,
  updateGenerationStatusAction,
  refundFailedTaskAction,
} from "@/app/actions/ai-common";
import Swal from "sweetalert2";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

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
  resultsJson?: string;
  resolution?: string;
  duration?: number;
};

// ─── STATUS_MAP يجب أن يكون قبل HistoryItemCard ───────────────────────────
const STATUS_MAP: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "جارٍ العمل",
    color: "text-blue-500 bg-blue-50 border-blue-200",
    icon: Loader2,
  },
  completed: {
    label: "مكتمل",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  failed: {
    label: "فشل",
    color: "text-red-500 bg-red-50 border-red-200",
    icon: XCircle,
  },
};

// 1. مكون ميمو لتقليل الرندر غير الضروري
const HistoryItemCard = React.memo(
  ({
    item,
    onSelect,
    onDelete,
    onSync,
  }: {
    item: HistoryItem;
    onSelect: (item: HistoryItem) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onSync: (e: React.MouseEvent, item: HistoryItem) => void;
  }) => {
    const statusInfo = STATUS_MAP[item.status] ?? STATUS_MAP.pending;
    const StatusIcon = statusInfo.icon;
    const videoUrl = item.type === "video" ? item.resultUrl : null;

    // محاولة الحصول على صورة مصغرة
    let displayImage = item.thumbnailUrl || item.resultUrl;

    // إذا لم يوجد رابط مباشر، نحاول استخراجه من JSON (لحالة الصور المتعددة)
    if (!displayImage && item.resultsJson) {
      try {
        const parsed = JSON.parse(item.resultsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          displayImage = parsed[0];
        }
      } catch (e) {
        console.error("Error parsing resultsJson", e);
      }
    }

    return (
      <div
        onClick={() => (item.status === "completed" ? onSelect(item) : null)}
        className={`bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col transition hover:shadow-md ${
          item.status === "completed" ? "cursor-pointer" : ""
        }`}
      >
        {/* Thumbnail */}
        <div className="relative bg-zinc-900 aspect-video flex items-center justify-center overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.prompt}
              width={400}
              height={300}
              unoptimized
              loading="lazy"
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

          {/* Play overlay */}
          {item.status === "completed" && videoUrl && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-primary fill-primary mr-[-2px]" />
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${statusInfo.color}`}
          >
            <StatusIcon
              className={`w-3 h-3 ${item.status === "pending" ? "animate-spin" : ""}`}
            />
            {statusInfo.label}
          </div>

          {/* Type & Count badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <div className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {item.type === "video" ? "فيديو" : "صورة"}
            </div>
            {item.type === "image" &&
              item.resultsJson &&
              (() => {
                try {
                  const arr = JSON.parse(item.resultsJson);
                  if (Array.isArray(arr) && arr.length > 0) {
                    return (
                      <div className="bg-primary/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white/20">
                        {arr.length} صور
                      </div>
                    );
                  }
                } catch {
                  return null;
                }
              })()}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <p className="text-sm font-semibold text-zinc-800 line-clamp-2 leading-relaxed h-[40px]">
            {item.prompt || "—"}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {item.model}
            </span>
            {item.resolution && (
              <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {item.resolution}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100">
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Clock className="w-3 h-3" />
              {new Date(item.createdAt).toLocaleDateString("ar-EG")}
            </span>

            <div className="flex items-center gap-3">
              {item.status === "pending" && (
                <button
                  onClick={(e) => onSync(e, item)}
                  title="تحديث الحالة"
                  className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => onDelete(e, item.id)}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

HistoryItemCard.displayName = "HistoryItemCard";

// STATUS_MAP moved above HistoryItemCard (see top of file)

export default function HistoryView({ isActive }: { isActive?: boolean }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<"all" | "video" | "image">("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadHistory = useCallback(
    async (p: number, f: typeof filter) => {
      if (!session) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchGenerationHistoryAction(p, 8, f);
        if (!res.success) {
          setError(res.error || "فشل تحميل السجل");
          return;
        }
        const list: HistoryItem[] = (res.data as any) ?? [];
        setItems(list);
        setHasMore(list.length === 8);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  );

  useEffect(() => {
    if (isActive && isMounted) {
      loadHistory(page, filter);
    }
  }, [page, filter, loadHistory, isActive, isMounted]);

  if (!isMounted) return null;

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f);
    setPage(1);
    setSelectedItem(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة هذا السجل بعد حذفه!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      background: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteGenerationAction(id);
        if (res.success) {
          setItems((prev) => prev.filter((item) => item.id !== id));

          Swal.fire({
            title: "تم الحذف!",
            text: "تم إزالة السجل بنجاح.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire("خطأ!", res.error || "حدث خطأ أثناء الحذف", "error");
        }
      } catch (err) {
        Swal.fire("خطأ!", "فشلت عملية الحذف", "error");
      }
    }
  };

  const getVideoUrl = (item: HistoryItem) =>
    item.type === "video" ? item.resultUrl : null;

  const getImageUrl = (item: HistoryItem) =>
    item.type === "image" ? item.resultUrl : null;

  const handleSyncStatus = async (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    if (isSyncing) return;

    setIsSyncing(item.id);
    try {
      const res = await checkGenerationStatus(item.taskUuid);
      if (!res.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "تعذر الاتصال بالسيرفر حالياً",
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      const status = res.data.status;
      const isCompleted = status === 2 || String(status).toLowerCase() === "completed" || String(status).toLowerCase() === "success";
      const isFailed = status === 3 || String(status).toLowerCase() === "failed" || String(status).toLowerCase() === "error";

      if (isCompleted) {
        let foundUrl = null;
        if (res.data.generated_video?.[0]?.video_url) foundUrl = res.data.generated_video[0].video_url;
        else if (res.data.video) foundUrl = res.data.video;
        else if (res.data.files?.[0]?.url) foundUrl = res.data.files[0].url;
        else if (res.data.url) foundUrl = res.data.url;

        await updateGenerationStatusAction(
          item.taskUuid,
          "completed",
          foundUrl || "",
          res.data.thumbnail_url || res.data.thumbnail || ""
        );
        
        Swal.fire({
          icon: "success",
          title: "اكتمل التوليد!",
          text: "تم تحديث الحالة بنجاح.",
          timer: 2000,
        });
        loadHistory(page, filter);
      } else if (isFailed) {
        await updateGenerationStatusAction(item.taskUuid, "failed");
        await refundFailedTaskAction(item.taskUuid, res.data.error || "Failed");
        
        Swal.fire({
          icon: "info",
          title: "فشل التوليد",
          text: "تم التأكد من فشل العملية وإعادة الرصيد لمحفظتك.",
        });
        loadHistory(page, filter);
      } else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "ما زال قيد المعالجة...",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(null);
    }
  };

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
        {!session ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400 bg-white rounded-3xl border border-zinc-100 shadow-sm">
            <div className="bg-zinc-50 p-6 rounded-full mb-6">
              <Lock className="w-12 h-12 opacity-20" />
            </div>
            <p className="font-bold text-xl mb-2 text-zinc-800">
              سجل التوليدات محمي
            </p>
            <p className="text-sm mb-6 text-zinc-500">
              يجب تسجيل الدخول لتتمكن من استعراض تاريخ توليداتك السابقة
            </p>
            <button
              onClick={() => (window.location.href = "/sign-in")}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              تسجيل الدخول الآن
            </button>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              {/* Filter Tabs */}
              <div className="flex bg-white border border-zinc-200 rounded-xl p-1 gap-1 shadow-sm">
                {(
                  [
                    { id: "all", label: "الكل", icon: History },
                    { id: "video", label: "فيديو", icon: Video },
                    { id: "image", label: "صور", icon: ImageIcon },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
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
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
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
                <p className="font-semibold text-lg mb-1">
                  لا توجد توليدات بعد
                </p>
                <p className="text-sm">ابدأ بتوليد فيديو أو صورة لتظهر هنا</p>
              </div>
            )}

            {/* Grid */}
            {!isLoading && items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {items.map((item) => (
                  <HistoryItemCard
                    key={item.id}
                    item={item}
                    onSelect={setSelectedItem}
                    onDelete={handleDelete}
                    onSync={handleSyncStatus}
                  />
                ))}
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
          </>
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
                {(() => {
                  const multiImages = selectedItem.resultsJson
                    ? JSON.parse(selectedItem.resultsJson)
                    : null;
                  const hasMulti =
                    Array.isArray(multiImages) && multiImages.length > 1;

                  return (
                    <>
                      {hasMulti && (
                        <button
                          onClick={async () => {
                            try {
                              Swal.fire({
                                title: "جاري التحميل...",
                                html: "يرجى الانتظار بينما يتم تجهيز الصور",
                                allowOutsideClick: false,
                                didOpen: () => {
                                  Swal.showLoading();
                                },
                              });

                              for (let i = 0; i < multiImages.length; i++) {
                                const url = multiImages[i];
                                const baseFilename = `image-${selectedItem.id}-${i + 1}`;
                                
                                if (url.startsWith("data:")) {
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = baseFilename + ".png";
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } else {
                                  try {
                                    const res = await fetch(url);
                                    if (!res.ok) throw new Error("Fetch failed");
                                    const blob = await res.blob();
                                    const contentType = res.headers.get("content-type") || "";
                                    let ext = ".png";
                                    if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = ".jpg";
                                    else if (contentType.includes("webp")) ext = ".webp";
                                    
                                    const objectUrl = window.URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = objectUrl;
                                    link.download = baseFilename + ext;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(objectUrl);
                                  } catch (e) {
                                    const link = document.createElement("a");
                                    link.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(baseFilename + ".png")}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }
                                await new Promise((r) => setTimeout(r, 300));
                              }
                              Swal.close();
                            } catch (e) {
                              Swal.fire("خطأ", "حدث خطأ أثناء تحميل الملفات", "error");
                            }
                          }}
                          className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تحميل الكل ({multiImages.length})
                        </button>
                      )}
                      {(getVideoUrl(selectedItem) ||
                        getImageUrl(selectedItem)) && (
                        <button
                          onClick={async () => {
                            const url = getVideoUrl(selectedItem) || getImageUrl(selectedItem);
                            if (!url) return;
                            
                            try {
                              Swal.fire({
                                title: "جاري التحميل...",
                                text: "يرجى الانتظار",
                                allowOutsideClick: false,
                                didOpen: () => {
                                  Swal.showLoading();
                                },
                              });

                              const baseFilename = `${selectedItem.type}-${selectedItem.id}`;
                              const defaultExt = selectedItem.type === "video" ? ".mp4" : ".png";

                              if (url.startsWith("data:")) {
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = baseFilename + defaultExt;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else {
                                try {
                                  const res = await fetch(url);
                                  if (!res.ok) throw new Error("Fetch failed");
                                  const blob = await res.blob();
                                  const contentType = res.headers.get("content-type") || "";
                                  let ext = defaultExt;
                                  if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = ".jpg";
                                  else if (contentType.includes("webp")) ext = ".webp";
                                  else if (contentType.includes("webm")) ext = ".webm";
                                  
                                  const objectUrl = window.URL.createObjectURL(blob);
                                  const link = document.createElement("a");
                                  link.href = objectUrl;
                                  link.download = baseFilename + ext;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(objectUrl);
                                } catch (e) {
                                  const link = document.createElement("a");
                                  link.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(baseFilename + defaultExt)}`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }
                              Swal.close();
                            } catch (e) {
                              Swal.fire("خطأ", "حدث خطأ أثناء التحميل", "error");
                            }
                          }}
                          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {hasMulti ? "تحميل الواحدة" : "تحميل"}
                        </button>
                      )}
                    </>
                  );
                })()}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-zinc-400 hover:text-white text-2xl leading-none transition"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Media Player */}
            <div
              className={`bg-black ${selectedItem.type === "image" && selectedItem.resultsJson ? "overflow-y-auto max-h-[70vh]" : "aspect-video"}`}
            >
              {selectedItem.type === "video" ? (
                getVideoUrl(selectedItem) ? (
                  <video
                    src={getVideoUrl(selectedItem)!}
                    controls
                    autoPlay
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500">
                    لا يوجد رابط فيديو متاح
                  </div>
                )
              ) : (
                (() => {
                  const multiImages = selectedItem.resultsJson
                    ? JSON.parse(selectedItem.resultsJson)
                    : null;
                  if (Array.isArray(multiImages) && multiImages.length > 0) {
                    return (
                      <div className={`grid gap-2 p-2 ${multiImages.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                        {multiImages.map((src: string, idx: number) => (
                          <Image
                            key={idx}
                            src={src}
                            alt={`${selectedItem.prompt} ${idx + 1}`}
                            className={`w-full ${multiImages.length === 1 ? "h-full object-contain" : "h-auto object-cover rounded-lg border border-zinc-800"}`}
                            width={400}
                            height={300}
                            unoptimized
                          />
                        ))}
                      </div>
                    );
                  }
                  return getImageUrl(selectedItem) ? (
                    <Image
                      src={getImageUrl(selectedItem)!}
                      alt={selectedItem.prompt}
                      width={400}
                      height={300}
                      unoptimized
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500">
                      لا يوجد رابط صورة متاح
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
