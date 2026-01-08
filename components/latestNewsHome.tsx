"use client";
import { useState } from "react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

// ✅ أنواع الأحداث مع ألوان مخصصة لكل نوع
const eventTypeMap: Record<string, { label: string; color: string }> = {
  news: { label: "خبر", color: "bg-blue-500" },
  announcement: { label: "إعلان", color: "bg-indigo-500" },
  article: { label: "مقال", color: "bg-green-500" },
  event: { label: "فعالية", color: "bg-purple-500" },
  update: { label: "تحديث", color: "bg-yellow-500" },
  blog: { label: "مدونة", color: "bg-teal-500" },
  pressRelease: { label: "بيان صحفي", color: "bg-pink-500" },
  promotion: { label: "عرض ترويجي", color: "bg-red-500" },
  alert: { label: "تنبيه", color: "bg-orange-500" },
};

export default function LatestNewsHome({ allNews }: { allNews: any[] }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredNews =
    selectedTypes.length > 0
      ? allNews.filter((item) => selectedTypes.includes(item.eventType))
      : allNews;

  const handleTypeClick = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="text-right mb-12">
        <h1 className="text-3xl font-extrabold text-primary lg:text-5xl">
          آخـــــــــــــر الــــــمـــســــتــجـــدات
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          تابع أحدث الأخبار والفعاليات من أروكيدة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar - التصنيفات */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">التصنيفات</h2>
              {selectedTypes.length > 0 && (
                <button
                  onClick={() => setSelectedTypes([])}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  مسح الكل
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(eventTypeMap).map(([type, { label }]) => (
                <motion.button
                  key={type}
                  onClick={() => handleTypeClick(type)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    selectedTypes.includes(type)
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content - البطاقات */}
        <main className="lg:col-span-3">
          <AnimatePresence>
            {filteredNews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-2xl p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  🧐
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800">
                  لا توجد نتائج مطابقة
                </h3>
                <p className="text-gray-500 mt-2">
                  جرّب تغيير التصنيفات التي اخترتها.
                </p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {filteredNews.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden group flex flex-col"
                  >
                    <div className="relative">
                      <Image
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        width={600}
                        height={300}
                        className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full ${
                          eventTypeMap[item.eventType]?.color || "bg-gray-500"
                        }`}
                      >
                        {eventTypeMap[item.eventType]?.label || "غير مصنف"}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col ">
                      <p className="text-sm text-gray-500 mb-2">
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(
                              "ar-EG",
                              { year: "numeric", month: "long", day: "numeric" }
                            )
                          : "—"}
                      </p>
                      <h2 className="text-lg font-bold text-gray-900 mb-3 ">
                        {item.title}
                      </h2>
                      {item.summary && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {item.summary}
                        </p>
                      )}

                      <div className="mt-auto pt-4">
                        {loadingId === item.id ? (
                          <div className="flex items-center justify-center h-10">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <Link
                            href={`/news/${item.id}`}
                            onClick={() => setLoadingId(item.id)}
                            className="flex items-center justify-between w-full font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <span>اقرأ المزيد</span>
                            <FaArrowLeft className="transform transition-transform duration-300 group-hover:-translate-x-1" />
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
  );
}
