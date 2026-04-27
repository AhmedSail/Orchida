import React from "react";
import {
  getFreeLessonsAction,
  getFreeLessonCategoriesAction,
} from "@/app/actions/free-lessons";
import { BookOpen } from "lucide-react";
import FreeLessonsClient from "./FreeLessonsClient";

export const metadata = {
  title: "الدروس المجانية | أوركيدة",
  description:
    "تعلم مجاناً من خلال مكتبة الدروس المفتوحة. محتوى عالي الجودة لرفع مهاراتك وتطوير قدراتك.",
};

export default async function FreeLessonsPublicPage() {
  const [lr, cr] = await Promise.all([
    getFreeLessonsAction(),
    getFreeLessonCategoriesAction(),
  ]);

  const lessons = ((lr.success && lr.data ? lr.data : []) as any[]).filter(
    (l) => l.isActive,
  );
  const categories = (cr.success && cr.data ? cr.data : []) as any[];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* Hero */}
      <div className="relative overflow-hidden pt-10 pb-4">
        <div className="container mx-auto py-10 px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-2">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-5">
              <BookOpen className="w-4 h-4" />
              <span>محتوى تعليمي مفتوح للجميع</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-blue-600">
                الدروس
              </span>{" "}
              المجانية
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              تعلم مجاناً من خلال مكتبة الدروس المفتوحة لدينا. محتوى عالي الجودة
              لرفع مهاراتك وتطوير قدراتك في شتى المجالات.
            </p>
          </div>
        </div>
      </div>

      {/* Client Component handles filtering + pagination */}
      <FreeLessonsClient lessons={lessons} categories={categories} />
    </div>
  );
}
