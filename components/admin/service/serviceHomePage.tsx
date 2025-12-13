"use client";
import React from "react";
import { motion } from "framer-motion";
import ServicesFound from "./servicesFound";
import { Services } from "./servicesPage";
const serviceHomePage = ({ services }: { services: Services }) => {
  return (
    <div className="h-screen">
      <motion.h2
        className="text-2xl font-bold text-center mt-10"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        ما نوع الخدمة التي تريدها؟
      </motion.h2>
      <ServicesFound services={services} />
    </div>
  );
};

export default serviceHomePage;
