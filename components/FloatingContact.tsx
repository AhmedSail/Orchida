"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  X,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLinks {
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  whatsappUrl?: string | null;
  linkedinUrl?: string | null;
  tiktokUrl?: string | null;
  phoneToCall?: string | null;
}

const FloatingContact = ({ links }: { links: SocialLinks }) => {
  const [isOpen, setIsOpen] = useState(false);

  const socialItems = [
    {
      icon: MessageCircle,
      label: "واتساب",
      href: links.whatsappUrl
        ? `https://wa.me/${links.whatsappUrl.replace(/\D/g, "")}`
        : null,
      color: "bg-[#25D366]",
      hover: "hover:bg-[#128C7E]",
    },
    {
      icon: Facebook,
      label: "فيسبوك",
      href: links.facebookUrl,
      color: "bg-[#1877F2]",
      hover: "hover:bg-[#0C63D1]",
    },
    {
      icon: Instagram,
      label: "انستجرام",
      href: links.instagramUrl,
      color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
      hover: "brightness-110",
    },
    {
      icon: Linkedin,
      label: "لينكد إن",
      href: links.linkedinUrl,
      color: "bg-[#0A66C2]",
      hover: "hover:bg-[#084D91]",
    },
    {
      icon: Phone,
      label: "اتصال",
      href: links.phoneToCall ? `tel:${links.phoneToCall}` : null,
      color: "bg-primary",
      hover: "hover:bg-primary/90",
    },
  ].filter((item) => item.href);

  if (socialItems.length === 0) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-100 hidden lg:flex items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col gap-3 p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-l-[32px] border-y border-l border-zinc-200 dark:border-zinc-800 shadow-2xl"
          >
            {socialItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href!}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group relative flex items-center justify-center size-12 rounded-2xl text-white transition-all duration-300 shadow-lg",
                  item.color,
                  item.hover,
                )}
                title={item.label}
              >
                <item.icon className="size-6 transition-transform group-hover:scale-110" />

                {/* Tooltip */}
                <span className="absolute right-full mr-4 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                  {item.label}
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "size-12 flex items-center justify-center bg-white dark:bg-zinc-900 text-primary border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-500",
          isOpen
            ? "rounded-r-none rounded-l-none border-r-0"
            : "rounded-l-[20px] rounded-r-none border-r-0",
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {isOpen ? (
            <ChevronRight className="size-6" />
          ) : (
            <Share2 className="size-6 animate-pulse" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingContact;
