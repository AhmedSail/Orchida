"use client";

import React, { useState, useEffect, use, useRef } from "react";
import {
  getFreeLessonsAction,
  addFreeLessonFieldAction,
  deleteFreeLessonFieldAction,
  updateFreeLessonFieldAction,
  updateFreeLessonAction,
  reorderFreeLessonFieldsAction,
} from "@/app/actions/free-lessons";
import {
  Plus,
  Trash2,
  Video,
  Type,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  GripVertical,
  ArrowRight,
  Loader2,
  Save,
  Heading1,
  Heading2,
  Quote,
  AlertTriangle,
  Minus,
  Pencil,
  Layout,
  ExternalLink,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Reorder } from "framer-motion";
import Swal from "sweetalert2";
import { uploadFile } from "@/lib/multipart-upload";

export default function FreeLessonBuilderPage({ params }: { params: Promise<{ adminId: string; lessonId: string }> }) {
  const { adminId, lessonId } = use(params);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editMainTitle, setEditMainTitle] = useState("");
  const [editSubTitle, setEditSubTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldContent, setEditFieldContent] = useState("");
  const [isSavingField, setIsSavingField] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState<number | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  async function loadLesson() {
    setLoading(true);
    const res = await getFreeLessonsAction();
    if (res.success) {
      const found = res.data?.find((l: any) => l.id === lessonId);
      if (found) {
        setLesson(found);
        setEditMainTitle(found.mainTitle);
        setEditSubTitle(found.subTitle || "");
      } else {
        toast.error("الدرس غير موجود");
      }
    }
    setLoading(false);
  }

  const handleSaveTitle = async () => {
    if (!editMainTitle.trim()) return;
    setIsSavingTitle(true);
    const res = await updateFreeLessonAction(lessonId, {
      mainTitle: editMainTitle,
      subTitle: editSubTitle || undefined,
    });
    if (res.success) {
      toast.success("تم حفظ عنوان الدرس");
      setIsEditingTitle(false);
      loadLesson();
    }
    setIsSavingTitle(false);
  };

  const handleDeleteField = async (fieldId: string) => {
     const result = await Swal.fire({
      title: "حذف المحتوى؟",
      text: "هل أنت متأكد من حذف هذا الجزء من الدرس؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#18181b",
      cancelButtonColor: "#f4f4f5",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const res = await deleteFreeLessonFieldAction(fieldId);
      if (res.success) {
        toast.success("تم الحذف");
        loadLesson();
      }
    }
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditUploadProgress(0);
    try {
      const url = await uploadFile(file, (progress) => {
        setEditUploadProgress(progress);
      });
      setEditFieldContent(url);
      toast.success("تم رفع الملف بنجاح");
      setEditUploadProgress(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الملف");
      setEditUploadProgress(null);
    }
  };

  const handleSaveField = async (fieldId: string) => {
    setIsSavingField(true);
    const res = await updateFreeLessonFieldAction(fieldId, {
      content: editFieldContent,
    });
    if (res.success) {
      toast.success("تم الحفظ");
      setEditingFieldId(null);
      loadLesson();
    }
    setIsSavingField(false);
  };

  const handleReorderFields = async (newFields: any[]) => {
    setLesson({ ...lesson, fields: newFields });
  };

  const handleSaveOrder = async () => {
    if (!lesson?.fields) return;
    setIsSavingOrder(true);
    const updatedFields = lesson.fields.map((f: any, index: number) => ({
      id: f.id,
      order: index + 1,
    }));
    const res = await reorderFreeLessonFieldsAction(updatedFields);
    if (res.success) {
      toast.success("تم حفظ ترتيب المحتوى بنجاح");
      loadLesson();
    } else {
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setIsSavingOrder(false);
  };

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-black text-zinc-400">جاري تحميل محتوى الدرس...</p>
      </div>
    );
  }

  if (!lesson) return <div className="p-20 text-center font-bold text-zinc-400">الدرس غير موجود</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
            <Layout className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
             {isEditingTitle ? (
               <div className="space-y-2">
                 <input
                   value={editMainTitle}
                   onChange={(e) => setEditMainTitle(e.target.value)}
                   className="w-full border border-zinc-200 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                   placeholder="عنوان الدرس"
                   autoFocus
                 />
                 <input
                   value={editSubTitle}
                   onChange={(e) => setEditSubTitle(e.target.value)}
                   className="w-full border border-zinc-100 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 text-zinc-500"
                   placeholder="العنوان الفرعي (اختياري)"
                 />
                 <div className="flex gap-2">
                   <button onClick={handleSaveTitle} disabled={isSavingTitle} className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-all">
                     {isSavingTitle ? "حفظ..." : "حفظ"}
                   </button>
                   <button onClick={() => setIsEditingTitle(false)} className="text-xs font-bold text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-all">
                     إلغاء
                   </button>
                 </div>
               </div>
             ) : (
               <>
                 <h1 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                   {lesson.mainTitle}
                   <button onClick={() => setIsEditingTitle(true)} className="text-zinc-300 hover:text-primary transition-colors">
                     <Pencil className="w-4 h-4" />
                   </button>
                 </h1>
                 <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                   إدارة محتوى الدرس المجاني
                 </p>
               </>
             )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveOrder}
            disabled={isSavingOrder}
            className="bg-zinc-900 text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isSavingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
          <Link href={`/free-lessons/${lessonId}`} target="_blank" className="bg-emerald-50 text-emerald-600 px-5 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100">
            <ExternalLink className="w-4 h-4" />
            معاينة
          </Link>
          <Link
            href={`/admin/${adminId}/free-lessons`}
            className="bg-white px-5 py-3 rounded-2xl border border-zinc-200 font-black text-sm flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm"
          >
            <ArrowRight className="w-4 h-4" /> العودة
          </Link>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="space-y-6">
        <Reorder.Group axis="y" values={lesson.fields || []} onReorder={handleReorderFields} className="space-y-4">
          {lesson.fields?.map((field: any) => (
            <Reorder.Item key={field.id} value={field}>
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm group relative overflow-hidden">
                {editingFieldId === field.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                           <FieldIcon type={field.fieldType} />
                         </div>
                         <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{field.fieldType}</span>
                       </div>

                       {["image", "file", "video"].includes(field.fieldType) && (
                         <div className="relative">
                           <input
                             type="file"
                             ref={editFileInputRef}
                             className="hidden"
                             onChange={handleEditFileUpload}
                             accept={field.fieldType === "image" ? "image/*" : field.fieldType === "video" ? "video/*" : "*"}
                           />
                           <button
                             onClick={() => editFileInputRef.current?.click()}
                             disabled={editUploadProgress !== null}
                             className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                           >
                             {editUploadProgress !== null ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                             {editUploadProgress !== null ? `جاري الرفع ${editUploadProgress}%` : `رفع مباشر`}
                           </button>
                         </div>
                       )}
                    </div>

                    <textarea
                      value={editFieldContent}
                      onChange={(e) => setEditFieldContent(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 font-bold focus:border-primary/30 focus:ring-0 transition-all min-h-[100px]"
                      placeholder={
                        field.fieldType === "text" ? "اكتب المحتوى النصي هنا..." :
                        field.fieldType === "video" ? "ضع رابط فيديو يوتيوب هنا، أو استخدم الرفع المباشر..." :
                        field.fieldType === "link" ? "https://example.com" :
                        "ضع الرابط هنا أو استخدم زر الرفع المباشر..."
                      }
                      autoFocus
                    />

                    {editUploadProgress !== null && (
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                         <div className="h-full bg-primary transition-all" style={{ width: `${editUploadProgress}%` }} />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setEditingFieldId(null)}
                        className="px-6 py-2 font-bold text-zinc-400 hover:bg-zinc-50 rounded-xl transition-all"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSaveField(field.id)}
                        disabled={isSavingField || editUploadProgress !== null}
                        className="bg-zinc-900 text-white px-8 py-2 rounded-xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSavingField ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        حفظ التعديلات
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <GripVertical className="w-5 h-5 text-zinc-200 cursor-grab active:cursor-grabbing" />
                      <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                         <FieldIcon type={field.fieldType} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">{field.fieldType}</p>
                        <p className="text-zinc-800 font-bold line-clamp-2">{field.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => { setEditingFieldId(field.id); setEditFieldContent(field.content); }}
                        className="p-3 bg-zinc-50 text-zinc-300 hover:text-primary rounded-xl transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-3 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Add Actions Form */}
        {isAddingField ? (
          <div className="animate-in zoom-in-95 duration-200">
            <AddFieldForm 
              lessonId={lessonId} 
              onCancel={() => setIsAddingField(false)} 
              onSuccess={() => { setIsAddingField(false); loadLesson(); }} 
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAddingField(true)}
            className="w-full py-10 bg-white border-2 border-dashed border-zinc-200 rounded-[40px] text-zinc-400 font-black hover:border-primary/40 hover:text-primary transition-all flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
               <Plus className="w-8 h-8" />
            </div>
            إضافة محتوى جديد للدرس
          </button>
        )}
      </div>
    </div>
  );
}

function FieldIcon({ type }: { type: string }) {
  switch (type) {
    case "heading": return <Heading1 className="w-4 h-4" />;
    case "subheading": return <Heading2 className="w-4 h-4" />;
    case "text": return <Type className="w-4 h-4" />;
    case "video": return <Video className="w-4 h-4" />;
    case "image": return <ImageIcon className="w-4 h-4" />;
    case "file": return <FileText className="w-4 h-4" />;
    case "link": return <LinkIcon className="w-4 h-4" />;
    case "quote": return <Quote className="w-4 h-4" />;
    case "alert": return <AlertTriangle className="w-4 h-4" />;
    case "divider": return <Minus className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
}

/**
 * Add Field Form Component
 */
function AddFieldForm({ lessonId, onCancel, onSuccess }: { lessonId: string, onCancel: () => void, onSuccess: () => void }) {
  const [type, setType] = useState("text");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fieldTypes = [
    { id: "heading", label: "عنوان", icon: <Heading1 className="w-4 h-4" />, color: "bg-blue-500" },
    { id: "subheading", label: "فرعي", icon: <Heading2 className="w-4 h-4" />, color: "bg-indigo-500" },
    { id: "text", label: "نص", icon: <Type className="w-4 h-4" />, color: "bg-zinc-800" },
    { id: "video", label: "فيديو", icon: <Video className="w-4 h-4" />, color: "bg-red-500" },
    { id: "image", label: "صورة", icon: <ImageIcon className="w-4 h-4" />, color: "bg-emerald-500" },
    { id: "file", label: "ملف", icon: <FileText className="w-4 h-4" />, color: "bg-amber-500" },
    { id: "quote", label: "اقتباس", icon: <Quote className="w-4 h-4" />, color: "bg-purple-500" },
    { id: "alert", label: "تنبيه", icon: <AlertTriangle className="w-4 h-4" />, color: "bg-orange-500" },
    { id: "divider", label: "فاصل", icon: <Minus className="w-4 h-4" />, color: "bg-slate-400" },
    { id: "link", label: "رابط", icon: <LinkIcon className="w-4 h-4" />, color: "bg-blue-600" },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    try {
      const url = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      setContent(url);
      toast.success("تم رفع الملف بنجاح");
      setUploadProgress(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الملف");
      setUploadProgress(null);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && type !== "divider") return;
    setIsSubmitting(true);
    const res = await addFreeLessonFieldAction({
      lessonId,
      fieldType: type,
      content: type === "divider" ? "---" : content,
    });
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      toast.success("تم إضافة المحتوى");
    } else {
      toast.error("فشل الإضافة");
    }
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border-2 border-primary/20 shadow-2xl space-y-8">
      <div className="flex items-center justify-between">
         <h3 className="text-lg font-black flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            إضافة محتوى جديد
         </h3>
         <button onClick={onCancel} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
            <X className="w-5 h-5 text-zinc-400" />
         </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {fieldTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => { setType(t.id); setContent(""); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              type === t.id ? "border-primary bg-primary/5 text-primary shadow-sm" : "bg-zinc-50 text-zinc-400 border-transparent hover:border-zinc-200"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${type === t.id ? t.color : "bg-zinc-300"}`}>
              {t.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{t.label}</span>
          </button>
        ))}
      </div>

      {type !== "divider" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mr-2">
              محتوى {fieldTypes.find(f => f.id === type)?.label}
            </label>

            {["image", "file", "video"].includes(type) && (
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept={type === "image" ? "image/*" : type === "video" ? "video/*" : "*"}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadProgress !== null}
                  className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  {uploadProgress !== null ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {uploadProgress !== null ? `جاري الرفع ${uploadProgress}%` : `رفع ${type === "image" ? "صورة" : type === "video" ? "فيديو" : "ملف"} مباشر`}
                </button>
              </div>
            )}
          </div>

          <textarea
            className="w-full bg-zinc-50 border border-zinc-100 rounded-[24px] p-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] transition-all"
            placeholder={
              type === "text" ? "اكتب المحتوى النصي هنا..." :
              type === "video" ? "ضع رابط فيديو يوتيوب هنا..." :
              type === "link" ? "https://example.com" :
              "ضع الرابط هنا أو استخدم زر الرفع المباشر..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {uploadProgress !== null && (
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onCancel} className="px-6 py-3 rounded-2xl text-sm font-bold text-zinc-400">إلغاء</button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (type !== "divider" && !content.trim()) || uploadProgress !== null}
          className="bg-zinc-900 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "جاري الحفظ..." : `إضافة ${fieldTypes.find(f => f.id === type)?.label}`}
        </button>
      </div>
    </div>
  );
}
