"use client";
import React from "react";
import {
  FaCode,
  FaPaintBrush,
  FaChalkboardTeacher,
  FaBullhorn,
  FaSearch,
  FaGraduationCap,
  FaShoppingCart,
  FaBuilding,
} from "react-icons/fa";
import { Button } from "./ui/button";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// بدل servicesFound إلى ServicesFound
export default function ServicesFound() {
  const services = [
    {
      id: 1,
      title: "برمجة",
      icon: <FaCode className="text-primary text-3xl" />,
    },
    {
      id: 2,
      title: "تصميم",
      icon: <FaPaintBrush className="text-primary text-3xl" />,
    },
    {
      id: 3,
      title: "دورات",
      icon: <FaChalkboardTeacher className="text-primary text-3xl" />,
    },
    {
      id: 4,
      title: "تسويق",
      icon: <FaBullhorn className="text-primary text-3xl" />,
    },
    {
      id: 5,
      title: "ابحاث",
      icon: <FaSearch className="text-primary text-3xl" />,
    },
    {
      id: 6,
      title: "مشاريع تخرج",
      icon: <FaGraduationCap className="text-primary text-3xl" />,
    },
    {
      id: 7,
      title: "تجارة الكترونية",
      icon: <FaShoppingCart className="text-primary text-3xl" />,
    },
    {
      id: 8,
      title: "مساحات عمل متقدمة",
      icon: <FaBuilding className="text-primary text-3xl" />,
    },
  ];

  // ✅ إعداد الأنيميشن
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: ["easeOut"] }, // ✅ ease لازم يكون array أو نوع Easing
    }),
  };

  return (
    <div className="p-6 container mx-auto">
      <motion.h2
        className="text-2xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        خدمـــــــاتــــــــــنـــــــــــــــــا
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            className="group flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-6 transition duration-300 hover:shadow hover:bg-primary hover:shadow-primary hover:scale-105"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            custom={i}
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* الأيقونة */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 transition duration-300 group-hover:bg-white">
              <span className="transition duration-300 group-hover:text-primary">
                {service.icon}
              </span>
            </div>

            {/* النص */}
            <h3 className="text-lg font-semibold text-gray-800 transition duration-300 group-hover:text-white">
              {service.title}
            </h3>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="flex justify-center items-center mt-10"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1 }}
        viewport={{ once: true }}
      >
        <Button className="w-1/3 hover:bg-white hover:text-primary hover:shadow-primary hover:shadow">
          <Link href="/contact">أطلب الان</Link>
        </Button>
      </motion.div>
    </div>
  );
}
