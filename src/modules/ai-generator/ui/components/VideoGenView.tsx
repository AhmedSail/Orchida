"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
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
} from "lucide-react";
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

export default function VideoGenView({ userBalance: propBalance }: VideoGenViewProps) {
  const searchParams = useSearchParams();
  const [provider, setProvider] = useState("Veo");
  const [veoModel] = useState("veo-3.1-fast"); // Locked to Veo 3.1 Fast as requested
  const [grokMode] = useState("normal"); // Locked to Normal as requested
  const [prompt, setPrompt] = useState("");

  React.useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt));
    }
  }, [searchParams]);

  const [orientation, setOrientation] = useState("Landscape (16:9)");
  const [resolution, setResolution] = useState("High 720p"); // Default for Veo
  const [duration, setDuration] = useState("6"); // e.g. "6" or "10"

  // Auth State
  const { data: session } = authClient.useSession();

  // User Credits State
  const [userBalance, setUserBalance] = useState<number | null>(propBalance ?? null);

  useEffect(() => {
    if (propBalance !== undefined) {
      setUserBalance(propBalance);
    }
  }, [propBalance]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  // Debug State
  const [rawResponseData, setRawResponseData] = useState<any>(null);

  // Use Effect to grab balance on mount

  // Image Upload states
  const [firstImage, setFirstImage] = useState<File | null>(null);
  const [lastImage, setLastImage] = useState<File | null>(null);
  const [grokImage, setGrokImage] = useState<File | null>(null);

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

  // Input refs
  const firstImageRef = React.useRef<HTMLInputElement>(null);
  const lastImageRef = React.useRef<HTMLInputElement>(null);
  const grokImageRef = React.useRef<HTMLInputElement>(null);

  // API Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationTaskId, setGenerationTaskId] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleClearAll = () => {
    setPrompt("");
    setFirstImage(null);
    setLastImage(null);
    setGrokImage(null);
    setResultVideoUrl(null);
    setRawResponseData(null);
    setGenerationError(null);
    if (firstImageRef.current) firstImageRef.current.value = "";
    if (lastImageRef.current) lastImageRef.current.value = "";
    if (grokImageRef.current) grokImageRef.current.value = "";

    // Clear persistence
    localStorage.removeItem("ai_video_state");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "تم مسح جميع الحقول 🧹",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // Credit calculation logic
  const calculateCost = () => {
    const seconds = parseInt(duration) || 6;
    const resQuality = resolution.includes("720")
      ? "720p"
      : resolution.includes("1080")
        ? "1080p"
        : "480p";

    // Use uppercase for matching with DB if stored as VEO/GROK
    const dbProvider = provider.toLowerCase().trim();
    const dbQuality = resQuality.toLowerCase().trim();

    // Find match: Priority to exact duration, then fallback to duration 0/null (global)
    const match = pricingRules.find(
      (r) =>
        r.serviceType === "video" &&
        r.provider.toLowerCase().trim() === dbProvider &&
        r.quality.toLowerCase().trim() === dbQuality &&
        (r.duration === seconds || r.duration === 0 || r.duration === null),
    );

    if (match) return match.credits;

    // 3. Fallback to hardcoded logic if no DB rule found
    switch (provider) {
      case "Grok":
        return 3;
      case "Veo":
        return 3;
      default:
        return 3;
    }
  };

  const cost = calculateCost();

  React.useEffect(() => {
    // 1. Fetch initial user balance
    getStudentInternalCredits().then((res) => {
      if (res.success && res.balance !== undefined) {
        setUserBalance(res.balance);
      }
    });

    // 2. Fetch dynamic pricing rules
    getAllAiPricingAction().then((rules) => {
      if (rules) {
        setPricingRules(rules as PricingRule[]);
      }
    });

    const savedState = localStorage.getItem("ai_video_state");
    const pendingGen = localStorage.getItem("pending_video_gen");

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.prompt) setPrompt(parsed.prompt);
        if (parsed.orientation) setOrientation(parsed.orientation);
        if (parsed.resolution) setResolution(parsed.resolution);
        if (parsed.duration) setDuration(parsed.duration);

        // Restore images from Base64
        if (parsed.firstImageBase64) {
          setFirstImage(
            base64ToFile(
              parsed.firstImageBase64,
              parsed.firstImageName || "first.png",
            ),
          );
        }
        if (parsed.lastImageBase64) {
          setLastImage(
            base64ToFile(
              parsed.lastImageBase64,
              parsed.lastImageName || "last.png",
            ),
          );
        }
        if (parsed.grokImageBase64) {
          setGrokImage(
            base64ToFile(
              parsed.grokImageBase64,
              parsed.grokImageName || "grok.png",
            ),
          );
        }
      } catch (e) {
        console.error("Error loading saved state:", e);
      }
    }

    if (pendingGen) {
      setIsGenerating(true);
      setGenerationTaskId(pendingGen);
      pollStatus(pendingGen);
    }
  }, []);

  // Use effects for temporary object URLs to prevent memory leaks and refresh bugs
  const [firstImageUrl, setFirstImageUrl] = useState<string | null>(null);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  const [grokImageUrl, setGrokImageUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (firstImage) {
      const url = URL.createObjectURL(firstImage);
      setFirstImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFirstImageUrl(null);
  }, [firstImage]);

  React.useEffect(() => {
    if (lastImage) {
      const url = URL.createObjectURL(lastImage);
      setLastImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setLastImageUrl(null);
  }, [lastImage]);

  React.useEffect(() => {
    if (grokImage) {
      const url = URL.createObjectURL(grokImage);
      setGrokImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setGrokImageUrl(null);
  }, [grokImage]);

  // Consolidated Persistence Effect (Prevents race conditions between options and images)
  React.useEffect(() => {
    const saveState = async () => {
      try {
        const stateToSave: any = {
          provider,
          veoModel,
          grokMode,
          prompt,
          orientation,
          resolution,
          duration,
        };

        if (firstImage) {
          stateToSave.firstImageBase64 = await fileToBase64(firstImage);
          stateToSave.firstImageName = firstImage.name;
        }
        if (lastImage) {
          stateToSave.lastImageBase64 = await fileToBase64(lastImage);
          stateToSave.lastImageName = lastImage.name;
        }
        if (grokImage) {
          stateToSave.grokImageBase64 = await fileToBase64(grokImage);
          stateToSave.grokImageName = grokImage.name;
        }

        localStorage.setItem("ai_video_state", JSON.stringify(stateToSave));
      } catch (e) {
        console.error("Persistence error:", e);
      }
    };

    const timer = setTimeout(saveState, 500); // Debounce to prevent lag on typing
    return () => clearTimeout(timer);
  }, [
    provider,
    prompt,
    orientation,
    resolution,
    duration,
    firstImage,
    lastImage,
    grokImage,
  ]);

  const handleEnhancePrompt = async (type: "video" | "image" = "video") => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await enhancePromptAction(prompt, type);
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
      setGenerationError("Please enter a text prompt to generate video");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setResultVideoUrl(null);
    setGenerationTaskId(null);
    setRawResponseData(null);

    try {
      const formData = new FormData();
      formData.append("provider", provider);

      const mappedModel =
        provider === "Veo"
          ? veoModel
          : provider === "Grok"
            ? "grok-3"
            : provider === "Bytedance"
              ? "seedance"
              : provider === "Kling"
                ? "kling"
                : "meta";

      formData.append("model", mappedModel);
      formData.append("prompt", prompt);
      formData.append("duration", duration.toString());
      formData.append("resolution", resolution);
      formData.append("aspectRatio", orientation);
      formData.append("cost", cost.toString());
      if (provider === "Grok") {
        formData.append("mode", grokMode);
      }

      // Append images if present
      if (provider === "Veo") {
        if (firstImage) formData.append("firstImage", firstImage);
        if (lastImage) formData.append("lastImage", lastImage);
      } else if (provider === "Grok") {
        if (grokImage) formData.append("image", grokImage);
      }

      console.log("🚀 Sending Video Generation Request:", {
        provider,
        model: mappedModel,
        prompt,
        duration,
        resolution,
        aspectRatio: orientation,
        cost,
        firstImage: firstImage
          ? { name: firstImage.name, size: firstImage.size }
          : "none",
        lastImage: lastImage
          ? { name: lastImage.name, size: lastImage.size }
          : "none",
        grokImage: grokImage
          ? { name: grokImage.name, size: grokImage.size }
          : "none",
      });

      const res = await generateVideoAction(formData);

      if (!res.success) {
        setGenerationError(res.error || "Failed to start generation");
        setIsGenerating(false);
        return;
      }

      // Success, started!
      const taskId = res.data.uuid;
      setGenerationTaskId(taskId);
      localStorage.setItem("pending_video_gen", taskId);
      window.dispatchEvent(new CustomEvent("balanceUpdated"));

      // Start polling
      pollStatus(taskId);
    } catch (e: any) {
      setGenerationError(e.message);
      setIsGenerating(false);
    }
  };

  const pollStatus = async (uuid: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes timeout

    const intervalId = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(intervalId);
        localStorage.removeItem("pending_video_gen");
        setGenerationError(
          "Generation timed out. Please check your history later.",
        );
        setIsGenerating(false);
        return;
      }

      const res = await checkGenerationStatus(uuid);
      if (!res.success) return; // Skip a tick if network error

      // 0: pending, 1: generating, 2: completed, 3: failed
      const status = res.data.status;
      if (status === 2 || String(status).toLowerCase() === "completed") {
        clearInterval(intervalId);
        setIsGenerating(false);
        localStorage.removeItem("pending_video_gen");

        console.log("🔥 Generation Completed! Full Data Object:", res.data);

        // Find URL in typical API response structures
        let foundUrl = null;
        if (
          res.data.generated_video &&
          res.data.generated_video.length > 0 &&
          res.data.generated_video[0].video_url
        ) {
          foundUrl = res.data.generated_video[0].video_url;
        } else if (res.data.video) {
          foundUrl = res.data.video;
        } else if (res.data.files && res.data.files.length > 0) {
          foundUrl = res.data.files[0].url;
        } else if (res.data.result_url) {
          foundUrl = res.data.result_url;
        } else if (res.data.url) {
          foundUrl = res.data.url;
        } else if (res.data.data && res.data.data.url) {
          foundUrl = res.data.data.url;
        } else if (res.data.video_url) {
          foundUrl = res.data.video_url;
        }

        if (foundUrl) {
          setResultVideoUrl(foundUrl);
        } else {
          // If we couldn't parse the URL, we keep the raw data to show on screen for debugging
          setRawResponseData(res.data);
          setGenerationError(
            "Video generated successfully, but the system couldn't read the URL structure. View raw data below.",
          );
        }

        // تحديث السجل المحلي بالرابط والصورة
        updateGenerationStatusAction(
          uuid,
          "completed",
          foundUrl || "",
          res.data.thumbnail_url || res.data.thumbnail || "",
        );

        // Refresh credits after successful generation
        getStudentInternalCredits().then((r) => {
          if (r.success && r.balance !== undefined) {
            setUserBalance(r.balance);
            window.dispatchEvent(new CustomEvent("balanceUpdated"));
          }
        });
      } else if (status === 3 || String(status).toLowerCase() === "failed") {
        clearInterval(intervalId);
        setIsGenerating(false);
        localStorage.removeItem("pending_video_gen");

        // Extract the error sent from the API
        let errorData =
          res.data.error ||
          res.data.message ||
          res.data.result ||
          res.data.reason;
        if (typeof errorData === "object") {
          errorData = errorData.message || JSON.stringify(errorData);
        }

        const errorMessage =
          errorData ||
          "فشل الخادم في معالجة طلب الفيديو. قد يكون ذلك بسبب ضغط العمل أو قيود في المحتوى.";
        const displayError = `فشل إنشاء الفيديو: ${errorMessage}. تم استرجاع الـ ${cost} كريدت الخاصة بك.`;

        setGenerationError(displayError);

        // تحديث السجل المحلي بالفشل
        updateGenerationStatusAction(uuid, "failed");
        refundFailedTaskAction(uuid, errorMessage).then(() => {
          // Refresh user balance to reflect refund
          getStudentInternalCredits().then((r) => {
            if (r.success && r.balance !== undefined) {
              setUserBalance(r.balance);
              window.dispatchEvent(new CustomEvent("balanceUpdated"));
            }
          });
        });
      }
    }, 5000);
  };

  return (
    <div className="relative z-10 w-full pb-20">
      {/* Header Section */}
      <div className="text-center px-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          مولّد الفيديو بالذكاء الاصطناعي
        </h1>
        <p className="text-zinc-500 mb-6 font-medium">
          أنشئ فيديوهات احترافية من نص بسيط باستخدام أحدث نماذج الذكاء الاصطناعي
        </p>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-[1000px] mx-auto px-4  gap-6">
        {/* Left Column - Controls */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          {/* Tabs */}
          <div className="flex bg-zinc-100 mx-auto w-full md:w-2/3 p-1 rounded-lg mb-6 gap-1">
            <button className="flex-[2] flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-md shadow transition-all active:scale-95">
              <Video className="w-4 h-4" />
              إنشاء جديد
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-zinc-500 hover:text-red-500 text-sm font-semibold py-2 rounded-md border border-zinc-200 hover:border-red-200 transition-all active:scale-95 group"
            >
              <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
              مسح الحقول
            </button>
          </div>

          {/* Providers */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-zinc-700 mb-3">
              اختر مزود توليد الفيديو
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setProvider("Veo");
                  setResolution("High 720p");
                  setOrientation("Landscape (16:9)");
                  setDuration("6");
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${provider === "Veo" ? "border-primary bg-primary/10 text-primary" : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"}`}
              >
                G Veo{" "}
                <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded">
                  Google AI
                </span>{" "}
              </button>
              <button
                onClick={() => {
                  setProvider("Grok");
                  setDuration("6");
                  // Optional defaults for Grok
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${provider === "Grok" ? "border-primary bg-primary/10 text-primary" : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"}`}
              >
                Grok{" "}
                <span className="bg-[#5de270] text-black text-[9px] px-1.5 py-0.5 rounded font-bold">
                  xAI
                </span>{" "}
              </button>
            </div>
          </div>

          {/* Dynamic Content Based on Provider */}
          {provider === "Veo" && (
            <div className="space-y-6 mb-8">
              {/* Fixed Model Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    الموديل (Version)
                  </label>
                  <div className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary font-bold bg-primary/5 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Veo 3.1 Fast
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    المدة (Duration)
                  </label>
                  <div className="flex gap-2">
                    {["6", "8"].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setDuration(sec)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${duration === sec ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                      >
                        {sec} ثانية
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image References First/Last */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  الصور المرجعية (اختياري)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={firstImageRef}
                    onChange={(e) => setFirstImage(e.target.files?.[0] || null)}
                  />
                  <div
                    onClick={() => firstImageRef.current?.click()}
                    className="border border-dashed border-zinc-300 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 transition cursor-pointer overflow-hidden relative"
                  >
                    {firstImage ? (
                      <div className="absolute inset-0 w-full h-full group">
                        {firstImageUrl && (
                          <img
                            src={firstImageUrl}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFirstImage(null);
                            if (firstImageRef.current)
                              firstImageRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                        <span className="text-xs font-medium">
                          الصورة الأولى
                        </span>
                      </>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={lastImageRef}
                    onChange={(e) => setLastImage(e.target.files?.[0] || null)}
                  />
                  <div
                    onClick={() => lastImageRef.current?.click()}
                    className="border border-dashed border-zinc-300 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 transition cursor-pointer overflow-hidden relative"
                  >
                    {lastImage ? (
                      <div className="absolute inset-0 w-full h-full group">
                        {lastImageUrl && (
                          <img
                            src={lastImageUrl}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLastImage(null);
                            if (lastImageRef.current)
                              lastImageRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                        <span className="text-xs font-medium">
                          الصورة الأخيرة
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-zinc-700">
                    النص التوجيهي (Prompt)
                  </label>
                  <button
                    onClick={() => handleEnhancePrompt("video")}
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
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                  placeholder="صف الفيديو الذي تريد إنشاؤه باستخدام Veo..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
              </div>

              {/* Aspect Ratio & Resolution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    نسبة العرض إلى الارتفاع
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrientation("Landscape (16:9)")}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg border transition ${orientation === "Landscape (16:9)" ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >
                      <div className="w-16 h-8 flex items-center justify-center bg-zinc-100 rounded border border-zinc-200 mb-2">
                        <Monitor className="w-5 h-5 opacity-40" />
                      </div>
                      <span className="text-xs font-bold">
                        16:9 (Landscape)
                      </span>
                    </button>

                    <button
                      onClick={() => setOrientation("Portrait (9:16)")}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg border transition ${orientation === "Portrait (9:16)" ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >
                      <div className="w-8 h-12 flex items-center justify-center bg-zinc-100 rounded border border-zinc-200 mb-2">
                        <Smartphone className="w-5 h-5 opacity-40" />
                      </div>
                      <span className="text-xs font-bold">9:16 (Portrait)</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    الدقة
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResolution("High 720p")}
                      className={`flex-1 flex flex-col items-start px-3 py-2 rounded-lg border text-xs font-semibold transition ${resolution === "High 720p" ? "border-[#ff7622]" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${resolution === "High 720p" ? "bg-[#ff7622]" : "border border-zinc-300"}`}
                        ></div>
                        <span
                          className={
                            resolution === "High 720p" ? "text-zinc-900" : ""
                          }
                        >
                          720p
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 pl-3">
                        جودة عالية
                      </span>
                    </button>
                    <button
                      onClick={() => setResolution("Full 1080p")}
                      className={`flex-1 flex flex-col items-start px-3 py-2 rounded-lg border text-xs font-semibold transition ${resolution === "Full 1080p" ? "border-primary" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${resolution === "Full 1080p" ? "bg-primary" : "border border-zinc-300"}`}
                        ></div>
                        <span
                          className={
                            resolution === "Full 1080p" ? "text-zinc-900" : ""
                          }
                        >
                          1080p
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 pl-3">
                        Full HD فائقة الوضوح
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {provider === "Grok" && (
            <div className="space-y-6 mb-8">
              {/* Model & Image Ref */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    الموديل
                  </label>
                  <div className="relative">
                    <div className="w-full appearance-none border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary font-bold bg-primary/5 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Grok 3 Video
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    الصورة المرجعية
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={grokImageRef}
                    onChange={(e) => setGrokImage(e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() =>
                      !grokImage
                        ? grokImageRef.current?.click()
                        : setGrokImage(null)
                    }
                    className="w-full flex items-center justify-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition relative overflow-hidden"
                  >
                    {grokImage ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-primary font-semibold truncate px-2">
                          <ImageIcon className="w-4 h-4 inline mr-1" />{" "}
                          {grokImage.name}
                        </span>
                        <Trash2
                          className="w-4 h-4 text-red-500 hover:text-red-600 transition cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGrokImage(null);
                            if (grokImageRef.current)
                              grokImageRef.current.value = "";
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" /> اختر صورة
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Fixed Generation Mode */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  وضع التوليد (Generation Mode)
                </label>
                <div className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary font-bold bg-primary/5 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> عادي (Normal)
                </div>
              </div>

              {/* Prompt */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-zinc-700">
                    النص التوجيهي (Prompt)
                  </label>
                  <button
                    onClick={() => handleEnhancePrompt("video")}
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
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-none"
                  placeholder="صف الفيديو الذي تريد إنشاؤه باستخدام Grok..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  الاتجاه
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      id: "Landscape (16:9)",
                      icon: Monitor,
                      label: "أفقي (16:9)",
                    },
                    {
                      id: "Portrait (9:16)",
                      icon: Smartphone,
                      label: "عمودي (9:16)",
                    },
                    { id: "Square (1:1)", icon: Square, label: "مربع (1:1)" },
                    {
                      id: "Vertical (2:3)",
                      icon: Smartphone,
                      label: "طولي (2:3)",
                    },
                    {
                      id: "Horizontal (3:2)",
                      icon: Monitor,
                      label: "عرضي (3:2)",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setOrientation(item.id)}
                      className={`flex flex-col items-center justify-center py-3 px-1 rounded-lg border transition w-[80px] ${orientation === item.id ? "border-primary text-primary bg-primary/5" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >
                      <item.icon className="w-5 h-5 mb-2" />
                      <span className="text-[9px] text-center font-bold leading-tight">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    الدقة
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResolution("Standard 480p")}
                      className={`flex-1 flex flex-col items-start px-3 py-2 rounded-lg border text-xs font-semibold transition ${resolution === "Standard 480p" ? "border-primary" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${resolution === "Standard 480p" ? "bg-primary" : "border border-zinc-300"}`}
                        ></div>
                        <span
                          className={
                            resolution === "Standard 480p"
                              ? "text-zinc-900"
                              : ""
                          }
                        >
                          Standard
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 pl-3">
                        480p (SD)
                      </span>
                    </button>
                    <button
                      onClick={() => setResolution("High 720p")}
                      className={`flex-1 flex flex-col items-start px-3 py-2 rounded-lg border text-xs font-semibold transition ${resolution === "High 720p" ? "border-[#ff7622]" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${resolution === "High 720p" ? "bg-[#ff7622]" : "border border-zinc-300"}`}
                        ></div>
                        <span
                          className={
                            resolution === "High 720p" ? "text-zinc-900" : ""
                          }
                        >
                          High
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 pl-3">
                        720p (HD)
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Duration
                  </label>
                  <div className="flex gap-2">
                    {["6", "10"].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setDuration(sec)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg border text-xs font-semibold transition ${duration === sec ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
                      >
                         {sec} ثوانٍ
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {provider === "Meta" && (
            <div className="space-y-6 mb-8">
              {/* Meta Top Options */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Duration
                  </label>
                  <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary text-primary bg-primary/5 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>{" "}
                    5s
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Number of results
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        className={`w-8 h-8 rounded-full border text-xs font-semibold flex items-center justify-center transition ${num === 1 ? "border-primary text-primary" : "border-zinc-200 text-zinc-500"}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Image Reference
                </label>
                <div className="w-[150px]">
                  <button className="w-full flex items-center justify-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition">
                    <ImageIcon className="w-4 h-4" /> Select Image
                  </button>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-zinc-700">
                    Prompt
                  </label>
                  {prompt && (
                    <button
                      onClick={() => setPrompt("")}
                      className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                  placeholder="Describe the video you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          {(provider === "Bytedance" || provider === "Kling") && (
            <div className="space-y-6 mb-8">
              {/* Model & Gen Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Model
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                      <option>
                        {provider === "Bytedance"
                          ? "♪ Seedance 2"
                          : "Kling 3.0"}
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">
                    Generation Mode
                  </label>
                  <div className="relative">
                    <select className="w-full appearance-none border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                      <option>
                        {provider === "Bytedance" ? "Fast" : "Standard"}
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Image References First/Last */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Image References (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-dashed border-zinc-300 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 transition cursor-pointer">
                    <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-xs font-medium">First Image</span>
                  </div>
                  <div className="border border-dashed border-zinc-300 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 transition cursor-pointer">
                    <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Last Image</span>
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-zinc-700">
                    Prompt
                  </label>
                </div>
                <textarea
                  className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none"
                  placeholder={`Describe the video you want to generate with ${provider}...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  Aspect Ratio
                </label>
                <div className="flex flex-wrap gap-2">
                  {["16:9", "9:16", "1:1", "3:4", "4:3", "21:9"]
                    .slice(0, provider === "Kling" ? 3 : 6)
                    .map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setOrientation(ratio)}
                        className={`flex items-center justify-center px-4 py-1.5 rounded-full border transition ${orientation === ratio ? "border-[#ff7622] text-[#ff7622] bg-[#fff5ef]" : "border-zinc-200 text-zinc-500"}`}
                      >
                        <span className="text-xs font-semibold flex items-center gap-1.5">
                          {orientation === ratio && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff7622]"></div>
                          )}
                          {ratio}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Duration Buttons */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-3">
                  Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 13 }, (_, i) => i + 3).map((secs) => {
                    if (provider === "Bytedance" && secs === 3) return null; // Seedance starts from 4s
                    return (
                      <button
                        key={secs}
                        onClick={() => setDuration(secs.toString())}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center justify-center transition ${duration === secs.toString() ? "border-[#ff7622] text-[#ff7622] bg-[#fff5ef]" : "border-zinc-200 text-zinc-500"}`}
                      >
                        {secs}s
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button Area */}
          <div className="flex flex-col gap-3 pt-2">
            {generationError && (
              <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{generationError}</p>
              </div>
            )}
            <div className="flex justify-between  items-end w-full">
              <div className="flex flex-col items-end mr-4">
                <span className="text-xs text-zinc-500 mb-1">
                  الرصيد المتبقي:{" "}
                  <span className="font-bold text-zinc-800">
                    {userBalance !== null ? userBalance : "..."}
                  </span>{" "}
                  <Zap className="w-3 h-3 inline text-primary mb-0.5" />
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  تكلفة هذا التوليد: {cost} كريدت
                </span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition shrink-0 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ التوليد...
                  </>
                ) : (
                  <>
                    توليد باستخدام {provider} <Zap className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Generation Display Area (Added to show results) */}
        {(isGenerating || resultVideoUrl || rawResponseData) && (
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm mt-6 flex flex-col w-full min-h-[400px]">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-zinc-800 mb-1">
                نتيجة التوليد
              </h2>
              <p className="text-xs text-zinc-500">
                {isGenerating
                  ? "الفيديو قيد التوليد الآن..."
                  : "فيديوك جاهز! يمكنك مشاهدته وتحميله"}
              </p>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-zinc-900 flex-1 min-h-[400px] flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-8 z-20">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-white font-semibold text-lg animate-pulse mb-1">
                    جارٍ توليد الفيديو بالذكاء الاصطناعي...
                  </p>
                  <p className="text-zinc-400 text-xs">
                    قد يستغرق ذلك بضع دقائق
                  </p>
                </div>
              ) : resultVideoUrl ? (
                <video
                  src={resultVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="absolute inset-0 w-full h-full object-contain bg-black z-10"
                />
              ) : rawResponseData ? (
                <div className="absolute inset-0 w-full h-full overflow-auto bg-zinc-950 p-6 text-emerald-400 font-mono text-sm block whitespace-pre-wrap text-left z-20">
                  <span className="text-zinc-500 mb-2 block">
                    // Debug API Response:
                  </span>
                  {JSON.stringify(rawResponseData, null, 2)}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
