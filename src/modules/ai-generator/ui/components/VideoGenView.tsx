"use client";

import React, { useState, useEffect } from "react";
import {
  Video as VideoIcon,
  Image as ImageIcon,
  Zap,
  ChevronDown,
  Monitor,
  Smartphone,
  Square,
  Search,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
  Trash2,
  X,
  Download,
  Terminal,
  Settings2,
  Layers,
  History as HistoryIcon,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { generateVideoAction } from "@/app/actions/ai-video";
import {
  checkGenerationStatus,
  refundFailedTaskAction,
  updateGenerationStatusAction,
  enhancePromptAction,
} from "@/app/actions/ai-common";
import { getStudentInternalCredits } from "@/app/actions/ai-credits";
import { getAllAiPricingAction } from "@/app/actions/ai-pricing";

import { authClient } from "@/lib/auth-client";
import Swal from "sweetalert2";

interface PricingRule {
  serviceType: string;
  provider: string;
  quality: string;
  duration: number | null;
  credits: number;
}

interface VideoGenViewProps {
  userBalance?: number | null;
}

export default function VideoGenView({
  userBalance: propBalance,
}: VideoGenViewProps) {
  const searchParams = useSearchParams();
  const [provider, setProvider] = useState("Veo");
  const [veoModel] = useState("veo-3.1-fast");
  const [prompt, setPrompt] = useState("");

  const [orientation, setOrientation] = useState("Landscape (16:9)");
  const [resolution, setResolution] = useState("High 720p");
  const [duration, setDuration] = useState("6");
  const [numResults, setNumResults] = useState(1);
  const [grokMode, setGrokMode] = useState("normal");

  const { data: session } = authClient.useSession();
  const [userBalance, setUserBalance] = useState<number | null>(
    propBalance ?? null,
  );
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  const [firstImage, setFirstImage] = useState<File | null>(null);
  const [lastImage, setLastImage] = useState<File | null>(null);
  const [grokImage, setGrokImage] = useState<File | null>(null);

  const [firstImageUrl, setFirstImageUrl] = useState<string | null>(null);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  const [grokImageUrl, setGrokImageUrl] = useState<string | null>(null);

  const firstImageRef = React.useRef<HTMLInputElement>(null);
  const lastImageRef = React.useRef<HTMLInputElement>(null);
  const grokImageRef = React.useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) setPrompt(decodeURIComponent(urlPrompt));
  }, [searchParams]);

  useEffect(() => {
    if (firstImage) {
      const url = URL.createObjectURL(firstImage);
      setFirstImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [firstImage]);

  useEffect(() => {
    if (lastImage) {
      const url = URL.createObjectURL(lastImage);
      setLastImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [lastImage]);

  useEffect(() => {
    if (grokImage) {
      const url = URL.createObjectURL(grokImage);
      setGrokImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [grokImage]);

  useEffect(() => {
    getAllAiPricingAction().then((rules) => {
      if (rules) setPricingRules(rules as PricingRule[]);
    });
  }, []);

  const calculateCost = () => {
    const seconds = parseInt(duration) || 6;
    const resQuality = resolution.includes("720")
      ? "720p"
      : resolution.includes("1080")
        ? "1080p"
        : "480p";
    const dbProvider = provider.toLowerCase().trim();
    const dbQuality = resQuality.toLowerCase().trim();

    const match = pricingRules.find(
      (r) =>
        r.serviceType === "video" &&
        r.provider.toLowerCase().trim() === dbProvider &&
        r.quality.toLowerCase().trim() === dbQuality &&
        (r.duration === seconds || r.duration === 0 || r.duration === null),
    );

    return match ? match.credits : 3;
  };

  const cost = calculateCost();

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

  const pollStatus = async (uuid: string) => {
    console.log(`[VideoGen] Starting poll for task: ${uuid}`);
    let attempts = 0;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      attempts++;

      if (attempts > 150) { // 150 × 5s = 12.5 دقيقة
        stopped = true;
        setIsGenerating(false);
        toast.error("استغرقت العملية وقتاً طويلاً. يرجى التحقق من الخزنة لاحقاً.");
        return;
      }

      console.log(`[VideoGen] Poll attempt ${attempts} for ${uuid}...`);
      const res = await checkGenerationStatus(uuid);

      if (!res.success) {
        console.warn(`[VideoGen] Poll failed:`, res.error);
        if (!stopped) setTimeout(poll, 5000);
        return;
      }

      const taskData = res.data;
      const status = taskData?.status;

      const isCompleted = status === 2 || String(status).toLowerCase() === "completed";
      const isFailed = status === 3 || String(status).toLowerCase() === "failed" || String(status).toLowerCase() === "error";

      if (isCompleted) {
        stopped = true;
        setIsGenerating(false);

        const foundUrl =
          taskData?.generated_video?.[0]?.video_url ||
          taskData?.video_url ||
          taskData?.video ||
          taskData?.files?.[0]?.url ||
          taskData?.result_url ||
          taskData?.url ||
          null;

        console.log(`[VideoGen] Completed! URL: ${foundUrl}`);

        if (foundUrl) {
          toast.loading("جاري الرفع للسحابة... ☁️", { id: "upload" });
          const saveResult: any = await updateGenerationStatusAction(
            uuid, "completed", foundUrl,
            taskData?.thumbnail_url || ""
          );
          toast.dismiss("upload");
          const displayUrl = saveResult.finalResultUrl || foundUrl;
          console.log(`[VideoGen] Display URL: ${displayUrl}`);
          setResultVideoUrl(displayUrl);
          toast.success("تم توليد الفيديو ورفعه للسحابة بنجاح! ☁️");
        } else {
          console.error("[VideoGen] No URL found in:", JSON.stringify(taskData));
          setGenerationError("تم الانتهاء ولكن لم يتم العثور على رابط الفيديو");
          toast.error("لم نتمكن من العثور على رابط الفيديو الناتج.");
        }
        window.dispatchEvent(new CustomEvent("balanceUpdated"));

      } else if (isFailed) {
        stopped = true;
        setIsGenerating(false);
        const errMsg = taskData?.error_message || taskData?.message || "فشل توليد الفيديو";
        setGenerationError(errMsg);
        toast.error(`فشل الطلب: ${errMsg}`);
        updateGenerationStatusAction(uuid, "failed");

      } else {
        // لا تزال قيد المعالجة - انتظر وحاول مجدداً
        if (!stopped) setTimeout(poll, 5000);
      }
    };

    // ابدأ أول poll بعد 5 ثواني
    setTimeout(poll, 5000);
  };


  const handleGenerate = async () => {
    if (!session) return;
    setIsGenerating(true);
    setGenerationError(null);
    setResultVideoUrl(null);

    try {
      const formData = new FormData();
      formData.append("provider", provider);
      formData.append("model", provider === "Veo" ? veoModel : "grok-3");
      formData.append("prompt", prompt);
      formData.append("duration", duration);
      formData.append("resolution", resolution);
      formData.append("aspectRatio", orientation);
      formData.append("cost", cost.toString());
      formData.append("numResults", numResults.toString());
      formData.append("mode", grokMode);

      if (provider === "Veo") {
        if (firstImage) formData.append("firstImage", firstImage);
        if (lastImage) formData.append("lastImage", lastImage);
      } else if (provider === "Grok" && grokImage) {
        formData.append("image", grokImage);
      }

      const res = await generateVideoAction(formData);
      if (res.success) {
        pollStatus(res.data.uuid);
      } else {
        setGenerationError(res.error || "فشل الطلب");
        setIsGenerating(false);
      }
    } catch (e: any) {
      setGenerationError(e.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Viewport Column - First on Mobile */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="bg-white border border-zinc-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex flex-col aspect-[4/5] relative">
            <div className="p-3 md:p-4 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex gap-1">
                  <div className="size-1.5 md:size-2 rounded-full bg-red-400" />
                  <div className="size-1.5 md:size-2 rounded-full bg-amber-400" />
                  <div className="size-1.5 md:size-2 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 md:size-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black text-red-500 tracking-widest uppercase font-mono">
                  بث مباشر
                </span>
              </div>
            </div>

            <div className="flex-1 relative bg-[#0a0a0c] overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                  backgroundSize: "100% 2px, 3px 100%",
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-10" />

              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="gen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-6 relative z-20"
                  >
                    <div className="size-12 md:size-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                      جاري توليد الفيديو...
                    </p>
                  </motion.div>
                ) : resultVideoUrl ? (
                  <motion.video
                    key="video"
                    src={resultVideoUrl}
                    className="size-full object-contain relative z-10"
                    controls
                    autoPlay
                    loop
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error("[VideoGen] Video Playback Error:", e);
                      toast.error(
                        "حدث خطأ أثناء تشغيل الفيديو. قد يكون الرابط غير صالح.",
                      );
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 opacity-20 relative z-20">
                    <VideoIcon className="size-12 md:size-16 text-white" />
                    <p className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">
                      في انتظار الأمر
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 md:p-5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[8px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">
                  الحالة: جاهز
                </p>
                <p className="text-[8px] md:text-[9px] font-black text-zinc-300 uppercase tracking-widest font-mono">
                  محرك أوركيدة
                </p>
              </div>
              {resultVideoUrl && (
                <button
                  onClick={() =>
                    handleDownload(resultVideoUrl, `studio-${Date.now()}.mp4`)
                  }
                  className="px-4 md:px-6 py-2 bg-zinc-900 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                >
                  تحميل
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 md:mt-8 bg-primary/5 border border-primary/10 rounded-3xl p-4 md:p-6 flex gap-3 md:gap-4 items-start">
            <div className="size-8 md:size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Info className="size-4 md:size-5" />
            </div>
            <p
              className="text-[10px] md:text-xs font-bold text-zinc-500 leading-relaxed"
              dir="rtl"
            >
              للحصول على نتائج احترافية، استخدم وصفاً مفصلاً يشمل حركة الكاميرا
              (مثلاً: Zoom Slow) ونوع الإضاءة (مثلاً: Cinematic lighting).
            </p>
          </div>
        </div>

        {/* Configuration Panel - Second on Mobile */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8 order-2 lg:order-1">
          <div className="bg-white border border-zinc-200 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative group">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <Terminal className="size-5 text-primary" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight">
                  إعدادات المشهد
                </h2>
              </div>
              <button
                onClick={() => setPrompt("")}
                className="text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors"
              >
                تصفير
              </button>
            </div>

            <div className="mb-8 md:mb-10">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 block">
                محرك الإنتاج
              </label>
              <div className="flex p-1.5 bg-zinc-50 rounded-2xl border border-zinc-200 gap-2">
                {[
                  { id: "Veo", name: "Google Veo" },
                  { id: "Grok", name: "xAI Grok" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`flex-1 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${provider === p.id ? "bg-white shadow-xl text-zinc-900 ring-1 ring-zinc-200" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <textarea
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl md:rounded-3xl p-5 md:p-6 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[140px] md:min-h-[160px] resize-none leading-relaxed placeholder:text-zinc-400"
                placeholder="صف المشهد الذي تريد تخيله..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">
                  أبعاد الكاميرا
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "Landscape (16:9)", icon: Monitor, label: "عريض" },
                    {
                      id: "Portrait (9:16)",
                      icon: Smartphone,
                      label: "عمودي",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setOrientation(item.id)}
                      className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl border transition-all ${orientation === item.id ? "bg-primary/5 border-primary/20 text-zinc-900" : "bg-zinc-50 border-zinc-200 text-zinc-400"}`}
                    >
                      <item.icon className="size-4 md:size-5 mb-2 opacity-50" />
                      <span className="text-[10px] font-black uppercase">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">
                    الدقة
                  </label>
                  <div className="flex p-1 bg-zinc-50 rounded-xl border border-zinc-200 gap-1">
                    {["High 720p", "Full 1080p"].map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase ${resolution === res ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400"}`}
                      >
                        {res.split(" ")[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {provider === "Grok" && (
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">
                      عدد النتائج
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => setNumResults(n)}
                          className={`size-9 md:size-10 rounded-xl border text-[10px] md:text-xs font-black transition-all ${numResults === n ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-zinc-900"}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {provider === "Grok" && (
              <div className="mb-8 p-5 md:p-6 bg-zinc-50 rounded-2xl md:rounded-3xl border border-zinc-100">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 block">
                  وضع الإنتاج
                </label>
                <div className="flex gap-3 md:gap-4">
                  {[
                    { id: "normal", name: "عادي" },
                    { id: "dynamic", name: "ديناميكي" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setGrokMode(m.id)}
                      className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all border ${grokMode === m.id ? "bg-white border-zinc-200 text-zinc-900 shadow-sm" : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-600"}`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {provider === "Veo" && (
              <div className="grid grid-cols-2 gap-4 pt-6 md:pt-8 border-t border-zinc-100">
                {[
                  {
                    label: "البداية",
                    file: firstImage,
                    ref: firstImageRef,
                    set: setFirstImage,
                    url: firstImageUrl,
                  },
                  {
                    label: "النهاية",
                    file: lastImage,
                    ref: lastImageRef,
                    set: setLastImage,
                    url: lastImageUrl,
                  },
                ].map((img, i) => (
                  <div
                    key={i}
                    onClick={() => img.ref.current?.click()}
                    className="aspect-video bg-zinc-50 border border-dashed border-zinc-200 rounded-xl md:rounded-2xl flex flex-col items-center justify-center cursor-pointer group hover:bg-zinc-100 transition-all overflow-hidden relative"
                  >
                    <input
                      type="file"
                      ref={img.ref}
                      className="hidden"
                      onChange={(e) => img.set(e.target.files?.[0] || null)}
                    />
                    {img.file ? (
                      <img src={img.url!} className="size-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="size-5 md:size-6 text-zinc-300 mb-1.5 md:mb-2 mx-auto" />
                        <span className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {img.label}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {provider === "Grok" && (
              <div className="pt-6 md:pt-8 border-t border-zinc-100">
                <div
                  onClick={() => grokImageRef.current?.click()}
                  className="aspect-video bg-zinc-50 border border-dashed border-zinc-200 rounded-xl md:rounded-2xl flex flex-col items-center justify-center cursor-pointer group hover:bg-zinc-100 transition-all overflow-hidden relative"
                >
                  <input
                    type="file"
                    ref={grokImageRef}
                    className="hidden"
                    onChange={(e) => setGrokImage(e.target.files?.[0] || null)}
                  />
                  {grokImage ? (
                    <img
                      src={grokImageUrl!}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="size-5 md:size-6 text-zinc-300 mb-1.5 md:mb-2 mx-auto" />
                      <span className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        أضف صورة مرجعية
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="size-10 md:size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Zap className="size-5 md:size-6" />
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase">
                  تكلفة الإنتاج
                </p>
                <p className="text-lg md:text-xl font-black text-zinc-900">
                  {cost} نقطة
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-primary/20 transition-all disabled:opacity-30"
            >
              {isGenerating ? "جاري التوليد..." : "توليد الفيديو"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
