"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Video,
  Image as ImageIcon,
  Mic,
  History,
  Zap,
  Plus,
} from "lucide-react";
import Image from "next/image";
import {
  getStudentInternalCredits,
  getWhatsAppAction,
} from "@/app/actions/ai-credits";
import ChatModeView from "./components/ChatModeView";
import VideoGenView from "./components/VideoGenView";
import ImageGenView from "./components/ImageGenView";
import HistoryView from "./components/HistoryView";

export default function AiGeneratorView() {
  const [appMode, setAppMode] = useState("video"); // 'chat' | 'video' | 'imagen'
  const [balance, setBalance] = useState<number | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState("");

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

    // Listen for custom balance update events (Real-time update)
    const handleBalanceUpdate = () => fetchBalance();
    window.addEventListener("balanceUpdated", handleBalanceUpdate);

    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceUpdate);
    };
  }, [appMode]); // Refresh balance when switching modes

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

          {/* Recharge Button */}
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
      {/* Grid Pattern Background for Chat Mode */}
      {appMode === "chat" && (
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
        {/* Top Apps Navigation Pill container */}
        <div className="flex justify-center pt-2 pb-6">
          <div className="flex bg-white shadow-sm border border-zinc-100 rounded-2xl p-2 gap-2 overflow-x-auto max-w-full">
            <button
              onClick={() => setAppMode("video")}
              className={`flex flex-col items-center justify-center p-3 min-w-[100px] rounded-xl transition ${appMode === "video" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <Video
                className={`w-6 h-6 mb-2 ${appMode === "video" ? "text-primary" : "text-zinc-400"}`}
              />
              <span
                className={`text-xs font-semibold ${appMode === "video" ? "text-primary" : "text-zinc-600"}`}
              >
                توليد فيديو
              </span>
            </button>
            <button
              onClick={() => setAppMode("imagen")}
              className={`flex flex-col items-center justify-center p-3 min-w-[100px] rounded-xl transition ${appMode === "imagen" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <ImageIcon
                className={`w-6 h-6 mb-2 ${appMode === "imagen" ? "text-primary" : "text-zinc-400"}`}
              />
              <span
                className={`text-xs font-semibold ${appMode === "imagen" ? "text-primary" : "text-zinc-600"}`}
              >
                توليد صور
              </span>
            </button>
            <button
              onClick={() => setAppMode("history")}
              className={`flex flex-col items-center justify-center p-3 min-w-[100px] rounded-xl transition ${appMode === "history" ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-50"}`}
            >
              <History
                className={`w-6 h-6 mb-2 ${appMode === "history" ? "text-primary" : "text-zinc-400"}`}
              />
              <span
                className={`text-xs font-semibold ${appMode === "history" ? "text-primary" : "text-zinc-600"}`}
              >
                السجل
              </span>
            </button>
          </div>
        </div>

        <div className={appMode !== "video" ? "hidden" : ""}>
          <VideoGenView />
        </div>
        <div className={appMode !== "imagen" ? "hidden" : ""}>
          <ImageGenView />
        </div>
        <div className={appMode !== "history" ? "hidden" : ""}>
          <HistoryView isActive={appMode === "history"} />
        </div>
      </div>
    </div>
  );
}
