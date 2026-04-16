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
