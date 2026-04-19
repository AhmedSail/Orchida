"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Video,
  Image as ImageIcon,
  History,
  Zap,
  Plus,
  ArrowRightLeft,
} from "lucide-react";
import {
  getStudentInternalCredits,
  getWhatsAppAction,
} from "@/app/actions/ai-credits";
import VideoGenView from "./components/VideoGenView";
import ImageGenView from "./components/ImageGenView";
import HistoryView from "./components/HistoryView";
import ChatModeView from "./components/ChatModeView";
import { useRouter, useSearchParams } from "next/navigation";

export default function AiProView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") || "chat"; // Default to chat

  const [balance, setBalance] = useState<number | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleModeChange = (mode: string) => {
    router.push(`/ai/pro?mode=${mode}`);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await getStudentInternalCredits();
      if (res.success && res.balance !== undefined) {
        setBalance(res.balance);
      }
    };

    const fetchSettings = async () => {
      const res = await getWhatsAppAction();
      if (res.success) {
        setWhatsappUrl(res.whatsappUrl);
      }
    };

    fetchBalance();
    fetchSettings();

    const handleBalanceUpdate = () => fetchBalance();
    window.addEventListener("balanceUpdated", handleBalanceUpdate);

    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceUpdate);
    };
  }, [modeParam]);

  return (
    <div
      dir="rtl"
      className={`min-h-screen text-zinc-900 font-sans selection:bg-purple-200 pb-20 relative `}
    >
      {/* Floating Balance Badge */}
      <div className="w-52 mt-10">
        <div className="bg-white/90 backdrop-blur-md border border-zinc-100 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold text-zinc-400 leading-none mb-1 uppercase tracking-wider">
              رصيدك المتبقي
            </span>
            <span className="text-xl font-black text-zinc-800 tabular-nums">
              {balance !== null ? balance : "..."}
            </span>
          </div>

          <a
            href={`${whatsappUrl.includes("http") ? whatsappUrl : `https://wa.me/${whatsappUrl.replace(/\D/g, "")}`}?text=${encodeURIComponent("اريد شحن رصيد credit خاص بال ai الموجود في موقع الشركة الخاص بكم")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all duration-300 group/plus"
            title="شحن رصيد"
          >
            <Plus className="w-5 h-5 transition-transform group-hover/plus:rotate-90" />
          </a>
        </div>
      </div>

      {modeParam === "chat" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #8080800a 1px, transparent 1px), linear-gradient(to bottom, #8080800a 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      )}

      <div className="relative z-10 w-full pt-4">
        {/* Navigation Tabs */}
        <div className="flex justify-center pt-2 pb-6">
          <div className="flex bg-white shadow-sm border border-zinc-100 rounded-2xl p-2 gap-2 overflow-x-auto max-w-full">
            <button
              onClick={() => router.push("/ai")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition hover:bg-zinc-50`}
            >
              <ArrowRightLeft className={`w-6 h-6 mb-2 text-zinc-400`} />
              <span className={`text-xs font-semibold text-zinc-600`}>الرئيسية</span>
            </button>
            <button
              onClick={() => handleModeChange("video")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition ${modeParam === "video" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <Video className={`w-6 h-6 mb-2 ${modeParam === "video" ? "text-primary" : "text-zinc-400"}`} />
              <span className={`text-xs font-semibold ${modeParam === "video" ? "text-primary" : "text-zinc-600"}`}>توليد فيديو</span>
            </button>
            <button
              onClick={() => handleModeChange("imagen")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition ${modeParam === "imagen" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <ImageIcon className={`w-6 h-6 mb-2 ${modeParam === "imagen" ? "text-primary" : "text-zinc-400"}`} />
              <span className={`text-xs font-semibold ${modeParam === "imagen" ? "text-primary" : "text-zinc-600"}`}>توليد صور</span>
            </button>
            <button
              onClick={() => handleModeChange("chat")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition ${modeParam === "chat" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <MessageSquare className={`w-6 h-6 mb-2 ${modeParam === "chat" ? "text-primary" : "text-zinc-400"}`} />
              <span className={`text-xs font-semibold ${modeParam === "chat" ? "text-primary" : "text-zinc-600"}`}>المحادثة</span>
            </button>
            <button
              onClick={() => handleModeChange("history")}
              className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-xl transition ${modeParam === "history" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <History className={`w-6 h-6 mb-2 ${modeParam === "history" ? "text-primary" : "text-zinc-400"}`} />
              <span className={`text-xs font-semibold ${modeParam === "history" ? "text-primary" : "text-zinc-600"}`}>السجل</span>
            </button>
          </div>
        </div>

        {/* Content Views */}
        <div className={modeParam !== "chat" ? "hidden" : ""}>
          <ChatModeView />
        </div>
        <div className={modeParam !== "video" ? "hidden" : ""}>
          <VideoGenView />
        </div>
        <div className={modeParam !== "imagen" ? "hidden" : ""}>
          <ImageGenView />
        </div>
        <div className={modeParam !== "history" ? "hidden" : ""}>
          <HistoryView isActive={modeParam === "history"} />
        </div>
      </div>
    </div>
  );
}
