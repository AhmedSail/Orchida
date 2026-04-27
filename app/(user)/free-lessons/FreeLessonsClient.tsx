"use client";

import React, { useState } from "react";
import {
  Play,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  Tag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Category = { id: string; title: string; imageUrl?: string | null };
type Lesson = {
  id: string;
  mainTitle: string;
  subTitle?: string | null;
  description?: string | null;
  order: number;
  isActive: boolean;
  categoryId?: string | null;
  category?: Category | null;
  fields?: any[];
};

const FALLBACK_GRADIENTS = [
  "from-blue-600 to-cyan-400",
  "from-purple-600 to-pink-400",
  "from-amber-500 to-orange-400",
  "from-emerald-600 to-teal-400",
  "from-rose-600 to-red-400",
  "from-indigo-600 to-violet-400",
  "from-sky-600 to-blue-400",
  "from-fuchsia-600 to-purple-400",
];

const PER_PAGE = 6;

interface Props {
  lessons: Lesson[];
  categories: Category[];
}

export default function FreeLessonsClient({ lessons, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleCatChange = (id: string | null) => {
    setActiveCategory(id);
    setPage(1);
  };

  const filtered = activeCategory
    ? lessons.filter((l) => l.categoryId === activeCategory)
    : lessons;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
      <div className="flex gap-8 items-start">
        {/* Sidebar: Categories */}
        {categories.length > 0 && (
          <aside className="w-52 shrink-0 sticky top-28">
            <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-50">
                <p className="font-black text-zinc-900 flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-primary" /> التصنيفات
                </p>
              </div>
              <div className="p-3 space-y-1.5">
                <button
                  onClick={() => handleCatChange(null)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                    activeCategory === null
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <span>الكل</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeCategory === null ? "bg-white/25 text-white" : "bg-zinc-100 text-zinc-500"}`}
                  >
                    {lessons.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const count = lessons.filter(
                    (l) => l.categoryId === cat.id,
                  ).length;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCatChange(isActive ? null : cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      <span className="truncate text-right">{cat.title}</span>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? "bg-white/25 text-white" : "bg-zinc-100 text-zinc-500"}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Cards + Pagination */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-zinc-100 shadow-sm">
              <BookOpen className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
              <p className="text-xl font-black text-zinc-400">
                لا توجد دروس في هذا التصنيف
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {paginated.map((lesson, index) => {
                  const catImg = lesson.category?.imageUrl;
                  const gradient =
                    FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

                  return (
                    <Link
                      key={lesson.id}
                      href={`/free-lessons/${lesson.id}`}
                      className="group bg-white rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden flex flex-col h-full"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {catImg ? (
                          <Image
                            src={catImg}
                            alt={lesson.category?.title || ""}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            unoptimized
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-linear-to-br ${gradient} relative`}
                          >
                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                                backgroundSize: "40px 40px",
                              }}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                        {lesson.category && (
                          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full z-20">
                            {lesson.category.title}
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-6 h-6 text-primary fill-primary" />
                          </div>
                        </div>

                        <div className="absolute bottom-4 right-4 z-20 text-white">
                          <h3 className="text-lg font-black leading-tight drop-shadow-md">
                            {lesson.mainTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6 flex-1 flex flex-col">
                        {lesson.subTitle && (
                          <p className="text-sm font-bold text-zinc-400 mb-3 italic line-clamp-1">
                            {lesson.subTitle}
                          </p>
                        )}
                        <p className="text-zinc-600 font-medium line-clamp-2 mb-5 text-sm">
                          {lesson.description ||
                            "استكشف محتوى هذا الدرس المجاني وتعلم مهارات جديدة اليوم."}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-5 border-t border-zinc-50">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            متاح مجاناً
                          </span>
                          <span className="text-primary font-black flex items-center gap-1 group-hover:gap-3 transition-all duration-300 text-sm">
                            ابدأ التعلم الآن
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl font-black text-sm transition-all shadow-sm ${
                          p === page
                            ? "bg-primary text-white shadow-primary/25"
                            : "bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-zinc-400 font-bold mt-4">
                عرض {Math.min(page * PER_PAGE, filtered.length)} من أصل{" "}
                {filtered.length} درس
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
