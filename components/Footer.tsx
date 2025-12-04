"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import { useIsMobile } from "../hooks/use-mobile";

export default function Footer() {
  const isMobile = useIsMobile();

  const navItems = [
    { title: "الرئيسية", href: "/" },
    { title: "آخر المستجدات", href: "/latest" },
    { title: "الخدمات الرقمية", href: "/digital-services" },
    { title: "اتصل بنا", href: "/contact" },
    { title: "من نحن", href: "/about" },
  ];

  // Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="bg-gray-200  py-10 mt-36 text-gray-800"
    >
      <div className="container mx-auto items-center space-y-6 md:space-y-0">
        <div className="grid grid-cols-3 max-lg:grid-cols-1 mb-10">
          {/* Left Side - Branding */}
          <motion.div
            variants={itemVariants}
            className={`${isMobile ? "text-center" : "text-left"}`}
          >
            <Link href="/" className="inline-block mb-10">
              <Image
                src="/logoNav.svg" // ضع مسار شعارك هنا
                alt="Arokida Logo"
                width={100}
                height={100}
                className="hover:rotate-6 transition-all duration-300"
              />
            </Link>

            <p
              className={`${
                isMobile ? "mx-auto px-2" : " text-start w-2/3"
              }  mb-10 max-md:text-md max-lg:text-lg`}
            >
              أروكيدة هي شركة تقنية تأسست عام 2019، وتعمل منذ ذلك الحين بشكل
              مستمر لتقديم حلول رقمية متكاملة للأفراد والشركات. منذ انطلاقها،
              ركزت الشركة على بناء بيئة عمل حديثة تجمع بين المساحات الرقمية،
              التدريب التقني، والخدمات الاستشارية، لتكون شريكًا موثوقًا في رحلة
              التحول الرقمي.
            </p>
          </motion.div>

          {/* Center - Navigation Links */}
          <motion.div variants={itemVariants} className="text-center mt-10">
            <div className="mb-10">
              <h1 className="font-bold text-2xl text-primary">
                روابــــــــــط سريــــــعــــــــــة
              </h1>
            </div>
            <ul
              className={`flex-col space-y-3 max-lg:text-lg max-md:text-sm ${
                isMobile ? "mt-10" : "mt-28"
              }`}
            >
              {navItems.map((item, index) => (
                <motion.li key={index} variants={itemVariants}>
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
          <motion.div
            variants={itemVariants}
            className={`${isMobile ? "text-center" : "text-right"} mt-10`}
          >
            <div className="mb-10 max-lg:mt-10">
              <h1 className="font-bold text-2xl text-primary">
                تــــــــــــابعــــــــــــنا
              </h1>
            </div>
            <motion.div
              variants={containerVariants}
              className={`flex-col ${
                isMobile ? "space-y-5 mt-10" : "space-y-3 mt-28"
              } max-lg:text-lg  max-md:text-sm`}
            >
              {[
                {
                  href: "https://www.facebook.com/profile.php?id=100010021352300",
                  label: "Facebook",
                  icon: <FaFacebook size={24} />,
                },
                {
                  href: "https://www.instagram.com/itsa7meedd/",
                  label: "Instagram",
                  icon: <FaInstagram size={24} />,
                },
                {
                  href: "https://x.com/home?lang=en",
                  label: "Twitter",
                  icon: <FaTwitter size={24} />,
                },
                {
                  href: "https://wa.me/+972592855602",
                  label: "Whatsapp",
                  icon: <FaWhatsapp size={24} />,
                },
                {
                  href: "https://www.linkedin.com/in/eng-ahmedqompoz/",
                  label: "LinkedIn",
                  icon: <FaLinkedinIn size={24} />,
                },
              ].map(({ href, label, icon }, idx) => (
                <motion.div key={label} variants={itemVariants}>
                  <a
                    href={href}
                    className={`flex items-center  ${
                      isMobile ? "justify-center text-lg" : "justify-end"
                    }  transition duration-300 font-semibold hover:text-primary gap-3 `}
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
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <hr className="my-12 border-t-2 border-gray-500 w-full" />

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
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
                href: "https://www.facebook.com/profile.php?id=100010021352300",
                icon: <FaFacebook size={15} />,
              },
              {
                href: "https://www.instagram.com/itsa7meedd/",
                icon: <FaInstagram size={15} />,
              },
              {
                href: "https://x.com/home?lang=en",
                icon: <FaTwitter size={15} />,
              },
              {
                href: "https://wa.me/+972592855602",
                icon: <FaWhatsapp size={15} />,
              },
              {
                href: "https://www.linkedin.com/in/eng-ahmedqompoz/",
                icon: <FaLinkedinIn size={15} />,
              },
            ].map((item, index) => (
              <motion.a
                key={index}
                variants={itemVariants}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary p-4 rounded-full border-2 hover:scale-110 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm shadow-primary border-primary mt-5"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
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
