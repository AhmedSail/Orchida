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
// قم باستيراد Variants
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
  // حدد النوع Variants لكل متغير
  const footerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const brandingVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const navLinksVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const socialLinksVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const bottomSectionVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ amount: 0.2, once: true }}
      variants={footerVariants}
      className="bg-gray-200  py-10 mt-36 text-gray-800"
    >
      <div className="container mx-auto items-center space-y-6 md:space-y-0">
        <div className="grid grid-cols-3 max-lg:grid-cols-1 mb-10">
          {/* Left Side - Branding */}
          <motion.div
            variants={brandingVariants}
            className={`max-lg:text-center`}
          >
            <Link href="/" className="inline-block mb-10">
              <motion.div whileHover={{ scale: 1.05, rotate: -5 }}>
                <Image
                  src="/logoNav.svg" // ضع مسار شعارك هنا
                  alt="Arokida Logo"
                  width={100}
                  height={100}
                  className="transition-all duration-300"
                  loading="eager"
                />
              </motion.div>
            </Link>

            <p
              className={`w-2/3 max-lg:mx-auto lg:w-full mb-10 max-md:text-md max-lg:text-lg`}
            >
              أروكيدة هي شركة تقنية تأسست عام 2019، وتعمل منذ ذلك الحين بشكل
              مستمر لتقديم حلول رقمية متكاملة للأفراد والشركات. منذ انطلاقها،
              ركزت الشركة على بناء بيئة عمل حديثة تجمع بين المساحات الرقمية،
              التدريب التقني، والخدمات الاستشارية، لتكون شريكًا موثوقًا في رحلة
              التحول الرقمي.
            </p>
          </motion.div>

          {/* Center - Navigation Links */}
          <motion.div className="text-center mt-10">
            <motion.div variants={navLinksVariants} className="mb-10">
              <h1 className="font-bold text-2xl text-primary">
                روابــــــــــط سريــــــعــــــــــة
              </h1>
            </motion.div>
            <ul
              className={`flex-col space-y-3 max-lg:text-lg max-md:text-sm ${
                isMobile ? "mt-10" : "mt-28"
              }`}
            >
              {navItems.map((item, index) => (
                <motion.li
                  key={index}
                  custom={index}
                  variants={navLinksVariants}
                >
                  <Link
                    href={item.href}
                    className="font-semibold relative group text-lg"
                  >
                    {item.title}
                    <span className="absolute  -bottom-1 left-0 w-full h-[2px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Side - Social Media Links */}
          <motion.div className={`text-center lg:text-right mt-10`}>
            <motion.div
              variants={socialLinksVariants}
              className="mb-10 max-lg:mt-10"
            >
              <h1 className="font-bold text-2xl text-primary max-lg:text-center">
                تــــــــــــابعــــــــــــنا
              </h1>
            </motion.div>
            <motion.div
              className={`flex-col ${
                isMobile ? "space-y-5 mt-10" : "space-y-3 mt-28"
              } max-lg:text-lg  max-md:text-sm text-center`}
            >
              {[
                {
                  link: result.facebookUrl,
                  label: "Facebook",
                  icon: <FaFacebook size={24} />,
                },
                {
                  ink: result.instagramUrl,
                  label: "Instagram",
                  icon: <FaInstagram size={24} />,
                },
                {
                  link: result.twitterUrl,
                  label: "Twitter",
                  icon: <FaTwitter size={24} />,
                },
                {
                  link: result.whatsappUrl,
                  label: "Whatsapp",
                  icon: <FaWhatsapp size={24} />,
                },
                {
                  link: result.linkedinUrl,
                  label: "LinkedIn",
                  icon: <FaLinkedinIn size={24} />,
                },
                {
                  link: result.tiktokUrl,
                  label: "TikTok",
                  icon: <FaTiktok size={24} />,
                },
              ].map(({ link, label, icon }, idx) => (
                <motion.div
                  key={label}
                  custom={idx}
                  variants={socialLinksVariants}
                  className="text-center"
                >
                  <Link
                    href={link ?? "#"}
                    className={`flex items-center justify-center lg:justify-end  transition duration-300 font-semibold hover:text-primary gap-3 `}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {isMobile ? (
                      <>
                        {icon}
                        <span className="ml-3">{label}</span>
                      </>
                    ) : (
                      <>
                        <span className="mr-3">{label}</span>
                        {icon}
                      </>
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <hr className="my-12 border-t-2 border-gray-500 w-full" />

        {/* Bottom Section */}
        <motion.div
          variants={bottomSectionVariants}
          className="md:flex justify-between items-center mt-10 mb-0 pb-0 "
        >
          <div className="block mt-10">
            <h1 className="text-gray-800 text-center">
              &copy; {new Date().getFullYear()} جميع الحقوق محفوظة |{" "}
              <span className="text-primary font-bold font-custom">
                شركة أروكيدة للتقنية
              </span>
            </h1>
          </div>
          <div className="flex justify-center space-x-6 flex-wrap">
            {[
              {
                icon: <FaFacebook size={15} />,
                link: result.facebookUrl,
              },
              {
                icon: <FaInstagram size={15} />,
                link: result.instagramUrl,
              },
              {
                icon: <FaTwitter size={15} />,
                link: result.twitterUrl,
              },
              {
                icon: <FaWhatsapp size={15} />,
                link: result.whatsappUrl,
              },
              {
                icon: <FaLinkedinIn size={15} />,
                link: result.linkedinUrl,
              },
              {
                icon: <FaTiktok size={15} />,
                link: result.tiktokUrl,
              },
            ].map((item, index) => (
              <motion.a
                key={index}
                href={item.link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary p-4 rounded-full border-2 hover:scale-110 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm shadow-primary border-primary mt-5"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
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
