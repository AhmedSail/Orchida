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
  Layers,
} from "lucide-react";
import { generateImageAction } from "@/app/actions/ai-image";
import { enhancePromptAction } from "@/app/actions/ai-common";
import { toast } from "sonner";

interface FreeImageViewProps {
  pricingRules: any[];
  onGenerateStart: () => void;
  onGenerateEnd: () => void;
  startPolling: (uuid: string) => void;
  setResultUrl: (url: string | null) => void;
}

export default function FreeImageView({ 
  pricingRules, 
  onGenerateStart, 
  onGenerateEnd, 
  startPolling, 
  setResultUrl 
}: FreeImageViewProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [orientation, setOrientation] = useState("Square (1:1)");
  const [resolution, setResolution] = useState("1K (HD)");
  const [numResults, setNumResults] = useState(1);
  const [refImage1, setRefImage1] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    const freeProviders = pricingRules.filter((r: any) => r.serviceType === "image" && r.credits === 0);
    if (freeProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(freeProviders[0].provider);
    }
  }, [pricingRules, selectedProvider]);

  useEffect(() => {
    if (!selectedProvider) return;
    const firstFreeQuality = pricingRules.find(
      (r: any) => r.serviceType === "image" && r.provider.toLowerCase() === selectedProvider.toLowerCase() && r.credits === 0
    )?.quality;
    if (firstFreeQuality) setResolution(firstFreeQuality);
  }, [selectedProvider, pricingRules]);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await enhancePromptAction(prompt, "image");
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
      const data: any = {
        prompt,
        provider: selectedProvider,
        model: selectedProvider === "Grok" ? "Grok" : selectedProvider === "Imagen" ? "nano-banana-pro" : selectedProvider === "Meta AI" ? "meta-ai-image" : "nano-banana-pro",
        aspect_ratio: (selectedProvider === "Grok" || selectedProvider === "Meta AI")
            ? orientation.includes("16:9") ? "16:9" : orientation.includes("9:16") ? "9:16" : orientation.includes("2:3") ? "2:3" : orientation.includes("3:2") ? "3:2" : "1:1"
            : (orientation.includes("16:9") ? "16:9" : orientation.includes("9:16") ? "9:16" : orientation.includes("3:4") ? "3:4" : orientation.includes("4:3") ? "4:3" : "1:1"),
        cost: 0,
        numResults: numResults,
        orientation: orientation,
        output_format: selectedProvider === "Imagen" ? outputFormat : "jpeg",
        resolution: (selectedProvider === "Grok" || selectedProvider === "Meta AI") ? "" : (resolution === "1K (HD)" ? "1K" : resolution),
      };

      // FormData is more reliable for files according to the docs
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        formData.append(key, val as any);
      });
      if (refImage1) {
        formData.append("files", refImage1);
      }

      // If no file, we can use base64 for the whole object to match our current server action logic
      const body = refImage1 ? formData : btoa(unescape(encodeURIComponent(JSON.stringify(data))));

      const res = await generateImageAction(body);
      if (res.success) {
        const d = res.data;
        const immediateUrl = d.image_url || d.url || d.data?.[0]?.url || d.generate_result;
        
        if (immediateUrl && typeof immediateUrl === "string") {
          setResultUrl(immediateUrl);
          onGenerateEnd();
          toast.success("اكتمل الإبداع! 🎨");
        } else if (d.uuid || d.id || d.data?.uuid) {
          startPolling(d.uuid || d.id || d.data?.uuid);
        } else {
          toast.error("لم يتم العثور على معرف للمهمة");
          onGenerateEnd();
        }
      } else {
        toast.error(res.error || "فشل التوليد");
        onGenerateEnd();
      }
    } catch (e) {
      toast.error("حدث خطأ تقني");
      onGenerateEnd();
    }
  };

  const providers = Array.from(new Set(pricingRules.filter((r: any) => r.serviceType === "image" && r.credits === 0).map((r: any) => r.provider)));

  // Limit logic: 
  // 1. Meta AI is capped at 4 results according to documentation.
  // 2. If reference exists and provider is NOT Meta AI, limit to 2 results.
  const maxResults = selectedProvider === "Meta AI" ? 4 : (refImage1 ? 2 : 6);

  useEffect(() => {
    if (numResults > maxResults) {
      setNumResults(maxResults);
    }
  }, [refImage1, selectedProvider, maxResults, numResults]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">اختر المزود</label>
        {providers.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {providers.map((p: any) => (
              <button key={p} onClick={() => {
                setSelectedProvider(p);
                if (p === "Imagen") setOrientation("Square (1:1)");
                else setOrientation("Landscape (16:9)");
              }} className={`flex-1 min-w-[100px] py-3 rounded-2xl border font-black text-xs transition-all ${selectedProvider.toLowerCase() === p.toLowerCase() ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-zinc-100"}`}>
                {p === "Imagen" ? "G Imagen" : p === "Grok" ? "xAI Grok" : p === "Veo" ? "Google Veo" : p}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 text-xs font-bold text-center">
            عذراً، لا توجد خدمات صور مجانية متاحة حالياً.
          </div>
        )}
      </div>


      <div className="space-y-3">
        <div className="flex justify-between items-center mr-1">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">وصف الصورة (Prompt)</label>
          <button onClick={handleEnhance} className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-primary/10 transition-colors">
            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} تحسين الوصف ذكياً ✨
          </button>
        </div>
        <textarea 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder={selectedProvider === "Grok" ? "وصف الصورة التي تريد توليدها باستخدام Grok..." : "صف الصورة التي تريد إنشاؤها بالتفصيل..."} 
          className="w-full bg-zinc-50 border border-zinc-100 rounded-4xl p-6 text-sm min-h-[140px] outline-none transition-all placeholder:text-zinc-300" 
        />
      </div>

      {/* Number of Results (Only for Meta & Grok) */}
      {(selectedProvider === "Meta AI" || selectedProvider === "Grok") && (
        <div className="space-y-3">
          <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">عدد الصور (Number of Results)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].filter(n => n <= maxResults).map((num) => (
              <button
                key={num}
                onClick={() => setNumResults(num)}
                className={`w-10 h-10 rounded-xl font-black text-xs border transition-all ${numResults === num ? "bg-primary border-primary text-white" : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-zinc-100"}`}
              >
                {num}
              </button>
            ))}
          </div>
          {selectedProvider === "Meta AI" && (
            <p className="text-[9px] font-bold text-blue-500 pr-1 italic">Meta AI يدعم حتى 4 صور كحد أقصى.</p>
          )}
          {maxResults === 2 && refImage1 && selectedProvider !== "Meta AI" && (
            <p className="text-[9px] font-bold text-amber-500 pr-1 italic">محدود بـ 2 عند استخدام صورة مرجعية.</p>
          )}
          <p className="text-[10px] font-bold text-zinc-400 pr-1 italic">سيتم توليد مصفوفة من {numResults} صور.</p>
        </div>
      )}

      {/* Aspect Ratio Buttons / Orientation */}
      <div className="space-y-3">
        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">
          {selectedProvider === "Imagen" ? "أبعاد الصورة (Aspect Ratio)" : "الاتجاه (Orientation)"}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Default options */}
          {(selectedProvider === "Meta AI" || selectedProvider === "Grok") ? (
            <>
              {[
                { label: "أفقي (16:9)", value: "Landscape (16:9)", icon: <Monitor className="w-4 h-4" /> },
                { label: "عمودي (9:16)", value: "Portrait (9:16)", icon: <Smartphone className="w-4 h-4" /> },
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
            </>
          ) : (
            <>
              {[
                { label: "مربع (1:1)", value: "Square (1:1)", icon: <Square className="w-4 h-4" /> },
                { label: "أفقي (16:9)", value: "Landscape (16:9)", icon: <Monitor className="w-4 h-4" /> },
                { label: "عمودي (9:16)", value: "Portrait (9:16)", icon: <Smartphone className="w-4 h-4" /> },
                { label: "3:4", value: "Portrait (3:4)", icon: <Smartphone className="w-4 h-4 scale-x-125" /> },
                { label: "4:3", value: "Landscape (4:3)", icon: <Monitor className="w-4 h-4 scale-y-125" /> },
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
            </>
          )}
        </div>
      </div>

      {/* Config Grid (Resolution & Format) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-zinc-400 px-1">الدقة</label>
          <div className="relative group">
            <select 
              value={resolution} 
              onChange={(e) => setResolution(e.target.value)} 
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none appearance-none cursor-pointer"
            >
              {Array.from(new Set(pricingRules.filter((r: any) => r.serviceType === "image" && r.provider.toLowerCase() === selectedProvider.toLowerCase() && r.credits === 0).map((r: any) => r.quality))).map((q: any) => (
                <option key={q} value={q}>{q} (مجاني)</option>
              ))}
              {pricingRules.filter((r: any) => r.serviceType === "image" && r.provider.toLowerCase() === selectedProvider.toLowerCase() && r.credits === 0).length === 0 && (
                <>
                  <option>1K (HD)</option>
                  <option>Standard</option>
                </>
              )}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        {/* File Format (Only for Imagen) */}
        {selectedProvider === "Imagen" && (
          <div className="space-y-2">
            <label className="text-[11px] font-black text-zinc-400 px-1">صيغة الملف</label>
            <div className="relative group">
              <select 
                value={outputFormat} 
                onChange={(e) => setOutputFormat(e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none appearance-none cursor-pointer"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <Layers className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-zinc-400 px-1">مرجع الصورة (Image Reference)</label>
        <label className="aspect-video bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group">
          {refImage1 ? <img src={URL.createObjectURL(refImage1)} className="w-full h-full object-cover" /> : <div className="text-center"><Plus className="text-zinc-300 w-6 h-6 mx-auto mb-1" /><span className="text-[10px] font-bold text-zinc-400">اختر صورة مرجعية</span></div>}
          <input type="file" className="hidden" onChange={(e) => setRefImage1(e.target.files?.[0] || null)} />
        </label>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={providers.length === 0}
        className="w-full py-6 bg-primary text-white rounded-3xl font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
      >
        توليد صورة (0 كريديت) <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
}
