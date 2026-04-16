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

export default function ImageGenView() {
  const [provider, setProvider] = useState("Imagen");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputFormat, setOutputFormat] = useState("JPEG");
  const [resolution, setResolution] = useState("1K");
  const [numResults, setNumResults] = useState(1);
  const [imageReference, setImageReference] = useState<File | null>(null);
  const [orientation, setOrientation] = useState("Square (1:1)");
  const [model] = useState("nano-banana-pro");
  const [style] = useState("Photorealistic");

  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  const cost = (() => {
    // Map UI provider to DB provider name
    const dbProvider = provider === "Imagen" ? "VEO" : "GROK";

    // Standardize quality names for matching (e.g. 1K might be 720p in DB)
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
        targetQualities.some(tq => tq.toLowerCase() === r.quality.toLowerCase())
    );

    return match ? match.credits : 3;
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
  const [userBalance, setUserBalance] = useState<number | null>(null);

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
          setImageReference(base64ToFile(parsed.imageBase64, parsed.imageName || "ref.png"));
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
      const state: any = { provider, prompt, aspectRatio, outputFormat, resolution, numResults, orientation };
      if (imageReference) {
        state.imageBase64 = await fileToBase64(imageReference);
        state.imageName = imageReference.name;
      }
      localStorage.setItem("ai_image_state", JSON.stringify(state));
    };
    saveState();
  }, [provider, prompt, aspectRatio, outputFormat, resolution, numResults, orientation, imageReference]);

  const handleClearAll = () => {
    setPrompt("");
    setImageReference(null);
    setResultImageUrls([]);
    setGenerationError(null);
    const fileInput = document.getElementById("image-ref-input") as HTMLInputElement;
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
        model: provider === "Imagen" ? model : "imagen-4",
        aspectRatio: provider === "Grok"
            ? orientation.includes("16:9") ? "16:9" : orientation.includes("9:16") ? "9:16" : orientation.includes("2:3") ? "2:3" : orientation.includes("3:2") ? "3:2" : "1:1"
            : aspectRatio,
        orientation,
        outputFormat,
        numResults: provider === "Grok" ? numResults : 1,
        cost,
        provider,
        style,
        resolution: provider === "Grok" ? "" : resolution,
      };

      const encodedData = Buffer.from(JSON.stringify(data)).toString("base64");
      const res = await generateImageAction(encodedData);

      if (res.success) {
        const uuid = res.data.uuid || res.data.id;
        if (uuid) {
          localStorage.setItem("pending_image_gen", uuid);
          window.dispatchEvent(new CustomEvent("balanceUpdated"));
          startPolling(uuid);
        } else {
          const imgUrl = res.data.image_url || res.data.url || (res.data.data && res.data.data[0]?.url);
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

        const status = statusRes.data.status;
        if (status === 2 || String(status).toLowerCase() === "completed") {
          clearInterval(intervalId);
          setIsGenerating(false);
          localStorage.removeItem("pending_image_gen");

          const foundUrls = [];
          if (statusRes.data.image_url) foundUrls.push(statusRes.data.image_url);
          else if (statusRes.data.url) foundUrls.push(statusRes.data.url);
          else if (statusRes.data.data && Array.isArray(statusRes.data.data)) {
            statusRes.data.data.forEach((item: any) => { if (item.url) foundUrls.push(item.url); });
          } else if (statusRes.data.generated_image && Array.isArray(statusRes.data.generated_image)) {
            statusRes.data.generated_image.forEach((item: any) => { if (item.image_url) foundUrls.push(item.image_url); });
          }

          if (foundUrls.length > 0) {
            setResultImageUrls(foundUrls);
            updateGenerationStatusAction(uuid, "completed", foundUrls[0]);
            window.dispatchEvent(new CustomEvent("balanceUpdated"));
          } else {
            setGenerationError("اكتمل التوليد ولكن لم نجد الرابط في البيانات المستلمة.");
          }
        } else if (status === 3 || String(status).toLowerCase() === "failed") {
          clearInterval(intervalId);
          setIsGenerating(false);
          localStorage.removeItem("pending_image_gen");

          let errorInfo = statusRes.data.error || statusRes.data.message || statusRes.data.reason || "مشكلة تقنية في الخادم المزود";
          if (typeof errorInfo === "object") errorInfo = errorInfo.message || JSON.stringify(errorInfo);

          setGenerationError(`فشل توليد الصورة: ${errorInfo}. تم استرجاع الـ ${cost} كريدت الخاصة بك.`);
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
    <div className="relative z-10 w-full pb-20" dir="rtl">
      <ImageGenHeader onClearAll={handleClearAll} />

      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        {/* Left Column - Controls */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col h-fit">
          <ImageGenProviders provider={provider} setProvider={setProvider} />
          
          <ImageGenPrompt 
            prompt={prompt} 
            setPrompt={setPrompt} 
            isEnhancing={isEnhancing} 
            onEnhance={handleEnhancePrompt} 
            provider={provider} 
          />

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

          {generationError && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-pulse">
              {generationError}
            </div>
          )}

          <ImageGenAction 
            userBalance={userBalance} 
            cost={cost} 
            isGenerating={isGenerating} 
            onGenerate={handleGenerate} 
            provider={provider} 
          />
        </div>

        {/* Right Column - Results */}
        <ImageGenResults 
          isGenerating={isGenerating} 
          resultImageUrls={resultImageUrls} 
          onOpenLightbox={(url, idx) => { setLightboxUrl(url); setLightboxIdx(idx); }} 
        />
      </div>

      <ImageGenLightbox 
        lightboxUrl={lightboxUrl} 
        lightboxIdx={lightboxIdx} 
        resultImageUrls={resultImageUrls} 
        onClose={() => setLightboxUrl(null)} 
        onPrev={() => { const prev = (lightboxIdx - 1 + resultImageUrls.length) % resultImageUrls.length; setLightboxIdx(prev); setLightboxUrl(resultImageUrls[prev]); }}
        onNext={() => { const next = (lightboxIdx + 1) % resultImageUrls.length; setLightboxIdx(next); setLightboxUrl(resultImageUrls[next]); }}
        onSelect={(url, index) => { setLightboxIdx(index); setLightboxUrl(url); }}
      />
    </div>
  );
}
