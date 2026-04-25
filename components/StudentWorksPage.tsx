"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaPlayCircle, 
  FaImage, 
  FaBookOpen,
  FaUserGraduate,
  FaCalendarAlt,
  FaChevronLeft
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";

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
}

interface Course {
  id: string;
  title: string;
}

export default function StudentWorksPage({ 
  initialWorks, 
  allCourses 
}: { 
  initialWorks: StudentWork[];
  allCourses: Course[];
}) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWork, setSelectedWork] = useState<StudentWork | null>(null);

  const filteredWorks = useMemo(() => {
    return initialWorks.filter((work) => {
      const matchesCourse = !selectedCourse || work.courseId === selectedCourse;
      const matchesType = selectedType === "all" || work.type === selectedType;
      const matchesSearch = 
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (work.description && work.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (work.studentName && work.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCourse && matchesType && matchesSearch;
    });
  }, [initialWorks, selectedCourse, selectedType, searchQuery]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourse(prev => prev === courseId ? null : courseId);
  };

  const getWorkIcon = (type: string) => {
    switch (type) {
      case "video": return <FaPlayCircle className="text-blue-500" />;
      case "image": return <FaImage className="text-emerald-500" />;
      case "story": return <FaBookOpen className="text-amber-500" />;
      default: return null;
    }
  };

  const getWorkLabel = (type: string) => {
    switch (type) {
      case "video": return "فيديو";
      case "image": return "صورة";
      case "story": return "قصة نجاح";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 overflow-hidden" dir="rtl">
      {/* 🚀 Header Section */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-16 mb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-bold tracking-widest text-sm uppercase mb-4 block"
          >
            معرض الإبداع
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6"
          >
            أعمال <span className="text-primary">مبدعينا</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg font-medium"
          >
            نفتخر بمشاركة إبداعات طلابنا الذين حولوا المعرفة إلى واقع ملموس وقصص نجاح ملهمة.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🛠️ Filters & Search Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن عمل، طالب، أو وصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pr-12 pl-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-700 font-medium"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["all", "image", "video", "story"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                  selectedType === type
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {type === "all" ? "الكل" : getWorkLabel(type)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* 🛠️ Sidebar - Course Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-28">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <FaFilter className="text-primary text-sm" />
                  فلترة حسب الدورات
                </h2>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {allCourses.map((course) => {
                  const isActive = selectedCourse === course.id;
                  return (
                    <button
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                        isActive
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-white border-gray-100 text-gray-600 hover:border-primary/30"
                      }`}
                    >
                      {course.title}
                    </button>
                  );
                })}
              </div>

              {selectedCourse && (
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-full mt-6 py-3 text-sm font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          </aside>

          {/* 📝 Main Content - Works Grid */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {filteredWorks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-4xl border-2 border-dashed border-gray-200 p-12 text-center"
                >
                  <div className="text-5xl mb-6">🎨</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد أعمال تطابق بحثك</h3>
                  <p className="text-gray-500">حاول تغيير معايير التصفية أو البحث بكلمات أخرى.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                  {filteredWorks.map((work, index) => (
                    <motion.div
                      key={work.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                    >
                      {/* Media Container */}
                      <div className="relative aspect-video overflow-hidden bg-gray-100">
                        {work.youtubeUrl ? (
                           <div className="w-full h-full relative">
                            <Image
                              src={`https://img.youtube.com/vi/${(() => {
                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                const match = work.youtubeUrl.match(regExp);
                                return (match && match[2].length === 11) ? match[2] : work.youtubeUrl.split('/').pop();
                              })()}/hqdefault.jpg`}
                              alt={work.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <FaPlayCircle className="text-white/70 text-5xl group-hover:scale-110 group-hover:text-white transition-all" />
                            </div>
                          </div>
                        ) : work.type === "image" && work.mediaUrl ? (
                          <Image
                            src={work.mediaUrl}
                            alt={work.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                          />
                        ) : work.type === "video" && work.mediaUrl ? (
                          <div className="w-full h-full relative">
                            <video
                              src={work.mediaUrl}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              muted
                              loop
                              playsInline
                              autoPlay
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <FaPlayCircle className="text-white/70 text-5xl group-hover:scale-110 group-hover:text-white transition-all" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <FaBookOpen className="text-primary/30 text-6xl" />
                          </div>
                        )}
                        
                        {/* Type Badge */}
                        <div className="absolute top-6 right-6">
                          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                            {getWorkIcon(work.type)}
                            <span className="text-xs font-black text-gray-900">{getWorkLabel(work.type)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FaUserGraduate className="text-sm" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">صاحب العمل</p>
                            <h4 className="font-bold text-gray-900 leading-none">{work.studentName || work.userName || "طالب أوركيدة"}</h4>
                          </div>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-1">
                          {work.title}
                        </h3>

                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">
                          {work.description}
                        </p>

                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400">
                            <FaCalendarAlt className="text-xs" />
                            <span className="text-[10px] font-bold">
                                {new Date(work.createdAt).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long' })}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => setSelectedWork(work)}
                            className="flex items-center gap-2 text-primary font-black text-sm group/btn"
                          >
                            عرض العمل
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                                <FaChevronLeft className="text-[10px]" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* 🖼️ View Work Modal */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
            >
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-6 left-6 z-10 size-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl"
              >
                <FaTimes className="text-xl" />
              </button>

              <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-[300px]">
                {selectedWork.youtubeUrl ? (
                   <iframe
                   src={selectedWork.youtubeUrl.includes('watch?v=') 
                     ? selectedWork.youtubeUrl.replace('watch?v=', 'embed/') 
                     : selectedWork.youtubeUrl.includes('youtu.be/')
                       ? selectedWork.youtubeUrl.replace('youtu.be/', 'youtube.com/embed/')
                       : selectedWork.youtubeUrl}
                   className="w-full h-full border-none aspect-video"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 ></iframe>
                ) : selectedWork.type === "image" && selectedWork.mediaUrl ? (
                  <img src={selectedWork.mediaUrl} alt={selectedWork.title} className="w-full h-full object-contain" />
                ) : selectedWork.type === "video" && selectedWork.mediaUrl ? (
                  (selectedWork.mediaUrl.includes("youtube.com") || selectedWork.mediaUrl.includes("youtu.be")) ? (
                    <iframe
                      src={selectedWork.mediaUrl.includes('watch?v=') 
                        ? selectedWork.mediaUrl.replace('watch?v=', 'embed/') 
                        : selectedWork.mediaUrl.includes('youtu.be/')
                          ? selectedWork.mediaUrl.replace('youtu.be/', 'youtube.com/embed/')
                          : selectedWork.mediaUrl}
                      className="w-full h-full border-none aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video src={selectedWork.mediaUrl} controls className="w-full max-h-full" autoPlay />
                  )
                ) : selectedWork.type === "story" && (
                  <div className="p-12 text-center text-primary/20">
                    <FaBookOpen className="text-[120px]" />
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 p-10 flex flex-col bg-white overflow-y-auto">
                <Badge className="w-fit mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-2 rounded-xl font-black">
                   {getWorkLabel(selectedWork.type)}
                </Badge>
                
                <h2 className="text-3xl font-black text-gray-900 mb-4">{selectedWork.title}</h2>
                
                <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-2xl">
                    <div className="size-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                        <FaUserGraduate />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 leading-none mb-1">المبدع</p>
                        <p className="font-bold text-gray-900">{selectedWork.studentName || "طالب أوركيدة"}</p>
                    </div>
                </div>

                {selectedWork.courseTitle && (
                    <div className="mb-8">
                        <p className="text-xs font-black text-gray-400 mb-2">الدورة التدريبية</p>
                        <p className="font-bold text-primary">{selectedWork.courseTitle}</p>
                    </div>
                )}

                <div className="grow">
                    <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                        {selectedWork.description}
                    </p>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 text-center">
                        تم النشر في {new Date(selectedWork.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
