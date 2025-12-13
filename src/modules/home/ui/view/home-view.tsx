"use client";
import { Button } from "../../../../../components/ui/button";
import Slider from "@/components/SliderCode"; // استدعاء الكومبوننت الجديد
import LatestNewsUser from "../components/lastEvents";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import ServicesFound from "@/components/admin/service/servicesFound";
import { Services } from "@/components/admin/service/servicesPage";
import { InferSelectModel } from "drizzle-orm";
import { serviceRequests, sliders, news } from "@/src/db/schema";
export type ServiceRequests = InferSelectModel<typeof serviceRequests>;
export type SliderType = InferSelectModel<typeof sliders>;
export type NewsType = InferSelectModel<typeof news>;
const HomeView = ({
  services,
  sliders,
  news,
}: {
  services: Services;
  sliders: SliderType[];
  news: NewsType[];
}) => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto">
      {/* الكاروسيل الثاني (Slider) */}
      <div className="w-full h-screen overflow-x-hidden">
        <Slider sliders={sliders} />
      </div>

      <div className="p-6">
        <motion.h2
          className="text-2xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          خدمـــــــاتــــــــــنـــــــــــــــــا
        </motion.h2>
        <ServicesFound services={services} />
        <motion.div
          className="flex justify-center items-center mt-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Button className="w-1/3 hover:bg-white hover:text-primary hover:shadow-primary hover:shadow">
            <Link href="/services">أطلب الان</Link>
          </Button>
        </motion.div>
      </div>
      <div className="p-6">
        <LatestNewsUser news={news} />
      </div>
    </div>
  );
};

export default HomeView;
