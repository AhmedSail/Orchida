"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaPlayCircle,
  FaMedal,
} from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";

interface StudentWork {
  id: string;
  title: string;
  description: string | null;
  type: "story" | "image" | "video";
  mediaUrl: string | null;
  status: string;
  createdAt: Date | string;
  studentName: string | null;
  userName: string | null;
  youtubeUrl: string | null;
  courseId: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
}

interface Course {
  id: string;
  title: string;
  slug: string | null;
}

export default function StudentWorksPage({
  initialWorks,
  allCourses,
}: {
  initialWorks: StudentWork[];
  allCourses: Course[];
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const getYoutubeId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const filteredWorks = useMemo(() => {
    return initialWorks.filter((work) => {
      const matchesCourse = !selectedCourse || work.courseId === selectedCourse;
      const matchesType = selectedType === "all" || work.type === selectedType;
      const matchesSearch =
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (work.description &&
          work.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (work.studentName &&
          work.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCourse && matchesType && matchesSearch;
    });
  }, [initialWorks, selectedCourse, selectedType, searchQuery]);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: (i % 9) * 0.1, duration: 0.5 },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20" dir="rtl">
      {/* 🚀 Header Section */}
      <section className="bg-white pt-24 pb-12 shadow-xs">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-2xl lg:text-4xl text-primary font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            قصص نجاح الطلاب
          </motion.h2>
          <motion.p 
            className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            حابب تحصل على وسام اوركيدة؟ شارك في دوراتنا لعرض قصة نجاحك
          </motion.p>

          {/* Filters Bar */}
          <div className="max-w-4xl mx-auto bg-gray-50 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن مبدع أو عمل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pr-12 pl-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              {["all", "image", "video", "story"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedType === type
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {type === "all" ? "الكل" : type === "video" ? "فيديو" : type === "image" ? "صورة" : "قصة نجاح"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 sticky top-28 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaFilter className="text-primary text-sm" />
              الدورات التدريبية
            </h3>
            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              <button
                onClick={() => setSelectedCourse(null)}
                className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                  !selectedCourse ? "bg-primary/5 border-primary text-primary" : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                }`}
              >
                جميع الدورات
              </button>
              {allCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`text-right px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                    selectedCourse === course.id ? "bg-primary/5 border-primary text-primary" : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {course.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {filteredWorks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200"
              >
                <div className="text-5xl mb-4">🌟</div>
                <h3 className="text-xl font-bold text-gray-700">لا توجد أعمال تطابق بحثك</h3>
                <p className="text-gray-500 mt-2">حاول تغيير معايير البحث أو التصفية</p>
              </motion.div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
                {filteredWorks.map((story, i) => (
                  <motion.div
                    key={story.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={cardVariants}
                  >
                    <Card className="shadow-lg h-full flex flex-col relative overflow-hidden border-none rounded-[2rem] hover:shadow-xl transition-all duration-300">
                      {/* ✅ Medal Badge */}
                      <div className="absolute top-4 left-4 z-10 bg-primary text-white p-3 rounded-full shadow-lg flex items-center justify-center">
                        <FaMedal className="w-5 h-5 text-yellow-300" />
                      </div>

                      <CardContent className="p-6 flex flex-col">
                        <div className="flex flex-col gap-1 mb-4">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                             <h3 className="font-bold text-xl text-gray-900">{story.title}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mr-3.5 font-bold">
                            👤 {story.studentName || story.userName || "طالب أوركيدة"}
                          </p>
                        </div>

                        <div 
                          className="w-full h-72 flex items-center justify-center overflow-hidden rounded-[1.5rem] bg-gray-100 relative group/vid cursor-pointer"
                          onClick={() => story.type === "video" && setPlayingId(story.id)}
                        >
                          {story.type === "image" && story.mediaUrl && (
                            <Image
                              src={story.mediaUrl}
                              alt={story.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}

                          {story.type === "video" && (
                            <>
                              {playingId === story.id ? (
                                story.youtubeUrl ? (
                                  <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(story.youtubeUrl)}?autoplay=1`}
                                    className="w-full h-full border-none"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video
                                    src={story.mediaUrl ?? ""}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-cover"
                                  />
                                )
                              ) : (
                                <>
                                  {story.youtubeUrl ? (
                                    <Image
                                      src={`https://img.youtube.com/vi/${getYoutubeId(story.youtubeUrl)}/hqdefault.jpg`}
                                      alt={story.title}
                                      fill
                                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                      unoptimized
                                    />
                                  ) : story.mediaUrl ? (
                                    <video
                                      src={story.mediaUrl}
                                      className="w-full h-full object-cover opacity-90"
                                      muted
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-900" />
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                                    <div className="bg-primary/90 text-white p-5 rounded-full shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                                      <FaPlayCircle className="text-5xl" />
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}

                          {story.type === "story" && (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-primary/5">
                              <span className="text-6xl mb-4">📖</span>
                              <p className="text-gray-600 italic">"{story.description?.slice(0, 150)}..."</p>
                            </div>
                          )}
                        </div>

                        {story.description && (
                          <div className="mt-6">
                            <p className="text-gray-700 leading-relaxed text-sm line-clamp-3">
                              {story.description}
                            </p>
                          </div>
                        )}

                        {story.courseTitle && (
                          <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المشروع التابع لـ:</span>
                            <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">{story.courseTitle}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
