"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
};

const CoursesUser = ({ allCourses }: { allCourses: UserCourse[] }) => {
  return (
    <div className="container mx-auto px-4" dir="rtl">
      <motion.h2
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        دوراتنـــــــــــــــا المتـــــــاحــــــــة
      </motion.h2>

      {/* ✅ شبكة ريسبونسيف مع أنيميشن */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {allCourses.slice(0, 6).map((course) => (
          <motion.div
            key={course.id}
            className="border rounded-lg shadow p-4 flex flex-col justify-between group bg-white"
            variants={cardVariants}
            whileHover={{
              scale: 1.03,
              boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {course.imageUrl && (
              <motion.div
                className="w-full h-64 mb-4 overflow-hidden rounded-md"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-md transition-transform duration-300"
                  width={400}
                  height={300}
                  unoptimized
                />
              </motion.div>
            )}

            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {course.description?.slice(0, 100)}...
            </p>

            <div className="flex justify-start items-start gap-2 mb-2">
              <p>عدد الساعات :</p>
              <p className=" text-primary font-bold">{course.hours} ساعة</p>
            </div>
            <div className="flex justify-start items-start gap-2 mb-4">
              <p>سعر الدورة:</p>
              <p className=" text-primary font-bold">{course.price} $</p>
            </div>

            <Button className="w-full group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Link href={`/courses/${course.id}`}>تفاصيل الدورة</Link>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* زر عرض الكل */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <Button className="w-1/2 mt-10 mx-auto block hover:bg-primary hover:text-white transition-colors duration-300">
          <Link href={`/courses`}>عــــــرض الــــــــكــــــــــل</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default CoursesUser;
