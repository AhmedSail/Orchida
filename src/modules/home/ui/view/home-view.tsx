"use client";
import { Button } from "../../../../../components/ui/button";
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
    <div className="min-h-screen w-full bg-white">
      {/* 1. السلايدر الرئيسي (آخر المستجدات) */}
      <section className="w-full">
        <LatestNewsUser news={news} />
      </section>

      {/* 2. الخدمات وباقي المحتوى */}
      <div className="relative z-10 bg-white rounded-t-[3.5rem] -mt-12 pt-20 pb-12 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-start gap-4 mb-12"
            dir="rtl"
          >
            <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
            <h2 className="text-2xl md:text-3xl  text-gray-900">
              خدماتنا <span className="text-primary">المتميزة</span>
            </h2>
          </motion.div>

          <ServicesFound services={services} />

          <motion.div
            className="flex justify-center items-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              asChild
              className="h-16 px-14 rounded-full bg-gray-900 text-white hover:bg-primary transition-all duration-500 shadow-2xl hover:scale-105 text-lg font-bold"
            >
              <Link href="/services">استكشف جميع الخدمات</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="p-6">
        <CoursesUser allCourses={allCourses} />
      </div>
      <div className="py-12 bg-gray-50/50">
        <StudentWorksHome studentStories={studentStories} />
      </div>
    </div>
  );
};

export default HomeView;
