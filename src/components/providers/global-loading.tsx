"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function GlobalLoading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Soft fade out and slide up
          gsap.to(containerRef.current, {
            y: "-100%",
            opacity: 0,
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: () => setIsVisible(false),
          });
        },
      });

      // 1. Smooth percentage counter
      const counterObj = { value: 0 };
      tl.to(counterObj, {
        value: 100,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => {
          setDisplayPercent(Math.floor(counterObj.value));
        },
      });

      // 2. Elegant progress bar sync
      tl.to(
        barRef.current,
        {
          width: "100%",
          duration: 3,
          ease: "power2.inOut",
        },
        0
      );

      // 3. Logo Breathing & Entrance
      gsap.from(".loading-logo", {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: "back.out(1.7)",
      });

      gsap.to(".loading-logo", {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 4. Text reveal
      tl.from(
        ".brand-text",
        {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        },
        0.5
      );
      
      // 5. Background Glow Animation
      gsap.to(".bg-glow", {
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    },
    { scope: containerRef }
  );

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white overflow-hidden select-none"
      style={{ fontFamily: "BigVestaRegular, sans-serif" }}
    >
      {/* Soft Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="bg-glow absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#675795]/10 blur-[120px]" />
        <div className="bg-glow absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#675795]/10 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center max-w-xl w-full px-6">
        {/* Logo Section */}
        <div className="loading-logo mb-16 relative">
          <div className="absolute inset-[-20%] bg-[#675795]/5 blur-3xl rounded-full" />
          <Image
            src="/logo.png"
            alt="Orchida Logo"
            width={220}
            height={220}
            className="relative object-contain"
            priority
          />
        </div>

        {/* Counter Display */}
        <div className="flex items-baseline overflow-hidden py-2 mb-4">
          <span className="text-[18vw] md:text-[10vw] font-bold text-[#675795] leading-none tracking-tight tabular-nums">
            {displayPercent.toString().padStart(2, "0")}
          </span>
          <span className="text-[5vw] md:text-[3vw] font-medium text-[#675795]/60 ml-2">
            %
          </span>
        </div>

        {/* Brand Information */}
        <div className="flex flex-col items-center text-center">
          <h2 className="brand-text text-lg md:text-xl font-bold tracking-widest text-[#675795] uppercase mb-1">
            Orchida
          </h2>
          <p className="brand-text text-xs md:text-sm tracking-[0.3em] text-[#675795]/40 font-medium">
            DIGITAL SERVICES & ACADEMY
          </p>
        </div>
      </div>

      {/* Elegant Progress Bar Container */}
      <div className="absolute bottom-20 left-12 right-12 md:left-1/4 md:right-1/4">
        <div className="h-[3px] w-full bg-[#675795]/10 rounded-full relative overflow-hidden">
          <div
            ref={barRef}
            className="absolute top-0 left-0 h-full bg-[#675795] rounded-full shadow-[0_0_15px_rgba(103,87,149,0.4)] w-0"
          />
        </div>
        <div className="flex justify-center mt-3">
          <span className="text-[10px] font-medium text-[#675795]/30 tracking-widest uppercase animate-pulse">
            Loading Excellence...
          </span>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-8 text-[9px] tracking-widest text-[#675795]/20 uppercase font-medium">
        © 2026 ORCHIDA DIGITAL SERVICES
      </div>
    </div>
  );
}
