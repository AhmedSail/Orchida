"use client";
import { Button } from "../../../../../components/ui/button";
import Slider from "@/components/SliderCode"; // استدعاء الكومبوننت الجديد
import { motion, Variants } from "framer-motion";
import { Link } from "next-view-transitions";
import ServicesFound from "@/components/admin/service/servicesFound";
import { Services } from "@/components/admin/service/servicesPage";
import { InferSelectModel } from "drizzle-orm";
import { serviceRequests, sliders, news } from "@/src/db/schema";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import { Section } from "@/app/admin/[adminId]/courses/sections/[id]/edit/page";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import LatestNewsUser from "../components/lastEvents";
const CoursesUser = dynamic(() => import("@/components/users/CoursesUser"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-3xl" />,
});
const StudentWorksHome = dynamic(
  () => import("../components/studentWorksHome"),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-gray-100 rounded-3xl" />
    ),
  }
);
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
  currency: string | null;
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
      <div className="w-full md:h-screen overflow-x-hidden ">
        <Slider sliders={sliders} />
      </div>

      <div className="p-6 container mx-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-start gap-3 text-right"
          dir="rtl"
        >
          <div className="w-1.5 h-10 bg-primary rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-right">
            خدماتنا <span className="text-primary">المتميزة</span>
          </h2>
        </motion.div>
        <ServicesFound services={services} />
        <motion.div
          className="flex justify-center items-center mt-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Button className="w-1/3 hover:bg-white hover:text-primary hover:shadow-primary hover:shadow">
            <Link href="/services">تصفح كل الخدمات</Link>
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
