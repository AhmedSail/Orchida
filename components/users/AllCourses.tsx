"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import Image from "next/image";

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
  section: {
    id: string;
    number: number;
    startDate: string;
    endDate: string;
    status:
      | "pending_approval"
      | "approved"
      | "open"
      | "in_progress"
      | "completed"
      | "closed"
      | "cancelled"
      | null;
  } | null;
};
type SectionStatus =
  | "pending_approval"
  | "approved"
  | "open"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled"
  | null;

// ✅ دالة ترجع اللون المناسب حسب الحالة
const getStatusColor = (status: SectionStatus) => {
  switch (status) {
    case "open":
      return "text-green-600";
    case "in_progress":
      return "text-blue-600";
    case "closed":
      return "text-red-600";
    case "completed":
      return "text-purple-600";
    case "approved":
      return "text-teal-600";
    case "pending_approval":
      return "text-yellow-600";
    case "cancelled":
      return "text-gray-500";
    default:
      return "text-gray-700";
  }
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // ✅ كل كارد يتأخر 0.2 ثانية
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
};

const AllCourses = ({
  allCourses,
  studentStories,
}: {
  allCourses: UserCourse[];
  studentStories: {
    id: string;
    title: string;
    description: string | null;
    type: "story" | "image" | "video";
    mediaUrl: string | null;
    studentName: string | null;
    courseId: string | null;
  }[];
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    allCourses[0]?.id || null
  );
  const filteredStories = studentStories.filter(
    (story) => story.courseId === selectedCourse
  );

  return (
    <div className="p-6 container mx-auto" dir="rtl">
      <motion.h2
        className="text-3xl font-bold text-start mb-8 text-primary"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        جـــميع الــــــــــــــــدورات
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {allCourses.map((course) => (
          <motion.div
            key={course.id}
            className="border rounded-lg shadow hover:shadow-lg p-4 flex flex-col justify-between group"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {course.imageUrl && (
              <Image
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover rounded-md mb-4 group-hover:scale-95 hoverEffect"
                width={300}
                height={200}
                unoptimized
              />
            )}

            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {course.description?.slice(0, 100)}...
            </p>
            <div className="flex justify-start items-start gap-2 ">
              <p>عدد الساعات :</p>
              <p className=" text-primary mb-4 font-bold">
                {course.hours} ساعة
              </p>
            </div>
            <div className="flex justify-start items-start gap-2 ">
              <p>سعر الدورة:</p>
              <p className=" text-primary mb-4 font-bold">{course.price} $</p>
            </div>

            {course.section && (
              <div className="my-2 p-2 bg-gray-50 rounded-md border">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">رقم الشعبة:</span>{" "}
                  {course.section.number}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">حالة الشعبة الحالية:</span>{" "}
                  <span
                    className={`font-bold ${getStatusColor(
                      course.section?.status
                    )}`}
                  >
                    {course.section?.status === "open" && "مفتوحة"}
                    {course.section?.status === "in_progress" && "قيد التنفيذ"}
                    {course.section?.status === "closed" && "مغلقة"}
                    {course.section?.status === "completed" && "مكتملة"}
                    {course.section?.status === "approved" && "موافقة"}
                    {course.section?.status === "pending_approval" &&
                      "بانتظار الموافقة"}
                    {course.section?.status === "cancelled" && "ملغاة"}
                  </span>
                </p>
              </div>
            )}

            <Button className="w-full">
              <Link href={`/courses/${course.id}`}>تفاصيل الدورة</Link>
            </Button>
          </motion.div>
        ))}
      </div>
      <div className="p-6 container mx-auto" dir="rtl">
        <motion.h2
          className="text-3xl font-bold text-start mb-8 text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          اعمال الطلاب
        </motion.h2>

        {/* ✅ عرض الدورات ككاتيجوري */}
        <div className="flex flex-wrap gap-3 mb-8">
          {allCourses.map((course) => (
            <Button
              key={course.id}
              variant={selectedCourse === course.id ? "default" : "outline"}
              className={`px-4 py-2 ${
                selectedCourse === course.id
                  ? "bg-primary text-white"
                  : "bg-white text-primary"
              }`}
              onClick={() => setSelectedCourse(course.id)}
            >
              {course.title}
            </Button>
          ))}
        </div>

        {/* ✅ عرض الأعمال الخاصة بالدورة المختارة */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCourse} // مهم علشان يغير المحتوى مع أنيميشن
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <motion.div
                  key={story.id}
                  className="border rounded-lg shadow p-4 flex flex-col"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    👤 {story.studentName}
                  </p>

                  {story.type === "image" && story.mediaUrl && (
                    <Image
                      src={story.mediaUrl}
                      alt={story.title}
                      className="w-full h-48 object-cover rounded-md mb-2"
                      width={400}
                      height={300}
                      unoptimized
                    />
                  )}

                  {story.type === "video" && story.mediaUrl && (
                    <video
                      src={story.mediaUrl}
                      controls
                      className="w-full h-48 rounded-md mb-2"
                    />
                  )}

                  {story.type === "story" && (
                    <p className="text-gray-700">{story.description}</p>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">لا توجد أعمال لهذه الدورة حالياً.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AllCourses;
