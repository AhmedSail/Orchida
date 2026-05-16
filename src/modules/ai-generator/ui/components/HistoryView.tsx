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
  Maximize,
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
    label: "جاري",
    color: "text-primary bg-primary/5 border-primary/10",
    icon: Loader2,
  },
  completed: {
    label: "مكتمل",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    icon: CheckCircle,
  },
  failed: {
    label: "فشل",
    color: "text-red-600 bg-red-50 border-red-100",
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
        className={`group bg-white border border-zinc-200 rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:border-primary/30 ${
          item.status === "completed" ? "cursor-pointer" : ""
        }`}
      >
        {/* Thumbnail Viewport */}
        <div className="relative bg-[#0a0a0c] aspect-video flex items-center justify-center overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.prompt}
              width={400}
              height={300}
              unoptimized
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-700 opacity-20">
              {item.type === "video" ? (
                <Video className="size-10" />
              ) : (
                <ImageIcon className="size-10" />
              )}
            </div>
          )}

          {/* Viewport Overlay Effects */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
              backgroundSize: "100% 2px",
            }}
          />

          {/* Action Overlay */}
          {item.status === "completed" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
              <div className="size-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                {item.type === "video" ? (
                  <Play className="size-6 text-white fill-white ml-0.5" />
                ) : (
                  <Maximize className="size-6 text-white" />
                )}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black tracking-widest shadow-xl backdrop-blur-md ${statusInfo.color}`}
          >
            <StatusIcon
              className={`size-3 ${item.status === "pending" ? "animate-spin" : ""}`}
            />
            {statusInfo.label}
          </div>

          {/* Type Indicator */}
          <div className="absolute top-4 left-4">
            <div className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest shadow-xl">
              {item.type === "video" ? "MOTION" : "STILL"}
            </div>
          </div>
        </div>

        {/* Studio Content Info */}
        <div className="p-6 flex flex-col gap-4 flex-1 bg-white">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">
              {item.model}
            </p>
            <p className="text-xs font-bold text-zinc-900 line-clamp-2 leading-relaxed min-h-[40px]">
              {item.prompt || "NO_PROMPT_METADATA"}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-50">
            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 font-mono tracking-widest">
              <Clock className="size-3.5 text-zinc-300" />
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>

            <div className="flex items-center gap-2">
              {item.status === "pending" && (
                <button
                  onClick={(e) => onSync(e, item)}
                  className="size-9 flex items-center justify-center bg-zinc-50 text-primary border border-zinc-100 rounded-xl hover:bg-white hover:border-primary/30 transition-all shadow-sm"
                >
                  <RefreshCw className="size-4" />
                </button>
              )}
              <button
                onClick={(e) => onDelete(e, item.id)}
                className="size-9 flex items-center justify-center bg-zinc-50 text-zinc-400 border border-zinc-100 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

HistoryItemCard.displayName = "HistoryItemCard";

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
      background: "#09090b",
      color: "#fff",
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
            background: "#09090b",
            color: "#fff",
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
          background: "#09090b",
          color: "#fff",
        });
        return;
      }

      // Handle both flat and nested GeminiGen responses
      const taskData = res.data?.data || res.data;
      const status = taskData?.status;
      
      // Full log so we can debug field names
      console.log("[HistoryView Sync] Raw taskData:", JSON.stringify(taskData, null, 2));
      
      const isCompleted =
        status === 2 ||
        String(status).toLowerCase() === "completed" ||
        String(status).toLowerCase() === "success";
      const isFailed =
        status === 3 ||
        String(status).toLowerCase() === "failed" ||
        String(status).toLowerCase() === "error";

      if (isCompleted) {
        // Try every possible field name GeminiGen might use
        const foundUrl =
          taskData?.generated_video?.[0]?.video_url ||
          taskData?.video_url ||
          taskData?.video ||
          taskData?.files?.[0]?.url ||
          taskData?.files?.[0]?.video_url ||
          taskData?.result_url ||
          taskData?.output_url ||
          taskData?.url ||
          taskData?.media_url ||
          taskData?.output?.[0]?.url ||
          taskData?.outputs?.[0]?.url ||
          null;

        console.log("[HistoryView Sync] Found URL:", foundUrl);

        await updateGenerationStatusAction(
          item.taskUuid,
          "completed",
          foundUrl || "",
          taskData?.thumbnail_url || taskData?.thumbnail || "",
        );

        Swal.fire({
          icon: "success",
          title: "اكتمل التوليد!",
          text: "تم تحديث الحالة بنجاح.",
          timer: 2000,
          background: "#09090b",
          color: "#fff",
        });
        loadHistory(page, filter);
      } else if (isFailed) {
        await updateGenerationStatusAction(item.taskUuid, "failed");
        await refundFailedTaskAction(item.taskUuid, res.data.error || "Failed");

        Swal.fire({
          icon: "info",
          title: "فشل التوليد",
          text: "تم التأكد من فشل العملية وإعادة الرصيد لمحفظتك.",
          background: "#09090b",
          color: "#fff",
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
          background: "#09090b",
          color: "#fff",
        });
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };

  const handleDownloadAll = async (item: any) => {
    const ext = item.type === "video" ? "mp4" : "jpg";
    let urls: string[] = [];

    // جمع كل الروابط من resultsJson أو resultUrl
    if (item.resultsJson) {
      try {
        const parsed = JSON.parse(item.resultsJson);
        if (Array.isArray(parsed)) urls = parsed;
      } catch {}
    }
    if (urls.length === 0 && item.resultUrl) {
      urls = [item.resultUrl];
    }
    if (urls.length === 0) return;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      if (!url) continue;
      await handleDownload(url, `orchida-${item.type}-${item.id}-${i + 1}.${ext}`);
      // تأخير بسيط بين كل تحميل
      if (i < urls.length - 1) await new Promise(r => setTimeout(r, 600));
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
    <div
      className="relative z-10 w-full pb-32 animate-in fade-in duration-1000"
      dir="rtl"
    >
      {/* Header */}
      <div className="text-center px-4 mb-16">
        <h2 className="text-4xl font-black text-zinc-900 tracking-tight mb-3 italic">
          سجل <span className="text-primary">الإبداعات</span>
        </h2>
        <p className="text-zinc-500 font-medium">
          استكشف أرشيف إبداعاتك السابقة والنتائج التي تم توليدها
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {!session ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400 bg-white border border-zinc-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="bg-zinc-50 p-8 rounded-full mb-8 border border-zinc-100 shadow-xl">
              <Lock className="size-12 text-zinc-300" />
            </div>
            <p className="font-black text-2xl mb-3 text-zinc-900">السجل مشفر</p>
            <p className="text-sm mb-10 text-zinc-500 max-w-xs text-center leading-relaxed">
              يجب تسجيل الدخول لتتمكن من الوصول إلى أرشيف التوليدات الخاص بك
            </p>
            <button
              onClick={() => (window.location.href = "/sign-in")}
              className="bg-primary hover:bg-primary/90 text-white font-black px-12 py-4 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
            >
              فتح السجل
            </button>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
              {/* Filter Tabs */}
              <div className="flex bg-white border border-zinc-200 rounded-2xl p-1.5 gap-2 shadow-sm">
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
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 ${
                      filter === id
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => loadHistory(page, filter)}
                disabled={isLoading}
                className="flex items-center gap-3 px-8 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                />
                تحديث
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 text-red-500 border border-red-100 rounded-2xl px-6 py-4 flex items-center gap-4 mb-10">
                <AlertCircle className="size-5 shrink-0" />
                <p className="text-xs font-bold font-mono tracking-tighter uppercase">
                  {error}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32 text-zinc-300">
                <Loader2 className="size-12 animate-spin mb-6 text-primary" />
                <p className="font-black text-sm uppercase tracking-[0.2em] animate-pulse">
                  جاري التحميل...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-zinc-200">
                <History className="size-20 mb-8" />
                <p className="font-black text-xl mb-2 text-zinc-400">
                  السجل فارغ
                </p>
                <p className="text-xs font-medium text-zinc-300">
                  ابدأ عملية إنتاج جديدة لتظهر هنا
                </p>
              </div>
            )}

            {/* Grid */}
            {!isLoading && items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="flex items-center gap-3 px-8 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all shadow-sm disabled:opacity-20"
                >
                  <ChevronRight className="size-4" />
                  السابق
                </button>
                <span className="text-xs font-black text-primary font-mono bg-primary/5 border border-primary/10 rounded-2xl px-8 py-3 shadow-sm">
                  صفحة {page}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}
                  className="flex items-center gap-3 px-8 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all shadow-sm disabled:opacity-20"
                >
                  التالي
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modern Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden max-w-6xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative flex flex-col md:flex-row h-full max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Area */}
            <div className="flex-1 bg-zinc-50 flex items-center justify-center relative overflow-hidden group/media">
              {selectedItem.type === "video" ? (
                getVideoUrl(selectedItem) ? (
                  <video
                    src={getVideoUrl(selectedItem)!}
                    controls
                    autoPlay
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    className="size-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-zinc-300">
                    <Video className="size-20 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      الملف غير موجود
                    </p>
                  </div>
                )
              ) : (
                (() => {
                  const multiImages = selectedItem.resultsJson
                    ? JSON.parse(selectedItem.resultsJson)
                    : null;
                  if (Array.isArray(multiImages) && multiImages.length > 0) {
                    return (
                      <div
                        className={`grid gap-6 p-8 size-full overflow-y-auto scrollbar-hide ${multiImages.length > 1 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
                      >
                        {multiImages.map((src: string, idx: number) => (
                          <Image
                            key={idx}
                            src={src}
                            alt={`${selectedItem.prompt} ${idx + 1}`}
                            className="w-full h-auto object-cover rounded-3xl border border-zinc-200 shadow-xl transition-transform hover:scale-[1.02]"
                            width={800}
                            height={600}
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
                      width={1200}
                      height={900}
                      unoptimized
                      className="size-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-300">
                      <ImageIcon className="size-20 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">
                        Media_Not_Found
                      </p>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Sidebar Info */}
            <div className="w-full md:w-[350px] bg-white border-t md:border-t-0 md:border-r border-zinc-100 p-8 flex flex-col justify-between order-first md:order-last">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                    {selectedItem.type === "video" ? (
                      <Video className="size-5 text-primary" />
                    ) : (
                      <ImageIcon className="size-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      {selectedItem.model}
                    </p>
                  </div>
                </div>

                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">
                  نص الطلب
                </h4>
                <p className="text-sm font-medium text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-8 max-h-[200px] overflow-y-auto">
                  {selectedItem.prompt}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      تاريخ الإنشاء
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 font-mono">
                      {formatDate(selectedItem.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      جودة الملف
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 font-mono uppercase tracking-widest">
                      عالي الجودة
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-3">
                {/* تحميل الكل — يظهر فقط عند وجود أكثر من صورة */}
                {selectedItem.resultsJson && (() => {
                  try {
                    const parsed = JSON.parse(selectedItem.resultsJson);
                    if (Array.isArray(parsed) && parsed.length > 1) {
                      return (
                        <button
                          onClick={() => handleDownloadAll(selectedItem)}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                          <Download className="size-5" />
                          تحميل الكل ({parsed.length} ملفات)
                        </button>
                      );
                    }
                  } catch {}
                  return null;
                })()}

                {/* تحميل ملف واحد */}
                <button
                  onClick={async () => {
                    const url =
                      getVideoUrl(selectedItem) || getImageUrl(selectedItem);
                    if (!url) return;
                    handleDownload(
                      url,
                      `${selectedItem.type}-${selectedItem.id}.${selectedItem.type === "video" ? "mp4" : "png"}`,
                    );
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <Download className="size-5" />
                  تحميل
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 font-black py-4 rounded-2xl transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
