import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Palette, Zap } from "lucide-react";

interface ImageGenProvidersProps {
  provider: string;
  setProvider: (provider: string) => void;
}

export const ImageGenProviders: React.FC<ImageGenProvidersProps> = ({ 
  provider, 
  setProvider 
}) => {
  const providers = [
    {
      id: "Imagen",
      name: "Google Imagen",
      badge: "Gemini 3 Pro",
      icon: Palette,
      color: "text-blue-500",
    },
    {
      id: "Grok",
      name: "xAI Grok-3",
      badge: "Aurora XL",
      icon: Zap,
      color: "text-emerald-500",
    },
    {
      id: "Meta AI",
      name: "Meta Llama",
      badge: "Llama Vision",
      icon: Sparkles,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        محرك الإنتاج الذكي
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={`group relative flex items-center gap-4 px-6 py-5 rounded-[1.5rem] border transition-all duration-500 ${
              provider === p.id
                ? "bg-white border-primary shadow-[0_20px_40px_rgba(99,102,241,0.1)] ring-1 ring-primary/20 scale-[1.02]"
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {/* Active indicator */}
            {provider === p.id && (
              <motion.div
                layoutId="active-indicator"
                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            <div
              className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                provider === p.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-600"
              }`}
            >
              <p.icon className={`size-6 ${provider === p.id ? "animate-pulse" : ""}`} />
            </div>
            
            <div className="text-right">
              <span
                className={`block text-xs font-black tracking-tight transition-colors ${
                  provider === p.id ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                {p.name}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${
                provider === p.id ? "text-primary" : "text-zinc-400"
              }`}>
                {p.badge}
              </span>
            </div>

            {/* Selection Dot */}
            {provider === p.id && (
              <div className="absolute top-4 left-4 size-2 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
