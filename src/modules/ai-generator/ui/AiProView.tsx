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
  Bot,
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
import { motion } from "framer-motion";

export default function AiProView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode") || "chat";

  const [balance, setBalance] = useState<number | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleModeChange = (newMode: string) => {
    router.push(`/ai/pro?mode=${newMode}`);
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
  }, []);

  return (
    <div className="min-h-screen  text-zinc-900 font-sans selection:bg-primary/10 relative overflow-hidden pb-32">
      {/* Premium Ambient Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[5%] w-[30%] h-[30%] bg-indigo-500/5 blur-[150px] rounded-full animate-pulse pointer-events-none" />

      {/* Subtle Grid Texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#6366f1 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-6 md:pt-12">
        {/* Top Header Section - Orchida Branded Light */}
        <header
          className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 md:py-6 mb-8 md:mb-12 relative z-10 gap-6"
          dir="rtl"
        >
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <div className="flex items-center gap-3 md:gap-4 mb-1 md:mb-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900">
                أوركيدة
              </h1>
              <div className="size-8 md:size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Zap className="size-4 md:size-5 fill-primary" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="bg-white/40 backdrop-blur-md border border-white shadow-2xl rounded-3xl p-3 md:p-4 flex items-center gap-4 md:gap-6 group hover:scale-105 transition-all duration-500">
              <div
                onClick={() => window.open(whatsappUrl, "_blank")}
                className="size-10 md:size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform cursor-pointer"
              >
                <Plus className="size-5 md:size-6" />
              </div>
              <div className="pl-4 text-left">
                <p className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5 md:mb-1">
                  حالة النظام
                </p>
                <div className="flex items-baseline gap-1.5 md:gap-2">
                  <span className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">
                    {balance ?? "---"}
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-primary">
                    نقطة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Views */}
        <div className="w-full">
          <div
            className={
              modeParam !== "chat"
                ? "hidden"
                : "animate-in fade-in duration-700"
            }
          >
            <ChatModeView userBalance={balance} />
          </div>
          <div
            className={
              modeParam !== "video"
                ? "hidden"
                : "animate-in fade-in slide-in-from-bottom-4 duration-700"
            }
          >
            <VideoGenView userBalance={balance} />
          </div>
          <div
            className={
              modeParam !== "image"
                ? "hidden"
                : "animate-in fade-in slide-in-from-bottom-4 duration-700"
            }
          >
            <ImageGenView userBalance={balance} />
          </div>
          <div
            className={
              modeParam !== "history"
                ? "hidden"
                : "animate-in fade-in duration-700"
            }
          >
            <HistoryView isActive={modeParam === "history"} />
          </div>
        </div>
      </div>

      {/* Futuristic Floating Dock Navigation - Orchida Light */}
      <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-fit">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => router.push("/ai")}
            className="size-12 md:size-14 bg-white/60 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center rounded-full text-zinc-400 hover:text-primary transition-all duration-300 shrink-0"
          >
            <ArrowRightLeft className="size-5 md:size-6" />
          </button>

          <nav className="flex items-center bg-white/60 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-full md:rounded-[2.5rem] p-1.5 md:p-2 gap-1 md:gap-2">
            {[
              { id: "video", label: "فيديو", icon: Video },
              { id: "image", label: "صور", icon: ImageIcon },
              { id: "chat", label: "ذكاء", icon: Bot },
              { id: "history", label: "سجل", icon: History },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleModeChange(item.id)}
                className={`relative group flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-full md:rounded-[2rem] transition-all duration-500 overflow-hidden ${
                  modeParam === item.id
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {modeParam === item.id && (
                  <motion.div
                    layoutId="dock-active"
                    className="absolute inset-0 bg-primary shadow-lg shadow-primary/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2 md:gap-3">
                  <item.icon
                    className={`size-4 md:size-5 transition-transform duration-500 ${modeParam === item.id ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${modeParam === item.id ? "block" : "hidden md:block"}`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
