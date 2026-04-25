"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaPlay, 
  FaImage,
  FaExternalLinkAlt
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Work {
  id: string;
  title: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  type: string;
  projectUrl: string | null;
  priceRange: string | null;
  duration: string | null;
  tags: string | null;
  toolsUsed: string | null;
  serviceId: string;
  serviceName: string | null;
  youtubeUrl: string | null;
  createdAt: Date | string;
}

interface Service {
  id: string;
  name: string;
}

export default function PortfolioGallery({ 
  initialWorks, 
  services 
}: { 
  initialWorks: any[]; 
  services: Service[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Sync state from URL on initial load
  useEffect(() => {
    const categoryInUrl = searchParams.get("category");
    if (categoryInUrl) {
      const service = services.find(s => s.name === categoryInUrl);
      if (service) setSelectedType(service.id);
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedType) {
      const service = services.find(s => s.id === selectedType);
      if (service) params.set("category", service.name);
    } else {
      params.delete("category");
    }

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [selectedType]);

  const filteredWorks = useMemo(() => {
    // Reset page when filters change
    setCurrentPage(1);
    
    return initialWorks.filter((work) => {
      const matchesType = !selectedType || work.serviceId === selectedType;
      const matchesSearch = 
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (work.description && work.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesType && matchesSearch;
    });
  }, [initialWorks, selectedType, searchQuery]);

  // Paginated Items
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredWorks.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredWorks, currentPage]);

  const handleTypeClick = (typeId: string) => {
    setSelectedType((prev) => (prev === typeId ? null : typeId));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 overflow-hidden" dir="rtl">
      {/* 🚀 Header Section */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 mb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-right">
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-primary font-bold tracking-widest text-sm uppercase mb-3 block"
              >
                معرض أعمالنا
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black text-gray-900 leading-tight"
              >
                مشاريعنا <span className="text-primary">الإبداعية</span>
              </motion.h1>
            </div>

            {/* البحث السريع */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full md:w-96"
            >
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن مشروع أو فكرة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pr-12 pl-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-700 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 left-4 flex items-center text-gray-400 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* 🛠️ Sidebar - التصنيفات */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-28 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <FaFilter className="text-primary text-sm" />
                  التصنيفات
                </h2>
                {selectedType && (
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-tighter"
                  >
                    إعادة ضبط
                  </button>
                )}
              </div>

              <div className="flex lg:flex-col flex-wrap gap-2.5">
                {services.map((service) => {
                  const isActive = selectedType === service.id;
                  return (
                    <motion.button
                      key={service.id}
                      onClick={() => handleTypeClick(service.id)}
                      whileHover={{ x: isActive ? 0 : -5 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-0"
                          : "bg-white text-gray-600 border border-gray-100 hover:border-primary/30 hover:bg-gray-50 flex-1 lg:flex-none"
                      }`}
                    >
                      <span>{service.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="bg-linear-to-br from-primary to-blue-700 rounded-3xl p-8 text-white hidden lg:block shadow-xl shadow-primary/20">
              <h3 className="font-bold mb-2">إجمالي المشاريع</h3>
              <p className="text-4xl font-black">{filteredWorks.length}</p>
              <div className="w-12 h-1.5 bg-white/20 rounded-full mt-4" />
            </div>
          </aside>

          {/* 📝 Main Content - البطاقات */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {filteredWorks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-4xl border-2 border-dashed border-gray-200 p-12 text-center"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-4xl">
                    🕵️‍♂️
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    لم نجد ما تبحث عنه
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                    لم نجد أي مشاريع تطابق معايير البحث الحالية. حاول كتابة كلمات
                    أخرى أو اختيار تصنيفات مختلفة.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedType(null);
                      setSearchQuery("");
                    }}
                    className="mt-8 text-primary font-bold border-b-2 border-primary/20 hover:border-primary transition-all"
                  >
                    عرض جميع المشاريع
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {currentItems.map((work, index) => (
                    <motion.div
                      key={work.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-4/5 overflow-hidden bg-gray-100">
                        {work.imageUrl ? (
                          (work.type === "video" && !work.imageUrl.includes("img.youtube.com")) ? (
                            <video
                              src={work.imageUrl}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              muted
                              loop
                              playsInline
                              autoPlay
                            />
                          ) : (
                            <Image
                              src={work.imageUrl}
                              alt={work.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              unoptimized
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <FaImage size={48} className="text-primary/20" />
                          </div>
                        )}
                        {/* Service Tag */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className="px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg backdrop-blur-md bg-white/90 text-primary">
                            {work.serviceName}
                          </span>
                        </div>
                        {/* Type Icon Overlay */}
                        <div className="absolute bottom-4 left-4 z-10">
                          <div className="bg-white/90 backdrop-blur-md size-10 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-primary transition-all duration-500">
                            {work.type === "video" ? (
                              <FaPlay className="text-primary group-hover:text-white transition-all size-3" />
                            ) : (
                              <FaImage className="text-primary group-hover:text-white transition-all size-3" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                            {work.createdAt
                              ? new Date(work.createdAt).toLocaleDateString(
                                  "ar-EG",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "قريباً"}
                          </span>
                        </div>

                        <h2 className="text-xl font-black text-gray-900 mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {work.title}
                        </h2>

                        {work.description && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                            {work.description}
                          </p>
                        )}

                        <div className="mt-auto">
                          <button
                            onClick={() => setSelectedWork(work)}
                            className="group/btn relative inline-flex items-center gap-2 text-base font-black text-gray-900 hover:text-primary transition-colors"
                          >
                            <span>التفاصيل</span>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover/btn:bg-primary transition-all">
                              <FaArrowLeft className="text-xs group-hover/btn:text-white transition-all transform group-hover/btn:-translate-x-1" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🔢 Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="size-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                >
                  <FaArrowLeft className="rotate-180" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`size-12 rounded-2xl font-black text-sm transition-all shadow-sm ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="size-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                >
                  <FaArrowLeft />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 🖼️ Premium Work Modal */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 lg:p-12 bg-black/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="bg-white w-full max-w-7xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col lg:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-8 left-8 z-110 size-12 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-2xl border border-white/20"
              >
                <FaTimes size={20} />
              </button>

              {/* Media Section */}
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden group">
                {selectedWork.youtubeUrl ? (
                  <iframe
                    src={selectedWork.youtubeUrl.includes('watch?v=') 
                      ? selectedWork.youtubeUrl.replace('watch?v=', 'embed/') 
                      : selectedWork.youtubeUrl.includes('youtu.be/')
                        ? selectedWork.youtubeUrl.replace('youtu.be/', 'youtube.com/embed/')
                        : selectedWork.youtubeUrl}
                    className="w-full aspect-video rounded-3xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : selectedWork.type === 'image' && selectedWork.imageUrl ? (
                  <img src={selectedWork.imageUrl} alt={selectedWork.title} className="w-full h-full object-contain" />
                ) : selectedWork.type === 'video' && selectedWork.imageUrl ? (
                  <video src={selectedWork.imageUrl} controls className="w-full max-h-full" autoPlay />
                ) : null}
              </div>

              {/* Sidebar Info Section */}
              <div className="w-full lg:w-[400px] bg-white p-8 lg:p-12 flex flex-col overflow-y-auto custom-scrollbar">
                 <div className="mb-6 flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-xl font-black text-[10px]">
                       {selectedWork.serviceName}
                    </Badge>
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       {new Date(selectedWork.createdAt).getFullYear()}
                    </span>
                 </div>
                 
                 <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-[1.2]">{selectedWork.title}</h2>
                 
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-4 h-px bg-primary/30"></div>
                          عن المشروع
                       </h4>
                       <p className="text-gray-600 text-base font-medium leading-relaxed whitespace-pre-wrap">
                          {selectedWork.description}
                       </p>
                    </div>

                    <div className="py-6 border-y border-gray-50">
                       {selectedWork.toolsUsed && (
                         <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">الأدوات المستخدمة</p>
                            <p className="font-bold text-sm text-gray-900">{selectedWork.toolsUsed}</p>
                         </div>
                       )}
                    </div>

                    <div className="flex flex-col gap-3">
                       <Button size="lg" variant="outline" className="h-14 rounded-2xl font-black border-2">
                          اطلب مشروعاً مماثلاً
                       </Button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f1f1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
