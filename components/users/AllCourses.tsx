"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import { Link } from "next-view-transitions"; // Not used currently
import {
  Clock,
  BadgeDollarSign,
  BookOpen,
  User,
  PlayCircle,
  Image as ImageIcon,
  FileText,
  ChevronLeft,
  Calendar,
} from "lucide-react";

export type UserCourse = {
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

const getStatusConfig = (status: SectionStatus) => {
  switch (status) {
    case "open":
      return {
        label: "مفتوح للتسجيل",
        color: "text-green-600 bg-green-50 border-green-200",
        badgeColor: "bg-green-500",
      };
    case "in_progress":
      return {
        label: "قيد التنفيذ",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        badgeColor: "bg-blue-500",
      };
    case "closed":
      return {
        label: "مغلق",
        color: "text-red-600 bg-red-50 border-red-200",
        badgeColor: "bg-red-500",
      };
    case "completed":
      return {
        label: "مكتمل",
        color: "text-purple-600 bg-purple-50 border-purple-200",
        badgeColor: "bg-purple-500",
      };
    case "approved":
      return {
        label: "موافق عليه",
        color: "text-teal-600 bg-teal-50 border-teal-200",
        badgeColor: "bg-teal-500",
      };
    case "pending_approval":
      return {
        label: "بانتظار الموافقة",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        badgeColor: "bg-yellow-500",
      };
    case "cancelled":
      return {
        label: "ملغي",
        color: "text-gray-500 bg-gray-50 border-gray-200",
        badgeColor: "bg-gray-500",
      };
    default:
      return {
        label: "غير محدد",
        color: "text-gray-700 bg-gray-50 border-gray-200",
        badgeColor: "bg-gray-500",
      };
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

  // Sorting logic
  const sortedCourses = [...allCourses].sort((a, b) => {
    if (a.section?.status === "open" && b.section?.status !== "open") return -1;
    if (a.section?.status !== "open" && b.section?.status === "open") return 1;
    return 0;
  });

  return (
    <div className="min-h-screen  py-12" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center md:text-right">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 inline-block border-b-4 border-primary pb-2"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            جميع الدورات التدريبية
          </motion.h2>
          <p className="text-gray-600 text-lg">
            اكتشف مجموعتنا الواسعة من الدورات وطور مهاراتك
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {sortedCourses.map((course) => {
            const statusConfig = getStatusConfig(
              course.section?.status || null
            );
            const isRegistrationOpen = ["open", "in_progress"].includes(
              course.section?.status ?? ""
            );

            return (
              <motion.div
                key={course.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                {/* Image Section */}
                <div className="relative h-56 w-full overflow-hidden">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <BookOpen size={48} className="text-gray-400" />
                    </div>
                  )}
                  {/* Price Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1 text-primary">
                    <BadgeDollarSign size={16} />
                    {course.price ? `${course.price} $` : "مجاني"}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3
                    className="text-xl font-bold text-gray-900 mb-3 line-clamp-1"
                    title={course.title}
                  >
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-grow">
                    {course.description || "لا يوجد وصف متاح."}
                  </p>

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <span>{course.hours ? `${course.hours} ساعة` : "-"}</span>
                    </div>
                    {course.section ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${statusConfig.badgeColor}`}
                        />
                        <span>{statusConfig.label}</span>
                      </div>
                    ) : (
                      <span className="text-orange-500 font-medium text-xs">
                        لا يوجد شعب
                      </span>
                    )}
                  </div>

                  {/* Status Box */}
                  <div
                    className={`text-xs p-3 rounded-lg mb-4 text-center ${
                      course.section
                        ? statusConfig.color
                        : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}
                  >
                    {course.section ? (
                      <>
                        <span className="font-bold ml-1">
                          الشعبة {course.section.number}:
                        </span>
                        {statusConfig.label}
                      </>
                    ) : (
                      "سيتم فتح شعبة قريباً"
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full h-10 font-medium transition-all duration-300 ${
                      isRegistrationOpen
                        ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-not-allowed"
                    }`}
                    disabled={
                      loadingCourseId === course.id || !isRegistrationOpen
                    }
                    onClick={() => {
                      if (!isRegistrationOpen) return;
                      setLoadingCourseId(course.id);
                      router.push(`/courses/${course.id}`);
                    }}
                  >
                    {loadingCourseId === course.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التحميل...
                      </div>
                    ) : isRegistrationOpen ? (
                      <div className="flex items-center gap-2">
                        تفاصيل الدورة
                        <ChevronLeft size={16} />
                      </div>
                    ) : (
                      "التسجيل مغلق"
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Student Works Section */}
        <div className="mt-20">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <motion.h2
                className="text-3xl font-bold text-gray-900"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                أعمال طلابنا المبدعين
              </motion.h2>
              <p className="text-gray-500 mt-2">
                شاهد ثمرة جهود طلابنا في دوراتنا المختلفة
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
            {uniqueCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCourse === course.id
                    ? "bg-primary text-white shadow-md transform scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCourse}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {selectedCourse ? (
                  filteredStories.length > 0 ? (
                    filteredStories.map((story) => (
                      <motion.div
                        key={story.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {/* Media Display */}
                        <div className="relative h-48 bg-gray-100">
                          {story.type === "image" && story.mediaUrl ? (
                            <Image
                              src={story.mediaUrl}
                              alt={story.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : story.type === "video" && story.mediaUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-black group cursor-pointer">
                              <video
                                src={story.mediaUrl}
                                className="w-full h-full object-cover opacity-60"
                              />
                              <PlayCircle
                                size={48}
                                className="text-white absolute z-10 opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FileText size={48} />
                            </div>
                          )}
                          {/* Type Badge */}
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                            {story.type === "image" ? (
                              <ImageIcon size={12} />
                            ) : story.type === "video" ? (
                              <PlayCircle size={12} />
                            ) : (
                              <FileText size={12} />
                            )}
                            {story.type === "image"
                              ? "صورة"
                              : story.type === "video"
                              ? "فيديو"
                              : "مقال"}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {story.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <User size={12} />
                            <span>{story.studentName}</span>
                            {story.sectionNumber && (
                              <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>الشعبة {story.sectionNumber}</span>
                              </>
                            )}
                          </div>
                          {story.type === "story" && (
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {story.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                      <Image
                        src="/logo.png"
                        width={100}
                        height={100}
                        alt="No Data"
                        className="mx-auto mb-4 opacity-50"
                      />
                      <p>لا توجد أعمال مضافة لهذه الدورة حتى الآن.</p>
                    </div>
                  )
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    اختر دورة لعرض أعمال الطلاب
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCourses;
