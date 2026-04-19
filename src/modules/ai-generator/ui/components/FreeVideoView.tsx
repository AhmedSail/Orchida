"use client";

import React, { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  Square,
  Loader2,
  Zap,
  Plus,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";
import { generateVideoAction } from "@/app/actions/ai-video";
import { enhancePromptAction } from "@/app/actions/ai-common";
import { toast } from "sonner";

interface FreeVideoViewProps {
  pricingRules: any[];
  onGenerateStart: () => void;
  onGenerateEnd: () => void;
  startPolling: (uuid: string) => void;
  setResultUrl: (url: string | null) => void;
}

export default function FreeVideoView({ 
  pricingRules, 
  onGenerateStart, 
  onGenerateEnd, 
  startPolling, 
  setResultUrl 
}: FreeVideoViewProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [orientation, setOrientation] = useState("Landscape (16:9)");
  const [resolution, setResolution] = useState("High 720p");
  const [duration, setDuration] = useState("6");
  const [refImage1, setRefImage1] = useState<File | null>(null);
  const [refImage2, setRefImage2] = useState<File | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    const freeProviders = pricingRules.filter((r: any) => r.serviceType === "video" && r.credits === 0);
    if (freeProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(freeProviders[0].provider);
    }
  }, [pricingRules, selectedProvider]);

  useEffect(() => {
    if (!selectedProvider) return;
    const firstFreeRes = pricingRules.find(
      (r: any) =>
        r.serviceType === "video" &&
        r.provider.toLowerCase() === selectedProvider.toLowerCase() &&
        r.credits === 0
    );
    if (firstFreeRes) setResolution(firstFreeRes.quality);

    const firstFreeDur = pricingRules.find(
      (r: any) =>
        r.serviceType === "video" &&
        r.provider.toLowerCase() === selectedProvider.toLowerCase() &&
        r.credits === 0 &&
        r.duration > 0
    );
    if (firstFreeDur) setDuration(firstFreeDur.duration.toString());
  }, [selectedProvider, pricingRules]);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await enhancePromptAction(prompt, "video");
      if (res.success && res.enhancedPrompt) {
        setPrompt(res.enhancedPrompt);
        toast.success("تم تحسين الوصف ✨");
      }
    } catch (e) {
      toast.error("فشل تحسين الوصف");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return toast.error("يرجى كتابة وصف أولاً");
    onGenerateStart();
    try {
      const fd = new FormData();
      fd.append("provider", selectedProvider);
      fd.append("model", selectedProvider === "Veo" ? "veo-3.1-fast" : "grok-3");
      fd.append("prompt", prompt);
      fd.append("duration", duration);
      fd.append("resolution", resolution);
      fd.append("aspectRatio", orientation);
      fd.append("cost", "0");
      fd.append("mode", "normal");

      if (selectedProvider === "Grok") {
        if (refImage1) fd.append("image", refImage1);
      } else if (selectedProvider === "Veo") {
        if (refImage1) fd.append("firstImage", refImage1);
        if (refImage2) fd.append("lastImage", refImage2);
      }

      const res = await generateVideoAction(fd);
      if (res.success && (res.data?.uuid || res.data?.id || res.data?.data?.uuid)) {
        startPolling(res.data.uuid || res.data.id || res.data?.data?.uuid);
      } else {
        toast.error(res.error || "فشل بدء التوليد");
        onGenerateEnd();
      }
    } catch (e) {
      toast.error("حدث خطأ تقني");
      onGenerateEnd();
    }
  };

  const providers = Array.from(new Set(pricingRules
    .filter((r: any) => r.serviceType === "video" && r.credits === 0)
    .map((r: any) => r.provider)
  ));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Provider Selection */}
      <div className="space-y-3">
        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">اختر المزود</label>
        {providers.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {providers.map((p: any) => (
              <button
                key={p}
                onClick={() => setSelectedProvider(p)}
                className={`flex-1 min-w-[100px] py-3 rounded-2xl border font-black text-xs transition-all ${selectedProvider.toLowerCase() === p.toLowerCase() ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-zinc-100"}`}
              >
                {p === "Grok" ? "xAI Grok" : p === "Veo" ? "Google Veo" : p}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 text-xs font-bold text-center">
            عذراً، لا توجد خدمات فيديو مجانية متاحة حالياً.
          </div>
        )}
      </div>

      {/* Prompt Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center mr-1">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">وصف المشهد</label>
          <button onClick={handleEnhance} disabled={isEnhancing || !prompt} className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} تحسين سحري
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`صف الفيديو باستخدام ${selectedProvider}...`}
          className="w-full bg-zinc-50 border border-zinc-100 rounded-4xl p-6 text-sm min-h-[140px] outline-none transition-all"
        />
      </div>

      {/* Aspect Ratio Buttons */}
      <div className="space-y-3">
        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">أبعاد الفيديو (Aspect Ratio)</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "مربع (1:1)", value: "Square (1:1)", icon: <Square className="w-4 h-4" /> },
            { label: "عمودي (9:16)", value: "Portrait (9:16)", icon: <Smartphone className="w-4 h-4" /> },
            { label: "أفقي (16:9)", value: "Landscape (16:9)", icon: <Monitor className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setOrientation(item.value)}
              className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${orientation === item.value ? "border-primary bg-primary/5 text-primary" : "border-zinc-50 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200"}`}
            >
              <div className="mb-2 opacity-80">{item.icon}</div>
              <span className="text-[10px] font-black">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Config Grid (Resolution & Duration) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-zinc-400 px-1">الدقة</label>
          <div className="relative group">
            <select 
              value={resolution} 
              onChange={(e) => setResolution(e.target.value)} 
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none appearance-none cursor-pointer"
            >
              {Array.from(new Set(pricingRules.filter((r: any) => r.serviceType === "video" && r.provider.toLowerCase() === selectedProvider.toLowerCase() && r.credits === 0).map((r: any) => r.quality))).map((q: any) => (
                <option key={q} value={q}>{q} (مجاني)</option>
              ))}
              {pricingRules.filter((r: any) => r.provider.toLowerCase() === selectedProvider.toLowerCase() && r.credits === 0).length === 0 && <option>High 720p</option>}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-zinc-400 px-1">المدة</label>
          <div className="relative group">
            <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none appearance-none cursor-pointer"
            >
              {Array.from(new Set(pricingRules.filter((r: any) => r.serviceType === "video" && r.provider.toLowerCase() === selectedProvider.toLowerCase() && r.credits === 0 && r.duration > 0).map((r: any) => r.duration))).map((d: any) => (
                <option key={d} value={d}>{d} ثوانٍ (مجاني)</option>
              ))}
              {pricingRules.filter((r: any) => r.serviceType === "video" && r.provider.toLowerCase() === selectedProvider.toLowerCase() && r.credits === 0 && r.duration > 0).length === 0 && <option value="6">6 ثوانٍ</option>}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* References */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-zinc-400 px-1">{selectedProvider === "Veo" ? "صور البداية والنهاية (اختياري)" : "صورة مرجعية (اختياري)"}</label>
        <div className="grid grid-cols-2 gap-4">
          <label className="aspect-video bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
            {refImage1 ? <img src={URL.createObjectURL(refImage1)} className="w-full h-full object-cover" /> : <div className="text-center"><Plus className="text-zinc-300 w-6 h-6 mx-auto mb-1" /><span className="text-[10px] font-bold text-zinc-400">{selectedProvider === "Veo" ? "البداية" : "اختر صورة"}</span></div>}
            <input type="file" className="hidden" onChange={(e) => setRefImage1(e.target.files?.[0] || null)} />
          </label>
          {selectedProvider === "Veo" && (
            <label className="aspect-video bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
              {refImage2 ? <img src={URL.createObjectURL(refImage2)} className="w-full h-full object-cover" /> : <div className="text-center"><Plus className="text-zinc-300 w-6 h-6 mx-auto mb-1" /><span className="text-[10px] font-bold text-zinc-400">النهاية</span></div>}
              <input type="file" className="hidden" onChange={(e) => setRefImage2(e.target.files?.[0] || null)} />
            </label>
          )}
        </div>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={providers.length === 0}
        className="w-full py-6 bg-primary text-white rounded-3xl font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
      >
        إطلاق الإبداع (0 كريديت) <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
}
