"use client";

import React, { useState, useEffect, use } from "react";
import {
  getFreeLessonsAction,
  createFreeLessonAction,
  deleteFreeLessonAction,
  updateFreeLessonAction,
} from "@/app/actions/free-lessons";
import {
  Plus,
  Trash2,
  Edit3,
  Video,
  Layout,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminFreeLessonsPage({ params }: { params: Promise<{ adminId: string }> }) {
  const { adminId } = use(params);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newLesson, setNewLesson] = useState({
    mainTitle: "",
    subTitle: "",
    description: "",
  });

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    setLoading(true);
    const res = await getFreeLessonsAction();
    if (res.success) {
      setLessons(res.data || []);
    }
    setLoading(false);
  }

  const handleAddLesson = async () => {
    if (!newLesson.mainTitle) {
      toast.error("يرجى إدخال العنوان الأساسي");
      return;
    }
    const res = await createFreeLessonAction(newLesson);
    if (res.success) {
      toast.success("تمت إضافة الدرس بنجاح");
      setIsAdding(false);
      setNewLesson({ mainTitle: "", subTitle: "", description: "" });
      loadLessons();
    } else {
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "حذف الدرس؟",
      text: "هل أنت متأكد من حذف هذا الدرس نهائياً؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#18181b",
      cancelButtonColor: "#f4f4f5",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const res = await deleteFreeLessonAction(id);
      if (res.success) {
        toast.success("تم الحذف بنجاح");
        loadLessons();
      }
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const res = await updateFreeLessonAction(id, { isActive: !current });
    if (res.success) {
      setLessons(lessons.map(l => l.id === id ? { ...l, isActive: !current } : l));
      toast.success("تم تحديث حالة الدرس");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-black text-zinc-400">جاري تحميل الدروس...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 flex items-center gap-3 italic">
            <Video className="w-10 h-10 text-primary" />
            الدروس المجانية
          </h1>
          <p className="text-zinc-500 font-bold mt-2">
            إدارة الدروس المتاحة للجميع بدون اشتراك
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            إضافة درس جديد
          </button>
          <Link
            href={`/admin/${adminId}/home`}
            className="bg-white px-6 py-3 rounded-2xl border border-zinc-200 font-black text-sm flex items-center gap-2 hover:bg-zinc-50 transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة
          </Link>
        </div>
      </div>

      {/* Add Form Overlay */}
      {isAdding && (
        <div className="mb-12 bg-white p-8 rounded-[40px] border-4 border-primary/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" />
            بيانات الدرس الجديد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-zinc-400 mr-2 uppercase tracking-widest">العنوان الأساسي</label>
              <input
                type="text"
                value={newLesson.mainTitle}
                onChange={(e) => setNewLesson({ ...newLesson, mainTitle: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all"
                placeholder="مثلاً: مقدمة في البرمجة"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-zinc-400 mr-2 uppercase tracking-widest">العنوان الفرعي</label>
              <input
                type="text"
                value={newLesson.subTitle}
                onChange={(e) => setNewLesson({ ...newLesson, subTitle: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all"
                placeholder="اختياري..."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-black text-zinc-400 mr-2 uppercase tracking-widest">وصف الدرس</label>
              <textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all min-h-[120px]"
                placeholder="اكتب وصفاً مختصراً للدرس..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setIsAdding(false)}
              className="px-8 py-4 font-black text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddLesson}
              className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10"
            >
              حفظ الدرس
            </button>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="grid grid-cols-1 gap-6">
        {lessons.length === 0 ? (
          <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[40px] p-20 text-center">
            <Video className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
            <p className="font-black text-zinc-400">لا توجد دروس مجانية حالياً</p>
          </div>
        ) : (
          lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white p-6 md:p-8 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-2xl transition-all ${lesson.isActive ? 'bg-primary/10 text-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                    {lesson.order}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 group-hover:text-primary transition-colors">
                      {lesson.mainTitle}
                    </h3>
                    {lesson.subTitle && (
                      <p className="text-zinc-500 font-bold mt-1 italic opacity-70">
                        {lesson.subTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <button
                    onClick={() => handleToggleActive(lesson.id, lesson.isActive)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      lesson.isActive
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    {lesson.isActive ? "نشط" : "معطل"}
                  </button>

                  <Link
                    href={`/admin/${adminId}/free-lessons/${lesson.id}`}
                    className="p-3 bg-zinc-50 text-zinc-600 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm group/btn"
                  >
                    <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </Link>

                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group/btn"
                  >
                    <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Quick Preview of fields count */}
              <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center gap-4">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Layout className="w-3 h-3" />
                  محتوى الدرس: {lesson.fields?.length || 0} حقول
                </span>
                <Link 
                   href={`/free-lessons/${lesson.id}`} 
                   target="_blank"
                   className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 mr-auto"
                >
                  <ExternalLink className="w-3 h-3" />
                  عرض في الموقع
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
