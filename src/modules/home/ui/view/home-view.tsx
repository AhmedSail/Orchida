"use client";
import { Button } from "../../../../../components/ui/button";
import Slider from "@/components/SliderCode"; // استدعاء الكومبوننت الجديد
import LatestNewsUser from "../components/lastEvents";
import { motion, Variants } from "framer-motion";
import { Link } from "next-view-transitions";
import ServicesFound from "@/components/admin/service/servicesFound";
import { Services } from "@/components/admin/service/servicesPage";
import { InferSelectModel } from "drizzle-orm";
import { serviceRequests, sliders, news } from "@/src/db/schema";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import { Section } from "@/app/admin/[adminId]/courses/sections/[id]/edit/page";
import CoursesUser from "@/components/users/CoursesUser";
import { Card, CardContent } from "@/components/ui/card";

import StudentWorksHome from "../components/studentWorksHome";
import { useEffect, useState } from "react";
export type ServiceRequests = InferSelectModel<typeof serviceRequests>;
export type SliderType = InferSelectModel<typeof sliders>;
export type NewsType = InferSelectModel<typeof news>;
type UserCourse = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  hours: number | null;
  price: string | null;
  duration: string | null;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
};
const HomeView = ({
  services,
  sliders,
  news,
  allCourses,
  sections,
  studentStories,
}: {
  services: Services;
  sliders: SliderType[];
  news: NewsType[];
  allCourses: UserCourse[];
  sections: Section[];
  studentStories: {
    id: string;
    title: string;
    description: string | null;
    type: "story" | "image" | "video";
    mediaUrl: string | null;
    studentName: string | null;
  }[];
}) => {
  return (
    <div className="min-h-screen w-full ">
      {/* الكاروسيل الثاني (Slider) */}
      <div className="w-full h-screen overflow-x-hidden ">
        <Slider sliders={sliders} />
      </div>

      <div className="p-6">
        <motion.h2
          className="text-2xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          خدمـــــــاتــــــــــنـــــــــــــــــا
        </motion.h2>
        <ServicesFound services={services} />
        <motion.div
          className="flex justify-center items-center mt-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Button className="w-1/3 hover:bg-white hover:text-primary hover:shadow-primary hover:shadow">
            <Link href="/services">أطلب الان</Link>
          </Button>
        </motion.div>
      </div>
      <div className="p-6">
        <LatestNewsUser news={news} />
      </div>
      <div className="p-6">
        <CoursesUser allCourses={allCourses} />
      </div>
      <div>
        <StudentWorksHome studentStories={studentStories} />
      </div>
    </div>
  );
};

export default HomeView;
