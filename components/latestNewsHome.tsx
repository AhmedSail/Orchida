"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaSearch, FaFilter, FaTimes } from "react-icons/fa";

// ✅ أنواع الأحداث مع ألوان مخصصة احترافية
const eventTypeMap: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  news: { label: "خبر عاجل", color: "text-blue-600", bg: "bg-blue-50" },
  announcement: {
    label: "إعلان هام",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  article: {
    label: "مقال مميز",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  event: {
    label: "فعالية قادمة",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  update: { label: "تحديث جديد", color: "text-amber-600", bg: "bg-amber-50" },
  blog: { label: "مدونة", color: "text-teal-600", bg: "bg-teal-50" },
  pressRelease: {
    label: "بيان صحفي",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  promotion: { label: "عرض خاص", color: "text-orange-600", bg: "bg-orange-50" },
  alert: { label: "تنبيه", color: "text-red-600", bg: "bg-red-50" },
  competition: { label: "مسابقة", color: "text-cyan-600", bg: "bg-cyan-50" },
  workshop: { label: "ورشة عمل", color: "text-violet-600", bg: "bg-violet-50" },
  story: { label: "قصة نجاح", color: "text-pink-600", bg: "bg-pink-50" },
};

export default function LatestNewsHome({ allNews }: { allNews: any[] }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ✅ تصفية الأخبار بناءً على البحث والتصنيفات
  const filteredNews = useMemo(() => {
    return allNews.filter((item) => {
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(item.eventType);
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.summary &&
          item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [allNews, selectedTypes, searchQuery]);

  const handleTypeClick = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
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
                المركز الإعلامي
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black text-gray-900 leading-tight"
              >
                آخر المستجدات <span className="text-primary">والأخبار</span>
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
                <FaSearch className="text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="ابحث عن خبر أو مقال..."
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
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-tighter"
                  >
                    إعادة ضبط
                  </button>
                )}
              </div>

              <div className="flex lg:flex-col flex-wrap gap-2.5">
                {Object.entries(eventTypeMap).map(
                  ([type, { label, bg, color }]) => {
                    const isActive = selectedTypes.includes(type);
                    return (
                      <motion.button
                        key={type}
                        onClick={() => handleTypeClick(type)}
                        whileHover={{ x: isActive ? 0 : -5 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                          isActive
                            ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-0"
                            : "bg-white text-gray-600 border border-gray-100 hover:border-primary/30 hover:bg-gray-50 flex-1 lg:flex-none"
                        }`}
                      >
                        <span>{label}</span>
                        {!isActive && (
                          <div
                            className={`w-2 h-2 rounded-full ${bg.replace(
                              "bg-",
                              "bg-opacity-100 bg-"
                            )}`}
                          />
                        )}
                      </motion.button>
                    );
                  }
                )}
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-8 text-white hidden lg:block shadow-xl shadow-primary/20">
              <h3 className="font-bold mb-2">إجمالي المحتوى</h3>
              <p className="text-4xl font-black">{filteredNews.length}</p>
              <div className="w-12 h-1.5 bg-white/20 rounded-full mt-4" />
            </div>
          </aside>

          {/* 📝 Main Content - البطاقات */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {filteredNews.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-[2rem] border-2 border-dashed border-gray-200 p-12 text-center"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-4xl">
                    🕵️‍♂️
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    لم نجد ما تبحث عنه
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                    لم نجد أي أخبار تطابق معايير البحث الحالية. حاول كتابة كلمات
                    أخرى أو اختيار تصنيفات مختلفة.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTypes([]);
                      setSearchQuery("");
                    }}
                    className="mt-8 text-primary font-bold border-b-2 border-primary/20 hover:border-primary transition-all"
                  >
                    عرض جميع الأخبار
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredNews.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                        <Image
                          src={item.imageUrl || "/placeholder.png"}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                        {/* Type Tag */}
                        <div className="absolute top-4 right-4 z-10">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg backdrop-blur-md ${
                              eventTypeMap[item.eventType]?.bg || "bg-white/90"
                            } ${
                              eventTypeMap[item.eventType]?.color ||
                              "text-gray-900"
                            }`}
                          >
                            {eventTypeMap[item.eventType]?.label || "غير مصنف"}
                          </span>
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                            {item.publishedAt
                              ? new Date(item.publishedAt).toLocaleDateString(
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
                          {item.title}
                        </h2>

                        {item.summary && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                            {item.summary}
                          </p>
                        )}

                        <div className="mt-auto">
                          {loadingId === item.id ? (
                            <div className="flex items-center justify-center py-2">
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <Link
                              href={`/news/${item.id}`}
                              onClick={() => setLoadingId(item.id)}
                              className="group/btn relative inline-flex items-center gap-2 text-base font-black text-gray-900 hover:text-primary transition-colors"
                            >
                              <span>التفاصيل</span>
                              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover/btn:bg-primary transition-all">
                                <FaArrowLeft className="text-xs group-hover/btn:text-white transition-all transform group-hover/btn:-translate-x-1" />
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
