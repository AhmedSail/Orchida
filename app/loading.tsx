"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Loading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [displayPercent, setDisplayPercent] = useState(0);

  useGSAP(
    () => {
      // 1. Animate the percentage number smoothly
      const counterObj = { value: 0 };
      gsap.to(counterObj, {
        value: 100,
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: () => {
          setDisplayPercent(Math.floor(counterObj.value));
        },
      });

      // 2. Animate the bottom progress bar
      gsap.to(barRef.current, {
        width: "100%",
        duration: 2.5,
        ease: "power2.inOut",
      });

      // 3. Technical text reveal
      gsap.from(".tech-info", {
        y: 15,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out",
      });

      // 4. Ambient scanning line
      gsap.fromTo(
        ".scanner",
        { top: "-10%" },
        { top: "110%", duration: 3, repeat: -1, ease: "none" },
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden font-sans select-none"
    >
      {/* Background Tech Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" 
        />
        <div className="scanner absolute left-0 right-0 h-[30vh] bg-gradient-to-b from-transparent via-[#711B20]/30 to-transparent blur-2xl" />
      </div>

      {/* Centered Counter Group */}
      <div className="relative flex flex-col items-center z-10">
        
        {/* The Big Number */}
        <div className="flex items-baseline overflow-hidden py-4">
          <div className="text-[22vw] md:text-[16vw] font-black text-white leading-[0.8] tracking-tighter tabular-nums">
            {displayPercent.toString().padStart(2, "0")}
          </div>
          <div className="text-[7vw] md:text-[4vw] font-black text-[#711B20] ml-2">
            %
          </div>
        </div>

        {/* Status Information */}
        <div className="flex flex-col items-center mt-4">
          <div className="overflow-hidden">
            <h2 className="tech-info text-[12px] md:text-[14px] uppercase tracking-[1em] text-white/40 font-bold">
              American Academy
            </h2>
          </div>
          <div className="overflow-hidden mt-2 flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#711B20]/40" />
            <p className="tech-info text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-[#711B20] font-black">
              System Initialization
            </p>
            <div className="h-[1px] w-8 bg-[#711B20]/40" />
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="absolute bottom-20 left-10 right-10 md:left-24 md:right-24">
        <div className="flex justify-between text-[9px] font-mono text-white/20 mb-2 tracking-widest uppercase">
          <span>Processing Assets</span>
          <span>Buffer: Optimal</span>
        </div>
        <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
          <div
            ref={barRef}
            className="absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] w-0"
          />
        </div>
      </div>

      {/* Technical Metadata Corners */}
      <div className="absolute top-10 left-10 hidden lg:block opacity-20 pointer-events-none">
        <div className="text-[9px] font-mono text-white space-y-1 tracking-widest">
          <p>LOC: 31.9454° N, 35.9284° E</p>
          <p>PROTOCOL: HTTPS/SECURE</p>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:block opacity-20 text-right pointer-events-none">
        <div className="text-[9px] font-mono text-white space-y-1 tracking-widest">
          <p>STATUS: OPTIMIZING RUNTIME</p>
          <p>© AMERICAN ACADEMY 2026</p>
        </div>
      </div>
    </div>
  );
}
