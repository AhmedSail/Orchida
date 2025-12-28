"use client";
import Image from "next/image";
import { Link } from "next-view-transitions";
import React from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaDigitalOcean,
  FaLaptopCode,
  FaLaptopHouse,
  FaUserGraduate,
  FaUsersCog,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

type CompanyFormValues = {
  name: string;
  phone: string;
  accountNumber?: string;
  ibanShekel?: string;
  ibanDinar?: string;
  ibanDollar?: string;
  videoUrl?: string;
  managerMessage?: string;
};

const AboutPage = ({ company }: { company: Partial<CompanyFormValues> }) => {
  const isMobile = useIsMobile();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center"
    >
      {/* Hero Section */}
      <div
        className={`relative w-full ${isMobile ? "h-[230px]" : "h-[850px]"}`}
      >
        <Image
          src="/about/aboutHero2.png"
          alt="AboutImg"
          fill
          priority
          quality={100}
          className="object-cover object-top"
          unoptimized
        />
        <div
          className={`absolute inset-0 bg-black ${
            isMobile ? "opacity-0" : "opacity-20"
          }`}
        />
      </div>

      {/* Main Content */}
      <div className="container">
        <h1 className="text-4xl font-bold mb-12 text-center mt-10">
          مــــــــــــــــن نــــــــــــــــحــــن
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto items-center justify-center">
          {/* النصوص (كروت) */}
          <motion.div
            dir="rtl"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto"
          >
            {[
              { icon: <FaCalendarAlt />, text: "تأسست عام 2019" },
              {
                icon: <FaBuilding />,
                text: "شركة تقنية تقدم حلول رقمية متكاملة",
              },
              {
                icon: <FaLaptopCode />,
                text: "بيئة عمل حديثة تجمع بين المساحات الرقمية",
              },
              {
                icon: <FaUsersCog />,
                text: "تدريب تقني وخدمات استشارية للتحول الرقمي",
              },
              {
                icon: <FaChalkboardTeacher />,
                text: "تقدم دورات تقنية متخصصة لرفع الكفاءة",
              },
              { icon: <FaLaptopHouse />, text: "توفر مساحات عمل رقمية حديثة" },
              {
                icon: <FaUserGraduate />,
                text: "تدريب عملي يساعد الأفراد والشركات على التطور",
              },
              {
                icon: <FaDigitalOcean />,
                text: "خدمات رقمية واستشارية متكاملة للتحول الرقمي",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col mx-1 mt-2 p-5 font-bold text-center items-center border-2 border-primary hover:bg-primary hover:text-white group transition-all duration-500 ease-in-out hover:shadow-lg hover:shadow-primary"
              >
                <div className="text-primary text-5xl group-hover:text-white transition-all duration-500 ease-in-out">
                  {item.icon}
                </div>
                <span className="text-lg mt-2">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* الصورة */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex justify-center"
          >
            <Image
              src="/about/aboutImg.jpeg"
              alt="AboutImg"
              width={530}
              height={530}
              className="object-cover object-top rounded-md"
              priority
              unoptimized
            />
          </motion.div>
        </div>

        {/* كلمة المدير */}
        {/* كلمة المدير */}
        {company.managerMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} // يبدأ مخفي وتحت
            whileInView={{ opacity: 1, y: 0 }} // يظهر تدريجيًا ويصعد لأعلى
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="mt-12 max-w-4xl mx-auto text-center p-6 border rounded-lg shadow-md bg-gray-50"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-primary mb-4"
            >
              💬 كلمة المدير
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg leading-relaxed"
            >
              {company.managerMessage}
            </motion.p>
          </motion.div>
        )}

        {/* الفيديو التعريفي */}
        {company.videoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="mt-12 max-w-4xl mx-auto text-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-primary mb-4"
            >
              🎥 الفيديو التعريفي بالشركة
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="aspect-w-16 aspect-h-9"
            >
              <iframe
                src={company.videoUrl}
                title="Company Intro Video"
                className="w-full h-[400px] rounded-lg shadow-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AboutPage;
