"use client";

import React, { useState, useRef } from "react";
import {
  getFreeLessonsAction, getFreeLessonCategoriesAction,
  createFreeLessonAction, deleteFreeLessonAction, updateFreeLessonAction,
  createFreeLessonCategoryAction, updateFreeLessonCategoryAction, deleteFreeLessonCategoryAction,
} from "@/app/actions/free-lessons";
import {
  Plus, Trash2, Edit3, Video, Layout, ArrowRight, Loader2,
  ExternalLink, Tag, Upload, Pencil, ChevronDown, X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Swal from "sweetalert2";
import { uploadFile } from "@/lib/multipart-upload";

type Category = { id: string; title: string; imageUrl?: string | null; order: number };
type Lesson = {
  id: string; mainTitle: string; subTitle?: string | null;
  description?: string | null; order: number; isActive: boolean;
  categoryId?: string | null; category?: Category | null; fields?: any[];
};

interface Props {
  adminId: string;
  initialLessons: Lesson[];
  initialCategories: Category[];
}

export default function AdminFreeLessonsClient({ adminId, initialLessons, initialCategories }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [refreshing, setRefreshing] = useState(false);

  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState({ title: "", imageUrl: "" });
  const [catUploading, setCatUploading] = useState(false);
  const catFileRef = useRef<HTMLInputElement>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const editCatFileRef = useRef<HTMLInputElement>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newLesson, setNewLesson] = useState({ mainTitle: "", subTitle: "", description: "", categoryId: "" });

  const [editingLessonCat, setEditingLessonCat] = useState<string | null>(null);

  async function refresh() {
    setRefreshing(true);
    const [lr, cr] = await Promise.all([getFreeLessonsAction(), getFreeLessonCategoriesAction()]);
    if (lr.success) setLessons((lr.data as Lesson[]) || []);
    if (cr.success) setCategories((cr.data as Category[]) || []);
    setRefreshing(false);
  }

  async function uploadCatImage(file: File, isEdit: boolean) {
    setCatUploading(true);
    try {
      const url = await uploadFile(file, () => {});
      if (isEdit && editingCat) setEditingCat({ ...editingCat, imageUrl: url });
      else setNewCat(p => ({ ...p, imageUrl: url }));
      toast.success("تم رفع الصورة");
    } catch { toast.error("فشل رفع الصورة"); }
    setCatUploading(false);
  }

  async function handleAddCat() {
    if (!newCat.title.trim()) { toast.error("يرجى إدخال اسم التصنيف"); return; }
    const res = await createFreeLessonCategoryAction({ title: newCat.title, imageUrl: newCat.imageUrl || undefined });
    if (res.success) { toast.success("تم إضافة التصنيف"); setNewCat({ title: "", imageUrl: "" }); refresh(); }
    else toast.error("حدث خطأ");
  }

  async function handleSaveEditCat() {
    if (!editingCat) return;
    const res = await updateFreeLessonCategoryAction(editingCat.id, { title: editingCat.title, imageUrl: editingCat.imageUrl || undefined });
    if (res.success) { toast.success("تم التحديث"); setEditingCat(null); refresh(); }
    else toast.error("حدث خطأ");
  }

  async function handleDeleteCat(id: string) {
    const r = await Swal.fire({ title: "حذف التصنيف؟", icon: "warning", showCancelButton: true, confirmButtonColor: "#18181b", cancelButtonColor: "#f4f4f5", confirmButtonText: "احذف", cancelButtonText: "إلغاء", reverseButtons: true });
    if (r.isConfirmed) { const res = await deleteFreeLessonCategoryAction(id); if (res.success) { toast.success("تم الحذف"); refresh(); } }
  }

  async function handleAddLesson() {
    if (!newLesson.mainTitle) { toast.error("يرجى إدخال العنوان الأساسي"); return; }
    const res = await createFreeLessonAction({ mainTitle: newLesson.mainTitle, subTitle: newLesson.subTitle || undefined, description: newLesson.description || undefined, categoryId: newLesson.categoryId || undefined });
    if (res.success) { toast.success("تمت إضافة الدرس"); setIsAdding(false); setNewLesson({ mainTitle: "", subTitle: "", description: "", categoryId: "" }); refresh(); }
    else toast.error("حدث خطأ");
  }

  async function handleDelete(id: string) {
    const r = await Swal.fire({ title: "حذف الدرس؟", icon: "warning", showCancelButton: true, confirmButtonColor: "#18181b", cancelButtonColor: "#f4f4f5", confirmButtonText: "احذف", cancelButtonText: "إلغاء", reverseButtons: true });
    if (r.isConfirmed) { const res = await deleteFreeLessonAction(id); if (res.success) { toast.success("تم الحذف"); refresh(); } }
  }

  async function handleToggleActive(id: string, current: boolean) {
    await updateFreeLessonAction(id, { isActive: !current });
    setLessons(prev => prev.map(l => l.id === id ? { ...l, isActive: !current } : l));
  }

  async function handleAssignCategory(lessonId: string, categoryId: string | null) {
    const res = await updateFreeLessonAction(lessonId, { categoryId: categoryId ?? undefined });
    if (res.success) { toast.success("تم تحديث التصنيف"); setEditingLessonCat(null); refresh(); }
    else toast.error("حدث خطأ");
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 flex items-center gap-3 italic">
            <Video className="w-10 h-10 text-primary" /> الدروس المجانية
            {refreshing && <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />}
          </h1>
          <p className="text-zinc-500 font-bold mt-2">إدارة الدروس المتاحة للجميع بدون اشتراك</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAdding(!isAdding)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" /> إضافة درس جديد
          </button>
          <Link href={`/admin/${adminId}/home`}
            className="bg-white px-5 py-3 rounded-2xl border border-zinc-200 font-black text-sm flex items-center gap-2 hover:bg-zinc-50 transition-all">
            <ArrowRight className="w-4 h-4" /> العودة
          </Link>
        </div>
      </div>

      {/* Accordion: Categories */}
      <div className="mb-8 rounded-[28px] border border-zinc-200 overflow-hidden shadow-sm bg-white">
        <button onClick={() => setCatOpen(!catOpen)}
          className="w-full flex items-center justify-between px-8 py-5 hover:bg-zinc-50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-right">
              <p className="font-black text-zinc-900">التصنيفات</p>
              <p className="text-xs text-zinc-400 font-bold">{categories.length} تصنيف</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${catOpen ? "rotate-180" : ""}`} />
        </button>

        {catOpen && (
          <div className="border-t border-zinc-100 px-8 py-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {categories.map(cat => (
                <div key={cat.id} className="border border-zinc-100 rounded-2xl overflow-hidden group relative bg-zinc-50">
                  {editingCat?.id === cat.id ? (
                    <div className="p-3 space-y-2">
                      <input value={editingCat.title}
                        onChange={e => setEditingCat({ ...editingCat, title: e.target.value })}
                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white" />
                      <div className="relative w-full h-24 bg-white rounded-xl overflow-hidden border border-zinc-100 cursor-pointer"
                        onClick={() => editCatFileRef.current?.click()}>
                        {editingCat.imageUrl
                          ? <img src={editingCat.imageUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            {catUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          </div>}
                        <input ref={editCatFileRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { if (e.target.files?.[0]) uploadCatImage(e.target.files[0], true); }} />
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={handleSaveEditCat} className="flex-1 bg-violet-600 text-white text-xs font-black py-2 rounded-xl hover:bg-violet-700">حفظ</button>
                        <button onClick={() => setEditingCat(null)} className="flex-1 bg-zinc-100 text-zinc-500 text-xs font-black py-2 rounded-xl">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-full h-24 bg-zinc-200 relative overflow-hidden">
                        {cat.imageUrl
                          ? <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-zinc-400"><Tag className="w-8 h-8" /></div>}
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="font-black text-xs text-zinc-800 truncate flex-1">{cat.title}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => setEditingCat(cat)} className="p-1 bg-white text-zinc-400 hover:text-violet-600 rounded-lg transition-all shadow-sm"><Pencil className="w-3 h-3" /></button>
                          <button onClick={() => handleDeleteCat(cat.id)} className="p-1 bg-white text-zinc-400 hover:text-red-500 rounded-lg transition-all shadow-sm"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* New category card */}
              <div className="border-2 border-dashed border-violet-200 rounded-2xl p-3 space-y-2 bg-violet-50/40">
                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">تصنيف جديد</p>
                <input value={newCat.title} onChange={e => setNewCat(p => ({ ...p, title: e.target.value }))}
                  placeholder="اسم التصنيف"
                  className="w-full border border-violet-100 bg-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-300" />
                <div className="relative w-full h-20 bg-white rounded-xl overflow-hidden border border-violet-100 cursor-pointer"
                  onClick={() => catFileRef.current?.click()}>
                  {newCat.imageUrl
                    ? <img src={newCat.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex flex-col items-center justify-center text-violet-300 gap-1">
                      {catUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="text-[9px] font-bold">{catUploading ? "جاري الرفع..." : "صورة التصنيف"}</span>
                    </div>}
                  <input ref={catFileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) uploadCatImage(e.target.files[0], false); }} />
                </div>
                <button onClick={handleAddCat}
                  className="w-full bg-violet-600 text-white text-xs font-black py-2 rounded-xl hover:bg-violet-700 transition-all flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> إضافة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Lesson Form */}
      {isAdding && (
        <div className="mb-8 bg-white p-8 rounded-[32px] border-2 border-primary/10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" /> بيانات الدرس الجديد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">العنوان الأساسي</label>
              <input type="text" value={newLesson.mainTitle}
                onChange={e => setNewLesson({ ...newLesson, mainTitle: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-5 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all"
                placeholder="مثلاً: مقدمة في البرمجة" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">العنوان الفرعي</label>
              <input type="text" value={newLesson.subTitle}
                onChange={e => setNewLesson({ ...newLesson, subTitle: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-5 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all"
                placeholder="اختياري..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Tag className="w-3 h-3" /> التصنيف
              </label>
              <select value={newLesson.categoryId}
                onChange={e => setNewLesson({ ...newLesson, categoryId: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-5 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all">
                <option value="">بدون تصنيف</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">وصف الدرس</label>
              <textarea value={newLesson.description}
                onChange={e => setNewLesson({ ...newLesson, description: e.target.value })}
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-5 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all min-h-[90px]"
                placeholder="وصف مختصر للدرس..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 font-black text-zinc-400 hover:text-zinc-600 transition-colors">إلغاء</button>
            <button onClick={handleAddLesson}
              className="bg-zinc-900 text-white px-10 py-3 rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-lg">
              حفظ الدرس
            </button>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[32px] p-20 text-center">
            <Video className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
            <p className="font-black text-zinc-400">لا توجد دروس مجانية حالياً</p>
          </div>
        ) : lessons.map(lesson => {
          const catImg = lesson.category?.imageUrl;
          const isEditingThisCat = editingLessonCat === lesson.id;
          return (
            <div key={lesson.id} className="bg-white rounded-[28px] border border-zinc-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
              <div className="flex">
                <div className="w-40 shrink-0 relative bg-zinc-100 overflow-hidden">
                  {catImg
                    ? <img src={catImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-zinc-300 p-4">
                      <Video className="w-8 h-8" />
                      <span className="text-[9px] font-bold text-center">بدون تصنيف</span>
                    </div>}
                  {lesson.category && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] font-black px-2 py-1 text-center truncate backdrop-blur-sm">
                      {lesson.category.title}
                    </div>
                  )}
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${lesson.isActive ? 'bg-primary/10 text-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                        {lesson.order}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-zinc-900 group-hover:text-primary transition-colors truncate">{lesson.mainTitle}</h3>
                        {lesson.subTitle && <p className="text-zinc-500 text-sm font-bold italic truncate">{lesson.subTitle}</p>}
                        {lesson.description && <p className="text-zinc-400 text-xs font-bold mt-1 line-clamp-1">{lesson.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggleActive(lesson.id, lesson.isActive)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lesson.isActive ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                        {lesson.isActive ? "نشط" : "معطل"}
                      </button>
                      <Link href={`/admin/${adminId}/free-lessons/${lesson.id}`}
                        className="p-2 bg-zinc-50 text-zinc-500 rounded-xl hover:bg-zinc-900 hover:text-white transition-all">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(lesson.id)}
                        className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-black text-zinc-400 flex items-center gap-1">
                      <Layout className="w-3 h-3" /> {lesson.fields?.length || 0} حقل
                    </span>
                    {isEditingThisCat ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select defaultValue={lesson.categoryId || ""}
                          onChange={e => handleAssignCategory(lesson.id, e.target.value || null)}
                          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-300">
                          <option value="">بدون تصنيف</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <button onClick={() => setEditingLessonCat(null)} className="p-1.5 bg-zinc-100 rounded-lg text-zinc-400 hover:bg-zinc-200">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingLessonCat(lesson.id)}
                        className="flex items-center gap-1.5 text-[10px] font-black text-violet-500 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-all">
                        <Tag className="w-3 h-3" />
                        {lesson.category ? `تغيير: ${lesson.category.title}` : "تعيين تصنيف"}
                      </button>
                    )}
                    <Link href={`/free-lessons/${lesson.id}`} target="_blank"
                      className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 mr-auto">
                      <ExternalLink className="w-3 h-3" /> عرض في الموقع
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
