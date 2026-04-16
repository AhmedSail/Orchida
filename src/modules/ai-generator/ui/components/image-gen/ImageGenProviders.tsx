import React from "react";

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
      name: "G Imagen",
      desc: "Gemini 3 Pro",
      disabled: false,
    },
    {
      id: "Grok",
      name: "✖ Grok",
      desc: "Aurora XL",
      disabled: false,
    },
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-zinc-700 mb-3">
        محرك التوليد
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setProvider("Meta AI")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-300 ${
            provider === "Meta AI"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-200 scale-[1.02]"
              : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          <div className={`p-1 rounded-md ${provider === "Meta AI" ? "bg-white/20" : "bg-zinc-100"}`}>
            <span className={`w-4 h-4 ${provider === "Meta AI" ? "text-white" : "text-zinc-500"}`}>⚡</span>
          </div>
          <span className="font-bold text-sm">Meta AI</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${provider === "Meta AI" ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"}`}>
            Meta
          </span>
        </button>
        {providers.map((p) => (
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
  );
};
