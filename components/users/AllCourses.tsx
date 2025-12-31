"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

const AllCourses = ({
  allCourses,
  studentStories,
  uniqueCourses,
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
    sectionNumber: number | null;
  }[];
  uniqueCourses: UserCourse[];
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    allCourses[0]?.id || null
  );
  const filteredStories = studentStories.filter(
    (story) => story.courseId === selectedCourse
  );

  const router = useRouter();
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

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
        {allCourses
          .sort((a, b) => {
            // ✅ إذا الحالة open نخليها قبل الباقي
            if (a.section?.status === "open" && b.section?.status !== "open")
              return -1;
            if (a.section?.status !== "open" && b.section?.status === "open")
              return 1;
            return 0;
          })
          .map((course) => (
            <motion.div
              key={course.id}
              className="border rounded-lg shadow hover:shadow-lg p-4 flex flex-col justify-between group"
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

              {course.section ? (
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
                      {course.section?.status === "in_progress" &&
                        "قيد التنفيذ"}
                      {course.section?.status === "closed" && "مغلقة"}
                      {course.section?.status === "completed" && "مكتملة"}
                      {course.section?.status === "approved" && "موافقة"}
                      {course.section?.status === "pending_approval" &&
                        "بانتظار الموافقة"}
                      {course.section?.status === "cancelled" && "ملغاة"}
                      {course.section?.status === null &&
                        "سيتم فتح شعبة لاحقاً"}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="my-2 p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm font-bold text-orange-600">
                    🚫 لا توجد شعب حالياً — سيتم فتح شعبة لاحقاً
                  </p>
                </div>
              )}

              {/* ✅ زر مع حالة تحميل */}
              <Button
                className="w-full"
                disabled={loadingCourseId === course.id}
                onClick={() => {
                  setLoadingCourseId(course.id);
                  router.push(`/courses/${course.id}`);
                }}
              >
                {loadingCourseId === course.id ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      ></path>
                    </svg>
                    جاري التحميل...
                  </span>
                ) : (
                  " تفاصيل الدورة"
                )}
              </Button>
            </motion.div>
          ))}
      </div>

      {/* ✅ قسم أعمال الطلاب */}
      <div className="p-6 container mx-auto" dir="rtl">
        <motion.h2
          className="text-3xl font-bold text-start mb-8 text-primary"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          اعمال الطلاب
        </motion.h2>

        <div className="flex flex-wrap gap-3 mb-8">
          {uniqueCourses.map((course) => (
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

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCourse}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {selectedCourse ? (
              filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <motion.div
                    key={story.id}
                    className="border rounded-lg shadow p-4 flex flex-col"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      👤 {story.studentName}
                    </p>

                    {/* ✅ اسم/رقم الشعبة */}
                    {story.sectionNumber && (
                      <p className="text-sm text-blue-600 mb-2">
                        🏫 خاص بالشعبة رقم {story.sectionNumber}
                      </p>
                    )}

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
                <p className="text-gray-500">
                  لا توجد أعمال لهذه الدورة حالياً.
                </p>
              )
            ) : (
              <p className="text-red-500 font-bold">
                🚫 لا توجد دورة أو شعبة محددة حالياً.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AllCourses;
