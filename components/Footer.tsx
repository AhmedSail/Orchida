"use client";

import { Link } from "next-view-transitions";
import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useIsMobile } from "../hooks/use-mobile";

type Links = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  whatsappUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
};

export default function Footer({ result }: { result: Links }) {
  const isMobile = useIsMobile();

  const navItems = [
    { title: "الرئيسية", href: "/" },
    { title: "آخر المستجدات", href: "/latest" },
    { title: "الخدمات الرقمية", href: "/digital-services" },
    { title: "اتصل بنا", href: "/contact" },
    { title: "من نحن", href: "/about" },
  ];

  // Motion Variants
  const footerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const socialLinks = [
    {
      link: result.facebookUrl,
      label: "Facebook",
      icon: <FaFacebook size={22} />,
    },
    {
      link: result.instagramUrl,
      label: "Instagram",
      icon: <FaInstagram size={22} />,
    },
    {
      link: result.twitterUrl,
      label: "Twitter",
      icon: <FaTwitter size={22} />,
    },
    {
      link: result.whatsappUrl,
      label: "Whatsapp",
      icon: <FaWhatsapp size={22} />,
    },
    {
      link: result.linkedinUrl,
      label: "LinkedIn",
      icon: <FaLinkedinIn size={22} />,
    },
    { link: result.tiktokUrl, label: "TikTok", icon: <FaTiktok size={22} /> },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ amount: 0.1, once: true }}
      variants={footerVariants}
      dir="rtl"
      className="relative bg-primary pt-24 pb-12 mt-32 text-indigo-100 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-20">
          {/* Left Side - Branding */}
          <motion.div variants={itemVariants} className="max-lg:text-center">
            <Link href="/" className="inline-block mb-8 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="relative"
              >
                <Image
                  src="/logoWhite.svg"
                  alt="Orchida Logo"
                  width={120}
                  height={120}
                  sizes="120px"
                  loading="lazy"
                />
              </motion.div>
            </Link>

            <p className="text-lg leading-relaxed text-indigo-100/80 max-w-md max-lg:mx-auto">
              أروكيدة شركة تقنية تأسست عام 2019، وتعمل منذ ذلك الحين بشكل مستمر
              لتقديم حلول رقمية متكاملة للأفراد والشركات. منذ انطلاقها، ركزت
              الشركة على بناء بيئة عمل حديثة تجمع بين المساحات الرقمية والخدمات
              الاستشارية.
            </p>
          </motion.div>

          {/* Center - Navigation Links */}
          <motion.div variants={itemVariants} className="text-center">
            <h3 className="text-2xl font-bold text-white mb-10 relative inline-block">
              روابـــــــط سريـــــــعـة
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-white rounded-full" />
            </h3>
            <ul className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-lg font-medium text-indigo-100 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform duration-300" />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Side - Social Media Links */}
          <motion.div
            variants={itemVariants}
            className="lg:text-left text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-10 relative inline-block lg:float-left">
              تــــــــــابعــــــــــنا
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-white rounded-full lg:right-auto lg:left-0" />
            </h3>
            <div className="clear-both" />
            <div className="grid grid-cols-2 gap-4 mt-8">
              {socialLinks.map(({ link, label, icon }, idx) => (
                <Link
                  key={label}
                  href={link ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/30 text-white transition-all duration-300 group"
                >
                  <span className="text-white/70 group-hover:text-white transition-colors">
                    {icon}
                  </span>
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent my-12" />

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center gap-8"
        >
          <div className="text-center md:text-right">
            <p className="text-indigo-100/70">
              &copy; {new Date().getFullYear()} جميع الحقوق محفوظة |{" "}
              <span className="text-white font-bold">شركة أروكيدة للتقنية</span>
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {socialLinks.map((item, index) => (
              <motion.a
                key={index}
                href={item.link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white hover:text-primary transition-all duration-300 shadow-lg"
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
