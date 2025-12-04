"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const eventTypeMap: Record<string, string> = {
  news: "خبر",
  announcement: "إعلان",
  article: "مقال",
  event: "فعالية",
  update: "تحديث",
  blog: "مدونة",
  pressRelease: "بيان صحفي",
  promotion: "عرض ترويجي",
  alert: "تنبيه",
};

export default function LatestNewsHome({ allNews }: { allNews: any[] }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ✅ فلترة الاحداث حسب الأنواع المختارة
  const filteredNews =
    selectedTypes.length > 0
      ? allNews.filter((item) => selectedTypes.includes(item.eventType))
      : allNews;

  const handleCheckboxChange = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="container mx-auto p-10" dir="rtl">
      <h1 className="text-3xl font-bold text-primary mb-8">📢 كل المستجدات</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar الكاتيجوري */}
        <aside className="bg-white rounded-xl shadow-md p-6 md:col-span-1 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">التصنيفات</h2>
          <div className="flex flex-col gap-3">
            {Object.keys(eventTypeMap).map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleCheckboxChange(type)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-gray-800 font-semibold">
                  {eventTypeMap[type]}
                </span>
              </label>
            ))}
          </div>
        </aside>

        {/* Content الكاردز */}
        <main className="md:col-span-3">
          {filteredNews.length === 0 ? (
            // ✅ حالة لا يوجد أخبار
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-xl shadow-inner"
            >
              <span className="text-5xl">📰</span>
              <p className="text-lg font-semibold text-gray-700 mt-4">
                لا توجد احداث مطابقة للتصنيفات المختارة
              </p>
              <p className="text-sm text-gray-500 mt-2">
                جرّب اختيار تصنيفات أخرى لعرض أحدث أحداثنا
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredNews.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  >
                    {/* صورة الخبر */}
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={600}
                        height={300}
                        className="object-cover w-full h-48"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200" />
                    )}

                    {/* محتوى الكارد */}
                    <div className="p-6 flex flex-col gap-3">
                      <h2 className="text-xl font-bold text-gray-900">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(
                              "ar-EG"
                            )
                          : "—"}
                      </p>
                      {item.summary && (
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {item.summary}
                        </p>
                      )}

                      {/* زر التفاصيل مع سبينر */}
                      <div className="mt-4">
                        {loadingId === item.id ? (
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <Link
                            href={`/news/${item.id}`}
                            onClick={() => setLoadingId(item.id)}
                            className="inline-block w-full bg-primary text-white text-sm font-semibold text-center px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
                          >
                            عرض التفاصيل
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
