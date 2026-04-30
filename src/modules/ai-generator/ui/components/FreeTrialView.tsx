"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  Zap,
  History,
  MessageSquare,
  ArrowRightLeft,
} from "lucide-react";
import {
  checkGenerationStatus,
  updateGenerationStatusAction,
  getInternalStatusAction,
} from "@/app/actions/ai-common";
import { getAllAiPricingAction } from "@/app/actions/ai-pricing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// استدعاء المكونات المنفصلة
import FreeVideoView from "./FreeVideoView";
import FreeImageView from "./FreeImageView";

interface FreeTrialViewProps {
  userBalance?: number | null;
}

export default function FreeTrialView({ userBalance }: FreeTrialViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"video" | "image">("video");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getAllAiPricingAction().then((rules) => {
      if (rules) setPricingRules(rules);
    });
  }, []);

  if (!isMounted) return null;

  const startPolling = (uuid: string) => {
    let attempts = 0;
    const intervalId = setInterval(async () => {
      attempts++;
      try {
        const statusRes = await checkGenerationStatus(uuid);
        if (!statusRes.success) return;

        const rawStatus =
          statusRes.data.status !== undefined
            ? statusRes.data.status
            : statusRes.data.order_status;
        const status = String(rawStatus).toLowerCase();

        // 1. Success Logic
        if (
          rawStatus === 2 ||
          status === "2" ||
          status === "completed" ||
          status === "success" ||
          status === "succeeded" ||
          status === "finished"
        ) {
          clearInterval(intervalId);
          setIsGenerating(false);
          setProgress(100);

          const foundUrls: string[] = [];
          const d = statusRes.data;

          if (d.image_url) foundUrls.push(d.image_url);
          else if (d.url) foundUrls.push(d.url);
          else if (d.generate_result) foundUrls.push(d.generate_result);
          else if (d.video_url) foundUrls.push(d.video_url);

          if (d.data && Array.isArray(d.data)) {
            d.data.forEach((item: any) => {
              if (item.url) foundUrls.push(item.url);
              else if (item.image_url) foundUrls.push(item.image_url);
            });
          }
          if (d.generated_image && Array.isArray(d.generated_image)) {
            d.generated_image.forEach((item: any) => {
              if (item.image_url) foundUrls.push(item.image_url);
              else if (item.url) foundUrls.push(item.url);
            });
          }
          if (d.generated_video && Array.isArray(d.generated_video)) {
            d.generated_video.forEach((item: any) => {
              if (item.video_url) foundUrls.push(item.video_url);
              else if (item.url) foundUrls.push(item.url);
            });
          }

          if (foundUrls.length > 0) {
            setResultUrls(foundUrls);
            updateGenerationStatusAction(
              uuid,
              "completed",
              foundUrls[0],
              undefined,
              JSON.stringify(foundUrls),
            );
            toast.success("اكتمل الإبداع! 🎨");
          } else {
            const fallbackUrl =
              d.data?.url ||
              d.data?.video_url ||
              (typeof d.data === "string" ? d.data : null);
            if (fallbackUrl) {
              setResultUrls([fallbackUrl]);
              toast.success("اكتمل الإبداع! 🎨");
            } else {
              toast.error("اكتمل التوليد ولكن لم نجد الرابط.");
            }
          }
          return;
        } else if (
          rawStatus === 3 ||
          status === "failed" ||
          status === "error" ||
          status === "4"
        ) {
          clearInterval(intervalId);
          setIsGenerating(false);
          toast.error("عذراً، فشلت عملية التوليد");
          updateGenerationStatusAction(uuid, "failed");
          return;
        }

        if (attempts >= 120) {
          clearInterval(intervalId);
          setIsGenerating(false);
          toast.error("استغرق التوليد وقتاً طويلاً جداً");
        }

        setProgress((p) => Math.min(p + 1.5, 98));
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8" dir="rtl">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="flex justify-center pt-2 pb-6">
          <div className="flex bg-white shadow-sm border border-zinc-100 rounded-2xl p-2 gap-2 overflow-x-auto max-w-full">
            <button
              onClick={() => router.push("/ai")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition hover:bg-zinc-50`}
            >
              <ArrowRightLeft className={`w-6 h-6 mb-2 text-zinc-400`} />
              <span className={`text-xs font-semibold text-zinc-600`}>
                الرئيسية
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("video");
                setResultUrls([]);
              }}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition ${activeTab === "video" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <Video
                className={`w-6 h-6 mb-2 ${activeTab === "video" ? "text-primary" : "text-zinc-400"}`}
              />
              <span
                className={`text-xs font-semibold ${activeTab === "video" ? "text-primary" : "text-zinc-600"}`}
              >
                فيديو مجاني
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("image");
                setResultUrls([]);
              }}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition ${activeTab === "image" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <ImageIcon
                className={`w-6 h-6 mb-2 ${activeTab === "image" ? "text-primary" : "text-zinc-400"}`}
              />
              <span
                className={`text-xs font-semibold ${activeTab === "image" ? "text-primary" : "text-zinc-600"}`}
              >
                صور مجانية
              </span>
            </button>
            <button
              onClick={() => router.push("/ai/pro?mode=chat")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition hover:bg-zinc-50`}
            >
              <MessageSquare className={`w-6 h-6 mb-2 text-zinc-400`} />
              <span className={`text-xs font-semibold text-zinc-600`}>
                المحادثة
              </span>
            </button>
            <button
              onClick={() => router.push("/ai/pro?mode=history")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition hover:bg-zinc-50`}
            >
              <History className={`w-6 h-6 mb-2 text-zinc-400`} />
              <span className={`text-xs font-semibold text-zinc-600`}>
                السجل
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Unified Control Form */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-2xl shadow-zinc-200/50">
          <div className="flex items-center gap-4 border-b border-zinc-50 pb-6 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900">
                استوديو التجربة الموحد
              </h3>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                AI FREE ENGINE • 0 CREDITS
              </p>
            </div>
          </div>

          {activeTab === "video" ? (
            <FreeVideoView
              pricingRules={pricingRules}
              onGenerateStart={() => {
                setIsGenerating(true);
                setResultUrls([]);
                setProgress(5);
              }}
              onGenerateEnd={() => setIsGenerating(false)}
              startPolling={startPolling}
              setResultUrl={(url: string | null) =>
                setResultUrls(url ? [url] : [])
              }
            />
          ) : (
            <FreeImageView
              pricingRules={pricingRules}
              onGenerateStart={() => {
                setIsGenerating(true);
                setResultUrls([]);
                setProgress(5);
              }}
              onGenerateEnd={() => setIsGenerating(false)}
              startPolling={startPolling}
              setResultUrl={(url: string | null) =>
                setResultUrls(url ? [url] : [])
              }
            />
          )}
        </div>

        {/* Dynamic Display Area */}
        <div className="lg:sticky lg:top-10">
          <div className="bg-zinc-900 rounded-[3rem] aspect-square lg:aspect-4/5 relative overflow-hidden flex flex-col items-center justify-center border-8 border-white shadow-2xl">
            <AnimatePresence mode="wait">
              {resultUrls.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full p-4 overflow-y-auto custom-scrollbar"
                >
                  {activeTab === "video" ? (
                    <video
                      src={resultUrls[0]}
                      controls
                      className="w-full h-full object-contain rounded-2xl"
                      autoPlay
                      loop
                    />
                  ) : (
                    <div
                      className={`grid gap-4 w-full h-full ${resultUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                    >
                      {resultUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-2xl overflow-hidden bg-zinc-800 border border-white/5"
                        >
                          <img
                            src={url}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            alt={`Generated result ${idx + 1}`}
                          />
                          <a
                            href={url}
                            download
                            target="_blank"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <div className="bg-white text-black p-3 rounded-full font-black text-[10px] scale-0 group-hover:scale-100 transition-transform">
                              عرض كامل
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 z-10">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              ) : (
                <div className="text-center px-10">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                    <Layers className="w-10 h-10 text-white/20" />
                  </div>
                  <h4 className="text-white text-2xl font-black mb-4">
                    شاشة العرض
                  </h4>
                  <p className="text-zinc-500 text-xs font-bold leading-relaxed">
                    بمجرد الضغط على إطلاق الإبداع، سيبدأ محركنا السحابي بمعالجة
                    وصفك وإظهاره هنا.
                  </p>
                </div>
              )}
            </AnimatePresence>

            {isGenerating && (
              <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-3xl flex flex-col items-center justify-center z-50 px-12">
                <div className="w-24 h-24 mb-10 relative">
                  <div className="absolute inset-0 border-8 border-white/5 rounded-full" />
                  <motion.div
                    className="absolute inset-0 border-8 border-primary rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
                <h4 className="text-white text-3xl font-black mb-2 animate-pulse">
                  جاري البناء..
                </h4>
                <div className="w-full max-w-[280px] h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                  <Clock className="w-3 h-3" /> Estimated time: ~60s
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black">جاهز للعمل</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black">توليد سحابي فوري</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
