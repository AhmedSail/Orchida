"use client";

import React, { useState, useEffect } from "react";
import { generateImageAction } from "@/app/actions/ai-image";
import {
  checkGenerationStatus,
  updateGenerationStatusAction,
  refundFailedTaskAction,
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

// Sub-components
import { ImageGenHeader } from "./image-gen/ImageGenHeader";
import { ImageGenProviders } from "./image-gen/ImageGenProviders";
import { ImageGenPrompt } from "./image-gen/ImageGenPrompt";
import { ImageGenSettings } from "./image-gen/ImageGenSettings";
import { ImageGenAction } from "./image-gen/ImageGenAction";
import { ImageGenResults } from "./image-gen/ImageGenResults";
import { ImageGenLightbox } from "./image-gen/ImageGenLightbox";
import { useSearchParams } from "next/navigation";
import { ImageIcon, Zap, Loader2 } from "lucide-react";

interface ImageGenViewProps {
  userBalance?: number | null;
}

export default function ImageGenView({
  userBalance: propBalance,
}: ImageGenViewProps) {
  const [userBalance, setUserBalance] = useState<number | null>(
    propBalance ?? null,
  );

  useEffect(() => {
    if (propBalance !== undefined) {
      setUserBalance(propBalance);
    }
  }, [propBalance]);
  const searchParams = useSearchParams();
  const [provider, setProvider] = useState("Imagen");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt));
    }
  }, [searchParams]);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputFormat, setOutputFormat] = useState("JPEG");
  const [resolution, setResolution] = useState("1K");
  const [numResults, setNumResults] = useState(1);
  const [imageReference, setImageReference] = useState<File | null>(null);
  const [orientation, setOrientation] = useState("Square (1:1)");
  const [model] = useState("nano-banana-pro");
  const [style] = useState("Photorealistic");

  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  // خريطة تحويل أسماء الواجهة إلى أسماء قاعدة البيانات
  const PROVIDER_DB_MAP: Record<string, string> = {
    Imagen: "Banana Pro",
    Grok: "Grok",
    "Meta AI": "Meta AI",
  };

  const cost = (() => {
    const dbProvider = PROVIDER_DB_MAP[provider] || provider;

    const checkQuality = (q: string) => {
      if (q === "1K") return ["1K", "720p", "HD"];
      if (q === "2K") return ["2K", "1080p", "Full HD"];
      if (q === "4K") return ["4K", "Ultra HD"];
      return [q];
    };

    const targetQualities = checkQuality(resolution);

    const match = pricingRules.find(
      (r) =>
        r.serviceType === "image" &&
        r.provider.toLowerCase() === dbProvider.toLowerCase() &&
        targetQualities.some(
          (tq) => tq.toLowerCase() === r.quality.toLowerCase(),
        ),
    );

    const baseCredits = match ? match.credits : 3;

    // للـ Grok وMeta AI: سعر الصورة الواحدة × عدد الصور المطلوبة
    const multiplier =
      provider === "Grok" || provider === "Meta AI" ? numResults : 1;

    return baseCredits * multiplier;
  })();

  // States for generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [resultImageUrls, setResultImageUrls] = useState<string[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number>(0);

  // Auth & Balance
  const { data: session } = authClient.useSession();

  // Helpers
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const base64ToFile = (base64: string, filename: string): File => {
    try {
      const arr = base64.split(",");
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.error("Base64 to File error:", e);
      return null as any;
    }
  };

  useEffect(() => {
    getStudentInternalCredits().then((res) => {
      if (res.success && res.balance !== undefined) setUserBalance(res.balance);
    });

    getAllAiPricingAction().then((rules) => {
      if (rules) setPricingRules(rules as PricingRule[]);
    });

    const savedState = localStorage.getItem("ai_image_state");
    const pendingGen = localStorage.getItem("pending_image_gen");

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.prompt) setPrompt(parsed.prompt);
        if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
        if (parsed.outputFormat) setOutputFormat(parsed.outputFormat);
        if (parsed.orientation) setOrientation(parsed.orientation);
        if (parsed.imageBase64) {
          setImageReference(
            base64ToFile(parsed.imageBase64, parsed.imageName || "ref.png"),
          );
        }
      } catch (e) {
        console.error("Error loading image state:", e);
      }
    }

    if (pendingGen) {
      setIsGenerating(true);
      startPolling(pendingGen);
    }
  }, []);

  useEffect(() => {
    const saveState = async () => {
      const state: any = {
        provider,
        prompt,
        aspectRatio,
        outputFormat,
        resolution,
        numResults,
        orientation,
      };
      if (imageReference) {
        state.imageBase64 = await fileToBase64(imageReference);
        state.imageName = imageReference.name;
      }
      localStorage.setItem("ai_image_state", JSON.stringify(state));
    };
    saveState();
  }, [
    provider,
    prompt,
    aspectRatio,
    outputFormat,
    resolution,
    numResults,
    orientation,
    imageReference,
  ]);

  const handleClearAll = () => {
    setPrompt("");
    setImageReference(null);
    setResultImageUrls([]);
    setGenerationError(null);
    const fileInput = document.getElementById(
      "image-ref-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "تم مسح جميع الحقول 🧹",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await enhancePromptAction(prompt, "image");
      if (res.success && res.enhancedPrompt) {
        setPrompt(res.enhancedPrompt);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "تم تحسين الوصف بنجاح ✨",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (e) {
      console.error("Enhancement error", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!session) {
      Swal.fire({
        title: "يجب تسجيل الدخول",
        text: "يرجى تسجيل الدخول لتتمكن من استخدام خدمات الذكاء الاصطناعي",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إلغاء",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const callbackUrl = encodeURIComponent(window.location.href);
          window.location.href = `/sign-in?callbackUrl=${callbackUrl}`;
        }
      });
      return;
    }

    if (!prompt.trim()) {
      setGenerationError("يرجى إدخال وصف للصورة");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setResultImageUrls([]);

    try {
      const data: any = {
        prompt,
        model:
          provider === "Imagen"
            ? model
            : provider === "Meta AI"
              ? "meta-ai-image"
              : "Grok",
        aspectRatio:
          provider === "Grok" || provider === "Meta AI"
            ? orientation.includes("16:9")
              ? "16:9"
              : orientation.includes("9:16")
                ? "9:16"
                : orientation.includes("2:3")
                  ? "2:3"
                  : orientation.includes("3:2")
                    ? "3:2"
                    : "1:1"
            : aspectRatio,
        orientation,
        outputFormat,
        numResults:
          provider === "Grok" || provider === "Meta AI" ? numResults : 1,
        cost,
        provider,
        style,
        resolution:
          provider === "Grok" || provider === "Meta AI" ? "" : resolution,
      };

      if (imageReference) {
        const base64 = await fileToBase64(imageReference);
        data.imageReference = base64.split(",")[1];
      }

      const encodedData = Buffer.from(JSON.stringify(data)).toString("base64");
      const res = await generateImageAction(encodedData);

      if (res.success) {
        const uuid = res.data.uuid || res.data.id;
        if (uuid) {
          localStorage.setItem("pending_image_gen", uuid);
          window.dispatchEvent(new CustomEvent("balanceUpdated"));
          startPolling(uuid);
        } else {
          const imgUrl =
            res.data.image_url ||
            res.data.url ||
            (res.data.data && res.data.data[0]?.url);
          if (imgUrl) {
            setResultImageUrls([imgUrl]);
            setIsGenerating(false);
          } else {
            setGenerationError("لم يتم استلام معرف للمهمة أو رابط مباشر.");
            setIsGenerating(false);
          }
        }
        getStudentInternalCredits().then((cr) => {
          if (cr.success) setUserBalance(cr.balance ?? userBalance);
        });
      } else {
        setGenerationError(res.error || "فشل بدء المهمة");
        setIsGenerating(false);
      }
    } catch (err: any) {
      setGenerationError(err.message || "حدث خطأ غير متوقع");
      setIsGenerating(false);
    }
  };

  const startPolling = (uuid: string) => {
    const intervalId = setInterval(async () => {
      try {
        const statusRes = await checkGenerationStatus(uuid);
        if (!statusRes.success) return;

        // Handle both flat and nested GeminiGen responses
        const taskData = statusRes.data?.data || statusRes.data;
        const status = taskData?.status;

        if (status === 2 || String(status).toLowerCase() === "completed") {
          clearInterval(intervalId);
          setIsGenerating(false);
          localStorage.removeItem("pending_image_gen");

          const foundUrls: string[] = [];
          if (taskData.image_url) foundUrls.push(taskData.image_url);
          else if (taskData.url) foundUrls.push(taskData.url);
          else if (taskData.data && Array.isArray(taskData.data)) {
            taskData.data.forEach((item: any) => {
              if (item.url) foundUrls.push(item.url);
            });
          } else if (
            taskData.generated_image &&
            Array.isArray(taskData.generated_image)
          ) {
            taskData.generated_image.forEach((item: any) => {
              if (item.image_url) foundUrls.push(item.image_url);
            });
          }

          if (foundUrls.length > 0) {
            // رفع للكلاود وعرض الروابط المحفوظة
            const saveResult: any = await updateGenerationStatusAction(
              uuid,
              "completed",
              foundUrls[0],
              undefined,
              JSON.stringify(foundUrls),
            );
            // استخدام روابط R2 إن توفرت
            if (saveResult.finalResultsJson) {
              try {
                const cloudUrls = JSON.parse(saveResult.finalResultsJson);
                if (Array.isArray(cloudUrls) && cloudUrls.length > 0) {
                  setResultImageUrls(cloudUrls);
                } else {
                  setResultImageUrls([saveResult.finalResultUrl || foundUrls[0]]);
                }
              } catch {
                setResultImageUrls([saveResult.finalResultUrl || foundUrls[0]]);
              }
            } else {
              setResultImageUrls([saveResult.finalResultUrl || foundUrls[0]]);
            }
            window.dispatchEvent(new CustomEvent("balanceUpdated"));
          } else {
            setGenerationError(
              "اكتمل التوليد ولكن لم نجد الرابط في البيانات المستلمة.",
            );
          }
        } else if (status === 3 || String(status).toLowerCase() === "failed") {
          clearInterval(intervalId);
          setIsGenerating(false);
          localStorage.removeItem("pending_image_gen");

          let errorInfo =
            taskData.error ||
            taskData.message ||
            taskData.reason ||
            "مشكلة تقنية في الخادم المزود";
          if (typeof errorInfo === "object")
            errorInfo = errorInfo.message || JSON.stringify(errorInfo);

          setGenerationError(
            `فشل توليد الصورة: ${errorInfo}. تم استرجاع الـ ${cost} كريدت الخاصة بك.`,
          );
          updateGenerationStatusAction(uuid, "failed");
          refundFailedTaskAction(uuid, errorInfo).then(() => {
            getStudentInternalCredits().then((cr) => {
              if (cr.success) {
                setUserBalance(cr.balance ?? userBalance);
                window.dispatchEvent(new CustomEvent("balanceUpdated"));
              }
            });
          });
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 4000);
  };

  return (
    <div
      className="relative w-full max-w-7xl mx-auto pb-32 animate-in fade-in duration-1000"
      dir="rtl"
    >
      {/* Visual Header */}
      <div className="mb-12 text-center px-4">
        <h2 className="text-4xl font-black text-zinc-900 tracking-tight mb-3 italic">
          الصور
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-primary/20" />
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
            نظام الإنتاج الإبداعي
          </p>
          <div className="h-px w-8 bg-primary/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Settings Panel */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-60" />

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <ImageIcon className="size-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">مختبر الصور</h3>
              </div>
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors"
              >
                تفريغ الإعدادات
              </button>
            </div>

            <div className="space-y-10">
              {/* Provider Selector */}
              <ImageGenProviders
                provider={provider}
                setProvider={setProvider}
              />

              {/* Prompt Field */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    الموجه البصري
                  </label>
                  <button
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    className="text-[10px] font-black text-primary hover:text-primary/80 transition-all bg-primary/10 py-1.5 px-3 rounded-lg border border-primary/20 disabled:opacity-30"
                  >
                    {isEnhancing ? "تحسين..." : "تحسين الموجه آلياً ✨"}
                  </button>
                </div>
                <textarea
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-3xl p-6 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[140px] resize-none leading-relaxed placeholder:text-zinc-400"
                  placeholder="صف المشهد الذي تريد تخيله بالتفصيل..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Settings Grid */}
              <div className="bg-zinc-50/50 border border-zinc-200 rounded-3xl p-6">
                <ImageGenSettings
                  provider={provider}
                  imageReference={imageReference}
                  setImageReference={setImageReference}
                  numResults={numResults}
                  setNumResults={setNumResults}
                  aspectRatio={aspectRatio}
                  setAspectRatio={setAspectRatio}
                  orientation={orientation}
                  setOrientation={setOrientation}
                  outputFormat={outputFormat}
                  setOutputFormat={setOutputFormat}
                  resolution={resolution}
                  setResolution={setResolution}
                />
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 px-4">
              <div className="size-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Zap className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-0.5">
                  تكلفة التوليد
                </p>
                <p className="text-xl font-black text-zinc-900">
                  {cost} <span className="text-xs text-emerald-600">نقطة</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {isGenerating ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Zap className="size-5" />
              )}
              {isGenerating ? "جاري التوليد..." : "توليد الصورة"}
            </button>
          </div>
        </div>

        {/* Right: Results Canvas */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <ImageGenResults
              isGenerating={isGenerating}
              resultImageUrls={resultImageUrls}
              onOpenLightbox={(url, idx) => {
                setLightboxUrl(url);
                setLightboxIdx(idx);
              }}
            />
          </div>
        </div>
      </div>

      <ImageGenLightbox
        lightboxUrl={lightboxUrl}
        lightboxIdx={lightboxIdx}
        resultImageUrls={resultImageUrls}
        onClose={() => setLightboxUrl(null)}
        onPrev={() => {
          const prev =
            (lightboxIdx - 1 + resultImageUrls.length) % resultImageUrls.length;
          setLightboxIdx(prev);
          setLightboxUrl(resultImageUrls[prev]);
        }}
        onNext={() => {
          const next = (lightboxIdx + 1) % resultImageUrls.length;
          setLightboxIdx(next);
          setLightboxUrl(resultImageUrls[next]);
        }}
        onSelect={(url, index) => {
          setLightboxIdx(index);
          setLightboxUrl(url);
        }}
      />
    </div>
  );
}
