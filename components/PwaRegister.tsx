"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("PWA Service Worker registered:", registration.scope);
          },
          (err) => {
            console.log("PWA Service Worker registration failed:", err);
          }
        );
      });
    }

    // 2. Intercept Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from showing the mini-infobar automatically
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the install button
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("PWA was installed");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out" dir="rtl">
      <div className="relative group bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-primary/10 p-2.5 rounded-[2rem] flex items-center gap-4 hover:shadow-primary/20 transition-all">
        {/* Glow effect behind */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

        {/* App Icon */}
        <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-zinc-50 to-white rounded-[1.5rem] shadow-sm border border-zinc-200/50 flex items-center justify-center relative overflow-hidden">
          <img src="/logo.png" alt="Orchida App" className="w-10 h-10 object-contain drop-shadow-sm" />
          {/* Shine animation */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/60 to-white/0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
        </div>

        {/* Text Info */}
        <div className="text-right flex flex-col pl-2 min-w-[120px]">
          <h4 className="font-black text-zinc-900 text-sm">تطبيق أوركيدة</h4>
          <p className="text-[10px] font-bold text-zinc-500 mt-0.5">تجربة أسرع وأكثر سلاسة</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pr-2 border-r border-zinc-200/50">
          <button
            onClick={handleInstallClick}
            className="h-10 px-5 bg-zinc-900 hover:bg-primary text-white rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-2 shadow-lg shadow-zinc-900/20 hover:shadow-primary/30 hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            تثبيت
          </button>
          <button 
            onClick={() => setIsDismissed(true)}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
