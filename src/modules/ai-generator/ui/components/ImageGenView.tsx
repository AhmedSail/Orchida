import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  ChevronDown,
  Monitor,
  Smartphone,
  Square,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  Download,
  Maximize,
  Clock,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { generateImageAction } from "@/app/actions/ai-image";
import {
  checkGenerationStatus,
  updateGenerationStatusAction,
  refundFailedTaskAction,
  enhancePromptAction,
} from "@/app/actions/ai-common";
import { getStudentInternalCredits } from "@/app/actions/ai-credits";
import { getAllAiPricingAction } from "@/app/actions/ai-pricing";
import Image from "next/image";

import { authClient } from "@/lib/auth-client";
import Swal from "sweetalert2";

interface PricingRule {
  serviceType: string;
  provider: string;
  quality: string;
  duration: number | null;
  credits: number;
}

export default function ImageGenView() {
  const [provider, setProvider] = useState("Imagen");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputFormat, setOutputFormat] = useState("JPEG");
  const [resolution, setResolution] = useState("1K");
  const [numResults, setNumResults] = useState(1);
  const [imageReference, setImageReference] = useState<File | null>(null);
  const [orientation, setOrientation] = useState("Square (1:1)");
  const [model] = useState("nano-banana-pro"); // Locked to Nano Banana Pro
  const [style] = useState("Photorealistic"); // Locked to Photorealistic for best results

  // Helper: File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper: Base64 to File
  const base64ToFile = (base64: string, filename: string): File => {
    try {
      const arr = base64.split(",");
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.error("Base64 to File error:", e);
      return null as any;
    }
  };

  // States for generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [resultImageUrls, setResultImageUrls] = useState<string[]>([]);

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
  // Auth & Balance
  const { data: session } = authClient.useSession();
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    // 1. Fetch credits
    getStudentInternalCredits().then((res) => {
      if (res.success && res.balance !== undefined) {
        setUserBalance(res.balance);
      }
    });

    // 2. Fetch pricing
    getAllAiPricingAction().then((rules) => {
      if (rules) {
        setPricingRules(rules as PricingRule[]);
      }
    });

    // 3. Load saved state
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

        // Restore image
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

  // 1. Save lightweight options (provider, prompt, orientation, etc.)
  useEffect(() => {
    const savedState = localStorage.getItem("ai_image_state");
    const currentSettings = savedState ? JSON.parse(savedState) : {};

    const newState = {
      ...currentSettings,
      provider,
      prompt,
      aspectRatio,
      outputFormat,
      resolution,
      numResults,
      orientation,
    };

    localStorage.setItem("ai_image_state", JSON.stringify(newState));
  }, [
    provider,
    prompt,
    aspectRatio,
    outputFormat,
    resolution,
    numResults,
    orientation,
  ]);

  // 2. Save images separately (expensive operations)
  useEffect(() => {
    const saveImages = async () => {
      const savedState = localStorage.getItem("ai_image_state");
      const currentSettings = savedState ? JSON.parse(savedState) : {};

      if (imageReference) {
        currentSettings.imageBase64 = await fileToBase64(imageReference);
        currentSettings.imageName = imageReference.name;
      } else {
        delete currentSettings.imageBase64;
        delete currentSettings.imageName;
      }

      localStorage.setItem("ai_image_state", JSON.stringify(currentSettings));
    };

    saveImages();
  }, [imageReference]);

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

  const cost = (() => {
    const resQuality = resolution || "Standard";

    // Exact match provider & quality
    const match = pricingRules.find(
      (r) =>
        r.serviceType === "image" &&
        r.provider.toLowerCase() === provider.toLowerCase() &&
        r.quality === resQuality,
    );
    return match ? match.credits : 1;
  })();

  const handleGenerate = async () => {
    // Check if user is logged in
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
            : "imagen-4",
        aspectRatio:
          provider === "Grok"
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
        outputFormat,
        numResults: provider === "Grok" ? numResults : 1,
        cost,
        provider,
        style,
      };

      // Force empty resolution for Grok to override backend defaults, use state for Imagen
      data.resolution = provider === "Grok" ? "" : resolution;

      const encodedData = Buffer.from(JSON.stringify(data)).toString("base64");
      const res = await generateImageAction(encodedData);

      if (res.success) {
        const uuid = res.data.uuid || res.data.id;

        if (uuid) {
          // حفظ المهمة في المحرك المحلي للاستمرارية
          localStorage.setItem("pending_image_gen", uuid);
          window.dispatchEvent(new CustomEvent("balanceUpdated"));
          // البدء بفحص الحالة (Polling)
          startPolling(uuid);
        } else {
          // إذا أرسل الـ API الرابط مباشرة (حالة نادرة في بعض المحركات)
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

        // Refresh credits
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
        if (!statusRes.success) return; // تخطي هذه الدورة لو حدث خطأ شبكة

        const status = statusRes.data.status;
        if (status === 2 || String(status).toLowerCase() === "completed") {
          clearInterval(intervalId);
          setIsGenerating(false);
          localStorage.removeItem("pending_image_gen");

          const foundUrls = [];
          if (statusRes.data.image_url) foundUrls.push(statusRes.data.image_url);
          else if (statusRes.data.url) foundUrls.push(statusRes.data.url);
          else if (statusRes.data.data && Array.isArray(statusRes.data.data)) {
            statusRes.data.data.forEach((item: any) => {
              if (item.url) foundUrls.push(item.url);
            });
          } else if (
            statusRes.data.generated_image &&
            Array.isArray(statusRes.data.generated_image)
          ) {
            statusRes.data.generated_image.forEach((item: any) => {
              if (item.image_url) foundUrls.push(item.image_url);
            });
          }

          if (foundUrls.length > 0) {
            setResultImageUrls(foundUrls);
            // تحديث السجل المحلي بالاكتمال (نأخذ أول صورة للمعينة)
            updateGenerationStatusAction(uuid, "completed", foundUrls[0]);
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

          // Extract error message reliably
          let errorInfo =
            statusRes.data.error ||
            statusRes.data.message ||
            statusRes.data.reason ||
            "مشكلة تقنية في الخادم المزود";
          if (typeof errorInfo === "object") {
            errorInfo = errorInfo.message || JSON.stringify(errorInfo);
          }

          const displayError = `فشل توليد الصورة: ${errorInfo}. تم استرجاع الـ ${cost} كريدت الخاصة بك.`;
          setGenerationError(displayError);

          updateGenerationStatusAction(uuid, "failed");

          // استرجاع الكريديت
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
    }, 4000); // فحص كل 4 ثوانٍ
  };

  return (
    <div className="relative z-10 w-full pb-20" dir="rtl">
      {/* Header Section */}
      <div className="text-center px-4 mb-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
          <ImageIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          مولّد الصور الذكي
        </h1>
        <p className="text-zinc-500 font-medium">
          أدخل وصفاً وحوّل كلماتك إلى لوحات فنية رائعة
        </p>
        
        <div className="flex bg-zinc-100 mx-auto w-full md:w-[300px] p-1 rounded-xl mt-6 gap-1">
          <button className="flex-[2] flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg shadow transition-all active:scale-95">
            <Sparkles className="w-3.5 h-3.5" />
            إنشاء جديد
          </button>
          <button 
            onClick={handleClearAll}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-zinc-500 hover:text-red-500 text-xs font-bold py-2 rounded-lg border border-zinc-200 hover:border-red-200 transition-all active:scale-95 group"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover:animate-bounce" />
            مسح
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        {/* Left Column - Controls */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col h-fit">
          {/* Providers */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-zinc-700 mb-3">
              محرك التوليد
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  id: "Imagen",
                  name: "G Imagen",
                  desc: "Gemini 3 Pro",
                  color: "bg-blue-600",
                  disabled: false,
                },
                {
                  id: "Grok",
                  name: "✖ Grok",
                  desc: "قيد التطوير",
                  color: "bg-zinc-400",
                  disabled: true,
                },
              ].map((p) => (
                <button
                  key={p.id}
                  disabled={p.disabled}
                  onClick={() => !p.disabled && setProvider(p.id)}
                  className={`flex flex-1 items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition 
                    ${
                      p.disabled
                        ? "opacity-60 cursor-not-allowed bg-zinc-50 border-zinc-100 text-zinc-400"
                        : provider === p.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-zinc-100 text-zinc-500 hover:bg-zinc-50"
                    }`}
                >
                  <div className="flex flex-col items-start">
                    <span>{p.name}</span>
                  </div>
                  <span
                    className={`${p.disabled ? "bg-zinc-200 text-zinc-500" : provider === p.id ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"} text-[8px] px-1.5 py-0.5 rounded-md uppercase tracking-tighter`}
                  >
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-zinc-700">
                وصف الصورة (Prompt)
              </label>
              <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition disabled:opacity-50"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                تحسين الوصف ذكياً ✨
              </button>
              {prompt && (
                <button
                  onClick={() => setPrompt("")}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  مسح
                </button>
              )}
            </div>
            <textarea
              className="w-full border border-zinc-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none leading-relaxed transition-all"
              placeholder={
                provider === "Grok"
                  ? "وصف الصورة التي تريد توليدها باستخدام Grok..."
                  : "صف الصورة التي تريد إنشاؤها بالتفصيل..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>

          {/* Image Reference */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              مرجع الصورة (Image Reference)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  document.getElementById("image-ref-input")?.click()
                }
                className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition bg-white flex-1"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="truncate max-w-[150px]">
                  {imageReference ? imageReference.name : "اختر صورة مرجعية"}
                </span>
              </button>
              {imageReference && (
                <button
                  onClick={() => {
                    setImageReference(null);
                    const fileInput = document.getElementById("image-ref-input") as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                  className="p-2 border border-red-100 rounded-xl text-red-500 hover:bg-red-50 transition bg-white"
                  title="مسح الصورة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              id="image-ref-input"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setImageReference(e.target.files?.[0] || null)}
            />
          </div>

          {/* Number of Results (Grok Only) */}
          {provider === "Grok" && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-zinc-700 mb-3">
                عدد الصور (Number of Results)
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 4, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumResults(num)}
                    className={`w-12 h-10 flex items-center justify-center rounded-xl border transition font-bold text-xs ${numResults === num ? "border-primary bg-primary/5 text-primary" : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 font-medium">سيتم توليد مصفوفة من {numResults} صور.</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-bold text-zinc-700 mb-3">
              {provider === "Grok"
                ? "الاتجاه (Orientation)"
                : "أبعاد الصورة (Aspect Ratio)"}
            </label>
            <div className="flex flex-wrap gap-2">
              {provider === "Grok"
                ? // Grok Orientation Logic
                  [
                    {
                      id: "Landscape (16:9)",
                      label: "Landscape (16:9)",
                      icon: Monitor,
                    },
                    {
                      id: "Portrait (9:16)",
                      label: "Portrait (9:16)",
                      icon: Smartphone,
                    },
                    { id: "Square (1:1)", label: "Square (1:1)", icon: Square },
                    {
                      id: "Vertical (2:3)",
                      label: "Vertical (2:3)",
                      icon: Smartphone,
                    },
                    {
                      id: "Horizontal (3:2)",
                      label: "Horizontal (3:2)",
                      icon: Monitor,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setOrientation(item.id)}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-[80px] ${orientation === item.id ? "border-primary bg-primary/5 text-primary" : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-zinc-100"}`}
                    >
                      <item.icon className="w-5 h-5 mb-1.5" />
                      <span className="text-[9px] font-bold text-center">
                        {item.label}
                      </span>
                    </button>
                  ))
                : // Imagen Aspect Ratio Logic
                  [
                    { id: "1:1", label: "مربع (1:1)", icon: Square },
                    { id: "16:9", label: "أفقي (16:9)", icon: Monitor },
                    { id: "9:16", label: "عمودي (9:16)", icon: Smartphone },
                    { id: "3:4", label: "3:4", icon: Smartphone },
                    { id: "4:3", label: "4:3", icon: Monitor },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAspectRatio(item.id)}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition min-w-[70px] ${aspectRatio === item.id ? "border-primary bg-primary/5 text-primary" : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-zinc-100"}`}
                    >
                      <item.icon className="w-5 h-5 mb-1.5" />
                      <span className="text-[10px] font-bold">
                        {item.label}
                      </span>
                    </button>
                  ))}
            </div>
          </div>

          {/* Settings Grid (Imagen Only) */}
          {provider !== "Grok" && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  صيغة الملف
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-zinc-50 font-semibold"
                >
                  <option value="JPEG">JPEG</option>
                  <option value="PNG">PNG</option>
                  <option value="WEBP">WEBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  الدقة
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-zinc-50 font-semibold"
                >
                  <option value="1K">1K (HD)</option>
                  <option value="2K">2K (Full HD)</option>
                  <option value="4K">4K (Ultra HD)</option>
                </select>
              </div>
            </div>
          )}

          {/* Error Message */}
          {generationError && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              {generationError}
            </div>
          )}

          {/* Generate Button Area */}
          <div className="mt-auto border-t border-zinc-100 pt-6">
            <div className="flex justify-between items-center bg-white p-2 rounded-2xl">
              <div className="flex flex-col px-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  الرصيد: {userBalance ?? "..."}
                </span>
                <span className="text-[10px] font-bold text-primary">
                  التكلفة المتوقعة: {cost} كريدت
                </span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`px-8 py-3.5 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${provider === "Grok" ? "bg-blue-600 text-white" : "bg-primary text-white"}`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جارٍ الرسم...
                  </>
                ) : (
                  <>
                    توليد باستخدام {provider}{" "}
                    <Zap className="w-4 h-4 fill-white" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-zinc-800">معاينة النتيجة</h2>
            {resultImageUrls.length > 0 && (
              <a
                href={resultImageUrls[0]}
                download
                target="_blank"
                className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
              >
                <Download className="w-4 h-4" /> تحميل الكل
              </a>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden flex-1 bg-zinc-50 border-2 border-dashed border-zinc-100 flex items-center justify-center p-4">
            {isGenerating ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                  <ImageIcon className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-zinc-600 font-bold text-lg animate-pulse">
                  فناننا الرقمي يرسم الآن...
                </p>
                <p className="text-zinc-400 text-xs mt-2">
                  عادةً ما يستغرق التوليد من 5 إلى 15 ثانية
                </p>
              </div>
            ) : resultImageUrls.length > 0 ? (
              <div className={`grid w-full h-full gap-2 ${resultImageUrls.length === 1 ? "grid-cols-1" : resultImageUrls.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"} overflow-auto p-2`}>
                {resultImageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-zinc-100 shadow-sm">
                    <Image
                      src={url}
                      fill
                      alt={`Generated Result ${idx + 1}`}
                      className="object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                       <button 
                         onClick={() => window.open(url, '_blank')}
                         className="p-1.5 bg-white rounded-full text-zinc-900 hover:scale-110 transition"
                       >
                         <Maximize className="w-4 h-4" />
                       </button>
                       <a 
                         href={url} 
                         download 
                         className="p-1.5 bg-white rounded-full text-zinc-900 hover:scale-110 transition"
                       >
                         <Download className="w-4 h-4" />
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-zinc-300">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                </div>
                <p className="text-lg font-bold">جاهز للإبداع؟</p>
                <p className="text-sm mt-1">
                  اكتب وصفاً في الجهة المقابلة واضغط توليد
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
