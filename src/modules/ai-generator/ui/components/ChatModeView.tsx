"use client";

import React, { useState } from "react";
import { Sparkles, Image as ImageIcon2, Settings, Monitor, Clock, ArrowUp } from "lucide-react";

export default function ChatModeView() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-10 mt-10 w-full relative z-10">
      {/* Background grid is handled in the parent, but we add content here */}
      
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex text-[#ff7622]">
          <Sparkles className="w-8 h-8 shrink-0" fill="currentColor" />
        </div>
        <span className="text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500" style={{ fontFamily: 'sans-serif' }}>
          <span className="font-bold">GeminiGen</span> <span className="font-normal opacity-80">AI</span>
        </span>
      </div>

      <h1 className="text-3xl md:text-[40px] font-bold text-zinc-800 mb-4 tracking-tight">Create Stunning Videos with AI in Seconds</h1>
      <p className="text-zinc-500 text-sm md:text-base font-medium mb-12 max-w-2xl text-center">
        Transform your ideas into captivating videos using our advanced AI video generator. No experience needed!
      </p>

      {/* Input Box Area */}
      <div className="w-full max-w-4xl bg-white border border-zinc-200 shadow-sm rounded-[24px] p-2 flex flex-col mb-8 transition-shadow focus-within:shadow-md focus-within:border-zinc-300">
        <textarea 
          className="w-full bg-transparent resize-none outline-none p-4 text-zinc-800 placeholder:text-zinc-400 text-lg min-h-[80px]"
          placeholder="Describe the video you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex items-center justify-between px-2 pb-2 overflow-x-auto">
          {/* Left Pills */}
          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 transition rounded-full text-xs font-semibold text-zinc-600">
              <ImageIcon2 className="w-3.5 h-3.5" /> First Frame
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 transition rounded-full text-xs font-semibold text-zinc-600">
              <Settings className="w-3.5 h-3.5" /> Veo 3.1 Fast
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 transition rounded-full text-xs font-semibold text-zinc-600">
              <Monitor className="w-3.5 h-3.5" /> 16:9
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 transition rounded-full text-xs font-semibold text-zinc-600">
              <Monitor className="w-3.5 h-3.5" /> 720p
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 transition rounded-full text-xs font-semibold text-zinc-600">
              <Clock className="w-3.5 h-3.5" /> 8s
            </button>
          </div>
          
          {/* Right Send Area */}
          <div className="flex items-center gap-3 pl-2 shrink-0">
            <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap hidden sm:block">Pro Studio</span>
            <button 
              disabled={!prompt}
              className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Special Offer Pill */}
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#fc6022] to-[#fd2270] text-white px-6 py-3 rounded-full font-bold shadow-md shadow-pink-500/20 text-sm hover:scale-105 transition-transform cursor-pointer">
        🔥 Special Offer: Unlimited Video Generation - Only $15/month! ✨
      </div>
    </div>
  );
}
