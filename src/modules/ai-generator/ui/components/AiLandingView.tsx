"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Video,
  Image as ImageIcon,
  MessageSquare,
  History,
  ArrowRightLeft,
  Crown,
  Zap,
  Star,
  Sparkles,
  Gift,
} from "lucide-react";

interface AiServiceCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  badge: "مجاني" | "احترافي";
  extraBadge?: string;
  gradient: string;
  onClick: () => void;
}

const AiServiceCard: React.FC<AiServiceCardProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  extraBadge,
  gradient,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem] -z-10`}
      />

      <div className="bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 rounded-[2.5rem] p-8 h-full flex flex-col transition-all duration-300 group-hover:border-zinc-200 group-hover:shadow-2xl">
        {/* Header with Icon and Badge */}
        <div className="flex items-start justify-between mb-8">
          <div
            className={`p-4 rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
          >
            <Icon className="w-8 h-8" />
          </div>
          <div
            className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              badge === "احترافي"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            {badge === "احترافي" ? (
              <Crown className="w-3 h-3" />
            ) : (
              <Star className="w-3 h-3" />
            )}
            {badge}
          </div>
        </div>

        {extraBadge && (
          <div className="mb-4">
            <span className="bg-red-50 text-red-500 text-[10px] font-black px-3 py-1 rounded-lg border border-red-100 animate-pulse">
              {extraBadge}
            </span>
          </div>
        )}

        {/* Content */}
        <h3 className="text-2xl font-black text-zinc-800 mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-1">
          {description}
        </p>

        {/* Action Button */}
        <div className="flex items-center gap-2 text-zinc-400 group-hover:text-primary transition-colors">
          <span className="text-xs font-bold uppercase">ابدأ الآن</span>
          <ArrowRightLeft className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

import { useRouter } from "next/navigation";

export default function AiLandingView() {
  const router = useRouter();
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 relative z-10" dir="rtl">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-2xl mb-6"
        >
          <Zap className="w-10 h-10 text-amber-500 fill-amber-500" />
          <span className="text-xl font-black text-zinc-600 uppercase tracking-widest">
            أوركيدة للذكاء الاصطناعي
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black text-zinc-900 mb-6 tracking-tight"
        >
          ابدأ رحلتك في اروكيدة <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary  to-purple-600">
            عالم الإبداع الرقمي
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
        >
          استكشف مجموعة أدواتنا المتطورة المدعومة بأحدث تقنيات الذكاء الاصطناعي
          لتوليد الفيديوهات والصور والدردشة الذكية.
        </motion.p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <AiServiceCard
          title="المولد الاحترافي"
          description="حول نصوصك وصورك إلى فيديوهات سنمائية مذهلة بدقة عالية باستخدام أقوى محركات الذكاء الاصطناعي سورا وفيدو."
          icon={Video}
          badge="احترافي"
          gradient="from-blue-600 to-indigo-600"
          onClick={() => router.push("/ai/pro?mode=video")}
        />
        <AiServiceCard
          title="المولد المجاني"
          description="توليد لوحات فنية وتصاميم واقعية من كلماتك فقط. يدعم جميع الأنماط والأبعاد المناسبة للسوشيال ميديا."
          icon={ImageIcon}
          badge="مجاني"
          gradient="from-purple-600 to-pink-600"
          onClick={() => router.push("/ai/free")}
        />
        <AiServiceCard
          title="مكتبة أوامر الصور (Photo Prompts)"
          description="تصفح آلاف الأوامر الجاهزة لتوليد أفكار مبهرة في التصميم والفن."
          icon={Sparkles}
          badge="مجاني"
          gradient="from-amber-500 to-orange-500"
          onClick={() => router.push("/ai/photo-prompts")}
        />
        <AiServiceCard
          title="مكتبة أوامر الفيديو (Video Prompts)"
          description="استلهم من أفضل الأوامر للحصول على فيديوهات سينمائية وواقعية مبهرة."
          icon={Video}
          badge="مجاني"
          gradient="from-teal-500 to-emerald-500"
          onClick={() => router.push("/ai/video-prompts")}
        />
      </div>

      {/* History Shortcut */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/ai/pro?mode=history")}
          className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-[2rem] font-bold shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all"
        >
          <History className="w-5 h-5" />
          <span>عرض سجل أعمالك السابقة</span>
        </motion.button>
      </div>
    </div>
  );
}
