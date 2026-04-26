"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Video,
  Type,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Zap,
  Save,
  MoreVertical,
  Edit3,
  Upload,
  Loader2,
  Heading1,
  Heading2,
  Quote,
  AlertTriangle,
  Minus,
  Eye,
  ExternalLink,
  UserCheck,
  ShieldCheck,
  Users,
  Info,
  Pencil,
} from "lucide-react";
import {
  createLessonAction,
  addLessonFieldAction,
  deleteLessonAction,
  deleteLessonFieldAction,
  updateLessonsOrderAction,
  updateFieldsOrderAction,
  getBunnyVideoGuidAction,
  getLessonCompletionStudentsAction,
  toggleLessonAvailabilityAction,
  getLessonAvailabilityMapAction,
  getLessonHiddenMapAction,
  toggleLessonHiddenAction,
  updateLessonFieldAction,
  updateLessonAction,
} from "@/app/actions/lms-v2";
import { toast } from "sonner";
import { uploadFile } from "@/lib/multipart-upload";
import CoursePlayer from "../student/CoursePlayer";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Reorder } from "framer-motion";
import Swal from "sweetalert2";

interface LessonField {
  id: string;
  fieldType: string;
  content: string;
  order: number;
}

interface Lesson {
  id: string;
  courseId: string | null;
  sectionId: string | null;
  mainTitle: string;
  subTitle?: string | null;
  order: number;
  fields: LessonField[];
  completionsCount?: number;
}

export default function CourseCurriculumBuilder({
  courseId,
  initialLessons,
  sections = [],
  courseType = "online",
  initialSectionId,
}: {
  courseId: string;
  initialLessons: any[];
  sections?: any[];
  courseType?: string;
  initialSectionId?: string;
}) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    initialSectionId !== undefined ? initialSectionId : "",
  );
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonSubTitle, setNewLessonSubTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedLessonIdForStudents, setSelectedLessonIdForStudents] =
    useState<string | null>(null);
  const [selectedLessonIdForAvailability, setSelectedLessonIdForAvailability] =
    useState<string | null>(null);

  // جلب المنهج الخاص بالقسم النشط أو الكورس
  useEffect(() => {
    const fetchCurriculum = async () => {
      setIsLoadingCurriculum(true);
      const { getCourseCurriculumAction } =
        await import("@/app/actions/lms-v2");

      // إذا كان هناك قسم نشط، نجلب المنهج المدمج، وإلا نجلب المنهج العام
      const res = await getCourseCurriculumAction(
        activeSectionId || courseId,
        activeSectionId ? "section" : "course",
      );

      if (res.success && res.data) {
        setLessons(res.data as any);
      } else {
        setLessons([]);
      }
      setIsLoadingCurriculum(false);
    };
    fetchCurriculum();
  }, [courseId, activeSectionId]);

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;

    const res = await createLessonAction({
      courseId: courseId,
      sectionId: activeSectionId,
      mainTitle: newLessonTitle,
      subTitle: newLessonSubTitle || undefined,
    });

    if (res.success && res.data) {
      const newLesson: Lesson = {
        id: res.data.id,
        courseId: res.data.courseId,
        sectionId: res.data.sectionId,
        mainTitle: res.data.mainTitle,
        subTitle: res.data.subTitle,
        order: res.data.order,
        fields: [],
      };
      setLessons([...lessons, newLesson]);
      setNewLessonTitle("");
      setNewLessonSubTitle("");
      setIsAddingLesson(false);
      toast.success("تم إضافة الدرس بنجاح");
    } else {
      toast.error("فشل إضافة الدرس");
    }
  };

  const handleReorderLessons = async (newOrder: Lesson[]) => {
    setLessons(newOrder);
    const updates = newOrder.map((l, idx) => ({ id: l.id, order: idx + 1 }));
    await updateLessonsOrderAction(updates);
  };

  return (
    <div className="space-y-12" dir="rtl">
      {/* Students List Modal */}
      {selectedLessonIdForStudents && (
        <StudentsListModal
          lessonId={selectedLessonIdForStudents}
          onClose={() => setSelectedLessonIdForStudents(null)}
        />
      )}

      {selectedLessonIdForAvailability && (
        <LessonAvailabilityModal
          lessonId={selectedLessonIdForAvailability}
          sections={sections}
          courseType={courseType}
          onClose={() => setSelectedLessonIdForAvailability(null)}
        />
      )}

      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900">
              {activeSectionId
                ? "بناء منهج الشعبة"
                : "بناء المنهج العام (الثابت)"}
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
              إجمالي الدروس المعروضة: {lessons.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Section Selector */}
          <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mr-2 px-2">
              العرض:
            </span>
            <select
              value={activeSectionId}
              onChange={(e) => setActiveSectionId(e.target.value)}
              className="bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none min-w-[180px]"
            >
              <option value="">📖 المنهج العام (الثابت)</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  🏫 الشعبة {s.sectionNumber} - {s.location || s.courseType}
                </option>
              ))}
            </select>
          </div>

          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <button className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100">
                <Eye className="w-5 h-5" />
                معاينة الطالب
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 overflow-hidden rounded-[40px] border-none shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-zinc-50 flex flex-col sm:max-w-none gap-0">
              <DialogHeader className="p-4 bg-white border-b border-zinc-100 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-zinc-900">
                      وضع المعاينة المباشرة
                    </DialogTitle>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      هكذا سيظهر الدرس لطلابك
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-hidden">
                <CoursePlayer
                  course={{ title: "معاينة المنهج الدراسي" }}
                  lessons={lessons}
                  initialProgress={[]}
                  courseType="online"
                  isPreview={true}
                />
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={() => setIsAddingLesson(true)}
            className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            إضافة درس جديد
          </button>
        </div>
      </div>

      {isLoadingCurriculum && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[40px] border border-zinc-100">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-black text-zinc-400">
            جاري تحميل منهج الدورة...
          </p>
        </div>
      )}

      {/* Add Lesson Modal/Inline Form */}
      {isAddingLesson && (
        <div className="bg-white p-8 rounded-[40px] border-2 border-primary/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            بيانات الدرس الجديد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mr-2">
                العنوان الأساسي *
              </label>
              <input
                type="text"
                placeholder="مثلاً: مقدمة في البرمجة"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mr-2">
                العنوان الفرعي (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثلاً: نظرة عامة على التقنيات"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={newLessonSubTitle}
                onChange={(e) => setNewLessonSubTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAddingLesson(false)}
              className="px-6 py-3 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddLesson}
              disabled={!newLessonTitle.trim()}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              حفظ الدرس
            </button>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <Reorder.Group
        axis="y"
        values={lessons}
        onReorder={handleReorderLessons}
        className="space-y-6"
      >
        {lessons.map((lesson, index) => (
          <Reorder.Item key={lesson.id} value={lesson}>
            <LessonCard
              lesson={lesson}
              index={index}
              onFieldAdded={(field) => {
                const updated = [...lessons];
                const lIdx = updated.findIndex((l) => l.id === lesson.id);
                updated[lIdx].fields.push(field);
                setLessons(updated);
              }}
              onDeleteLesson={(id) =>
                setLessons(lessons.filter((l) => l.id !== id))
              }
              onFieldDeleted={(lessonId, fieldId) => {
                const updated = [...lessons];
                const lIdx = updated.findIndex((l) => l.id === lessonId);
                updated[lIdx].fields = updated[lIdx].fields.filter(
                  (f) => f.id !== fieldId,
                );
                setLessons(updated);
              }}
              onReorderFields={(lessonId, newFields) => {
                const updated = [...lessons];
                const lIdx = updated.findIndex((l) => l.id === lessonId);
                updated[lIdx].fields = newFields;
                setLessons(updated);
              }}
              onShowStudents={setSelectedLessonIdForStudents}
              onManageAvailability={setSelectedLessonIdForAvailability}
              hasSections={sections.length > 0}
              isGlobalMode={!activeSectionId}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

function LessonCard({
  lesson,
  index,
  onFieldAdded,
  onDeleteLesson,
  onFieldDeleted,
  onReorderFields,
  onShowStudents,
  onManageAvailability,
  hasSections,
  isGlobalMode,
}: {
  lesson: Lesson;
  index: number;
  onFieldAdded: (f: any) => void;
  onDeleteLesson: (id: string) => void;
  onFieldDeleted: (lessonId: string, fieldId: string) => void;
  onReorderFields: (lessonId: string, fields: any[]) => void;
  onShowStudents: (id: string) => void;
  onManageAvailability: (id: string) => void;
  hasSections: boolean;
  isGlobalMode: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editMainTitle, setEditMainTitle] = useState(lesson.mainTitle);
  const [editSubTitle, setEditSubTitle] = useState(lesson.subTitle || "");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldContent, setEditFieldContent] = useState("");
  const [isSavingField, setIsSavingField] = useState(false);

  const handleSaveTitle = async () => {
    if (!editMainTitle.trim()) return;
    setIsSavingTitle(true);
    const res = await updateLessonAction(lesson.id, {
      mainTitle: editMainTitle,
      subTitle: editSubTitle || undefined,
    });
    if (res.success) {
      lesson.mainTitle = editMainTitle;
      lesson.subTitle = editSubTitle;
      toast.success("تم حفظ عنوان الدرس");
      setIsEditingTitle(false);
    } else {
      toast.error("فشل الحفظ");
    }
    setIsSavingTitle(false);
  };

  const handleStartEditField = (field: LessonField) => {
    setEditingFieldId(field.id);
    setEditFieldContent(field.content);
  };

  const handleSaveField = async (fieldId: string) => {
    setIsSavingField(true);
    const res = await updateLessonFieldAction(fieldId, {
      content: editFieldContent,
    });
    if (res.success) {
      const f = lesson.fields.find((f) => f.id === fieldId);
      if (f) f.content = editFieldContent;
      toast.success("تم حفظ المحتوى");
      setEditingFieldId(null);
    } else {
      toast.error("فشل الحفظ");
    }
    setIsSavingField(false);
  };

  const handleDeleteLesson = async () => {
    const result = await Swal.fire({
      title: "حذف الدرس؟",
      text: "سيتم حذف هذا الدرس وكافة محتوياته نهائياً ولا يمكن التراجع!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#18181b",
      cancelButtonColor: "#f4f4f5",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "rounded-[32px] border-none shadow-2xl",
        confirmButton: "rounded-xl font-black px-6",
        cancelButton: "rounded-xl font-bold text-zinc-500",
      },
    });

    if (result.isConfirmed) {
      const res = await deleteLessonAction(lesson.id);
      if (res.success) {
        onDeleteLesson(lesson.id);
        toast.success("تم حذف الدرس بنجاح");
      }
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    const result = await Swal.fire({
      title: "حذف المحتوى؟",
      text: "هل أنت متأكد من حذف هذا الجزء من الدرس؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#18181b",
      cancelButtonColor: "#f4f4f5",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "rounded-[32px] border-none shadow-2xl",
        confirmButton: "rounded-xl font-black px-6",
        cancelButton: "rounded-xl font-bold text-zinc-500",
      },
    });

    if (result.isConfirmed) {
      const res = await deleteLessonFieldAction(fieldId);
      if (res.success) {
        onFieldDeleted(lesson.id, fieldId);
        toast.success("تم حذف الحقل");
      }
    }
  };

  const handleReorderFields = async (newFields: LessonField[]) => {
    onReorderFields(lesson.id, newFields);
    const updates = newFields.map((f, idx) => ({ id: f.id, order: idx + 1 }));
    await updateFieldsOrderAction(updates);
  };

  return (
    <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden group">
      {/* Lesson Header */}
      <div className="p-6 flex items-center justify-between border-b border-zinc-50 bg-white group-hover:bg-zinc-50/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
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
                  <button
                    onClick={handleSaveTitle}
                    disabled={isSavingTitle}
                    className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {isSavingTitle ? "جارٍ الحفظ..." : "حفظ"}
                  </button>
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="text-xs font-bold text-zinc-400 hover:text-zinc-600 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-black text-zinc-800">
                    {lesson.mainTitle}
                  </h4>
                  {!lesson.sectionId && (
                    <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-emerald-100">
                      Global
                    </span>
                  )}
                </div>
                {lesson.subTitle && (
                  <p className="text-[10px] text-zinc-500 font-bold">
                    {lesson.subTitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(lesson.completionsCount || 0) > 0 && (
            <button
              onClick={() => onShowStudents(lesson.id)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
            >
              <UserCheck className="w-3 h-3" />
              {lesson.completionsCount} طالب أنجزوا
            </button>
          )}
          {hasSections && (
            <button
              onClick={() => onManageAvailability(lesson.id)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-4 py-2 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100"
            >
              <ShieldCheck className="w-3 h-3" />
              إدارة الإتاحة
            </button>
          )}
          <button
            onClick={() => setIsAddingField(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
          >
            <Plus className="w-3 h-3" />
            إضافة محتوى
          </button>
          {!isEditingTitle && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-all"
              title="تعديل عنوان الدرس"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 rounded-xl transition-all"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => {
              if (!lesson.sectionId && !isGlobalMode) {
                toast.error(
                  "لا يمكن حذف الدروس العامة من داخل الشعبة. يرجى تعديل المنهج العام.",
                );
                return;
              }
              handleDeleteLesson();
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              !lesson.sectionId && !isGlobalMode
                ? "text-zinc-200 cursor-not-allowed"
                : "text-zinc-400 hover:bg-red-50 hover:text-red-500"
            }`}
            title={
              !lesson.sectionId && !isGlobalMode
                ? "هذا درس عام، لا يمكن حذفه من هنا"
                : "حذف الدرس"
            }
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lesson Content (Fields) */}
      {isExpanded && (
        <div className="p-6 bg-zinc-50/30 space-y-4">
          {lesson.fields.length === 0 && !isAddingField && (
            <div className="py-10 text-center text-zinc-400 font-bold text-sm bg-white/50 rounded-2xl border border-dashed border-zinc-200">
              لا يوجد محتوى في هذا الدرس بعد
            </div>
          )}

          <Reorder.Group
            axis="y"
            values={lesson.fields}
            onReorder={handleReorderFields}
            className="space-y-3"
          >
            {lesson.fields.map((field) => (
              <Reorder.Item key={field.id} value={field}>
                <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm group/field relative overflow-hidden">
                  {editingFieldId === field.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                          <FieldIcon type={field.fieldType} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                          {field.fieldType}
                        </span>
                      </div>
                      <textarea
                        value={editFieldContent}
                        onChange={(e) => setEditFieldContent(e.target.value)}
                        rows={
                          field.fieldType === "text" ||
                          field.fieldType === "quote"
                            ? 5
                            : 2
                        }
                        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="المحتوى..."
                        autoFocus
                        dir="auto"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveField(field.id)}
                          disabled={isSavingField}
                          className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                          {isSavingField ? "جارٍ الحفظ..." : "حفظ"}
                        </button>
                        <button
                          onClick={() => setEditingFieldId(null)}
                          className="text-xs font-bold text-zinc-400 hover:text-zinc-600 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-all"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="cursor-grab active:cursor-grabbing text-zinc-200 hover:text-zinc-400 transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 shrink-0">
                        <FieldIcon type={field.fieldType} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-bold text-zinc-400 mb-1 uppercase tracking-tighter">
                          {field.fieldType}
                        </div>
                        <div className="text-sm font-medium text-zinc-800 line-clamp-2">
                          {field.content}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-all">
                        <button
                          onClick={() => handleStartEditField(field)}
                          className="p-2 text-zinc-300 hover:text-blue-500 transition-all"
                          title="تعديل المحتوى"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-all"
                          title="حذف"
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

          {isAddingField && (
            <AddFieldForm
              lessonId={lesson.id}
              onCancel={() => setIsAddingField(false)}
              onSuccess={(f) => {
                onFieldAdded(f);
                setIsAddingField(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FieldIcon({ type }: { type: string }) {
  switch (type) {
    case "heading":
      return <Heading1 className="w-4 h-4" />;
    case "subheading":
      return <Heading2 className="w-4 h-4" />;
    case "text":
      return <Type className="w-4 h-4" />;
    case "video":
      return <Video className="w-4 h-4" />;
    case "image":
      return <ImageIcon className="w-4 h-4" />;
    case "file":
      return <FileText className="w-4 h-4" />;
    case "link":
      return <LinkIcon className="w-4 h-4" />;
    case "quote":
      return <Quote className="w-4 h-4" />;
    case "alert":
      return <AlertTriangle className="w-4 h-4" />;
    case "divider":
      return <Minus className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function AddFieldForm({
  lessonId,
  onCancel,
  onSuccess,
}: {
  lessonId: string;
  onCancel: () => void;
  onSuccess: (f: any) => void;
}) {
  const [type, setType] = useState("text");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    try {
      if (type === "video") {
        // 1. إنشاء الفيديو في Bunny والحصول على GUID
        const res = await getBunnyVideoGuidAction(file.name);
        if (!res.success || !res.guid) {
          toast.error(res.error || "فشل إنشاء الفيديو على Bunny");
          setUploadProgress(null);
          return;
        }

        // 2. الرفع المباشر إلى Bunny
        // ملاحظة: الـ API Key يجب أن يكون في .env وسيقوم السيرفر بجلبه
        // هنا سنستخدم XMLHttpRequest لمتابعة التقدم بدقة
        const xhr = new XMLHttpRequest();
        xhr.open(
          "PUT",
          `https://video.bunnycdn.com/library/${res.libraryId}/videos/${res.guid}`,
          true,
        );

        // ملاحظة هامة للمستخدم: يجب إضافة BUNNY_API_KEY و BUNNY_LIBRARY_ID في ملف .env
        // كحل مؤقت للمعاينة، سنستخدم المفتاح الذي زودتنا به
        xhr.setRequestHeader(
          "AccessKey",
          "c345649d-07ae-4a1b-a364dd8d9046-8f5d-418f",
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const embedUrl = `https://iframe.mediadelivery.net/embed/${res.libraryId}/${res.guid}`;
            setContent(embedUrl);
            toast.success("تم رفع الفيديو وتشفيره على Bunny بنجاح");
            setUploadProgress(null);
          } else {
            toast.error("خطأ أثناء رفع الفيديو لـ Bunny");
            setUploadProgress(null);
          }
        };

        xhr.onerror = () => {
          toast.error("حدث خطأ في الاتصال أثناء الرفع");
          setUploadProgress(null);
        };

        xhr.send(file);
      } else {
        // الرفع العادي للصور والملفات (S3/Cloudinary)
        const url = await uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });
        setContent(url);
        toast.success("تم رفع الملف بنجاح");
        setUploadProgress(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الملف");
      setUploadProgress(null);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && type !== "divider") return;
    setIsSubmitting(true);
    const res = await addLessonFieldAction({
      lessonId,
      fieldType: type,
      content: type === "divider" ? "---" : content,
    });
    setIsSubmitting(false);

    if (res.success) {
      onSuccess(res.data);
      toast.success("تم إضافة المحتوى");
    } else {
      toast.error("فشل الإضافة");
    }
  };

  const fieldTypes = [
    {
      id: "heading",
      label: "عنوان رئيسي",
      icon: <Heading1 className="w-4 h-4" />,
      color: "bg-blue-500",
    },
    {
      id: "subheading",
      label: "عنوان فرعي",
      icon: <Heading2 className="w-4 h-4" />,
      color: "bg-indigo-500",
    },
    {
      id: "text",
      label: "نص فقرة",
      icon: <Type className="w-4 h-4" />,
      color: "bg-zinc-800",
    },
    {
      id: "video",
      label: "فيديو",
      icon: <Video className="w-4 h-4" />,
      color: "bg-red-500",
    },
    {
      id: "image",
      label: "صورة",
      icon: <ImageIcon className="w-4 h-4" />,
      color: "bg-emerald-500",
    },
    {
      id: "file",
      label: "ملف",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-amber-500",
    },
    {
      id: "link",
      label: "رابط خارجي",
      icon: <LinkIcon className="w-4 h-4" />,
      color: "bg-blue-600",
    },
    {
      id: "quote",
      label: "اقتباس",
      icon: <Quote className="w-4 h-4" />,
      color: "bg-purple-500",
    },
    {
      id: "alert",
      label: "تنبيه",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-orange-500",
    },
    {
      id: "divider",
      label: "فاصل",
      icon: <Minus className="w-4 h-4" />,
      color: "bg-slate-400",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-[32px] border-2 border-primary/20 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {fieldTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setType(t.id);
              setContent("");
            }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${
              type === t.id
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "bg-zinc-50 text-zinc-400 border-transparent hover:border-zinc-200"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 ${type === t.id ? t.color : "bg-zinc-300"}`}
            >
              {t.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
              {t.label}
            </span>
          </button>
        ))}
      </div>
      {type !== "divider" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mr-2">
              محتوى {fieldTypes.find((f) => f.id === type)?.label}
            </label>

            {["video", "image", "file"].includes(type) && (
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept={
                    type === "image"
                      ? "image/*"
                      : type === "video"
                        ? "video/*"
                        : "*"
                  }
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadProgress !== null}
                  className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  {uploadProgress !== null ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {uploadProgress !== null
                    ? `جاري الرفع ${uploadProgress}%`
                    : `رفع ${fieldTypes.find((f) => f.id === type)?.label} مباشر`}
                </button>
              </div>
            )}
          </div>

          <textarea
            className="w-full bg-zinc-50 border border-zinc-100 rounded-[24px] p-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] transition-all"
            placeholder={
              type === "text"
                ? "اكتب المحتوى النصي هنا..."
                : type === "heading"
                  ? "اكتب العنوان الرئيسي هنا..."
                  : type === "link"
                    ? "https://example.com"
                    : "ضع الرابط هنا أو استخدم زر الرفع المباشر..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {uploadProgress !== null && (
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-zinc-400 hover:bg-zinc-50 transition-all"
        >
          إلغاء
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (type !== "divider" && !content.trim()) ||
            uploadProgress !== null
          }
          className="bg-zinc-900 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting
            ? "جاري الحفظ..."
            : `إضافة ${fieldTypes.find((f) => f.id === type)?.label}`}
        </button>
      </div>
    </div>
  );
}

/**
 * مودل عرض الطلاب الذين أكملوا الدرس
 */
function StudentsListModal({
  lessonId,
  onClose,
}: {
  lessonId: string;
  onClose: () => void;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await getLessonCompletionStudentsAction(lessonId);
      if (res.success && res.data) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
      setIsLoading(false);
    };
    fetchStudents();
  }, [lessonId]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-zinc-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl font-black relative z-10 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-primary" />
            الطلاب الذين أكملوا الدرس
          </h2>
          <p className="text-white/40 text-xs font-bold mt-2">
            قائمة بجميع الطلاب الذين أتموا كافة متطلبات هذا الدرس
          </p>
        </div>

        <div className="p-8 bg-white max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-bold text-zinc-400">
                جاري جلب قائمة المتفوقين...
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-10 h-10 text-zinc-200" />
              </div>
              <p className="text-lg font-black text-zinc-300 tracking-tight">
                لا يوجد طلاب أكملوا هذا الدرس بعد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-4 rounded-[24px] bg-zinc-50 border border-zinc-100 group hover:border-primary/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={
                        student.image ||
                        `https://ui-avatars.com/api/?name=${student.name}&background=random`
                      }
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-zinc-900 group-hover:text-primary transition-colors">
                      {student.name}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                      تم الإكمال في:{" "}
                      {new Date(student.completedAt).toLocaleDateString(
                        "ar-EG",
                      )}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * مودل إدارة إتاحة الدرس للشعب المختلفة
 */
function LessonAvailabilityModal({
  lessonId,
  sections,
  courseType,
  onClose,
}: {
  lessonId: string;
  sections: any[];
  courseType: string;
  onClose: () => void;
}) {
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, boolean>
  >({});
  const [hiddenMap, setHiddenMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      setIsLoading(true);
      const [availRes, hiddenRes] = await Promise.all([
        getLessonAvailabilityMapAction(lessonId),
        getLessonHiddenMapAction(lessonId),
      ]);

      if (availRes.success && availRes.data) {
        setAvailabilityMap(availRes.data);
      }
      if (hiddenRes.success && hiddenRes.data) {
        setHiddenMap(hiddenRes.data);
      }
      setIsLoading(false);
    };
    fetchStates();
  }, [lessonId]);

  const handleToggleAvailability = async (
    sectionId: string,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;
    setAvailabilityMap((prev) => ({ ...prev, [sectionId]: newStatus }));

    const res = await toggleLessonAvailabilityAction({
      sectionId,
      lessonId,
      isEnabled: newStatus,
    });

    if (!res.success) {
      toast.error("فشل في تحديث الحالة");
      setAvailabilityMap((prev) => ({ ...prev, [sectionId]: currentStatus }));
    } else {
      toast.success(newStatus ? "تم إتاحة الدرس لهذه الشعبة" : "تم قفل الدرس");
    }
  };

  const handleToggleHidden = async (
    sectionId: string,
    isCurrentlyHidden: boolean,
  ) => {
    const newHiddenStatus = !isCurrentlyHidden;
    setHiddenMap((prev) => ({ ...prev, [sectionId]: newHiddenStatus }));

    const res = await toggleLessonHiddenAction({
      sectionId,
      lessonId,
      isHidden: newHiddenStatus,
    });

    if (!res.success) {
      toast.error("فشل في تحديث الإخفاء");
      setHiddenMap((prev) => ({ ...prev, [sectionId]: isCurrentlyHidden }));
    } else {
      toast.success(
        newHiddenStatus
          ? "تم إخفاء الدرس نهائياً عن هذه الشعبة"
          : "تم استرجاع الدرس لهذه الشعبة",
      );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-zinc-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl font-black relative z-10 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            إدارة ظهور وإتاحة الدرس
          </h2>
          <p className="text-white/60 text-xs font-bold mt-2 uppercase tracking-widest">
            تحكم في إخفاء الدرس أو قفله لشعب محددة
          </p>
        </div>

        <div className="p-8 bg-white">
          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 flex gap-4">
            <Info className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs font-bold text-amber-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="font-black text-amber-900">
                    إخفاء الدرس (حذف من المنهج):{" "}
                  </span>
                  الدرس لن يظهر نهائياً للطلاب في هذه الشعبة، حتى عنوانه.
                </li>
                <li>
                  <span className="font-black text-amber-900">
                    حالة الإتاحة (قفل/فتح):{" "}
                  </span>
                  إذا كان الدرس غير مخفي، فسيظهر عنوانه للطلاب، ولكن لن يتمكنوا
                  من الدخول لمحتواه إلا إذا كان{" "}
                  <span className="font-black">متاحاً</span>.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="text-zinc-400 font-bold text-sm">
                  جاري جلب الإعدادات...
                </p>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 font-bold">
                لا توجد شعب مسجلة لهذا الكورس حالياً
              </div>
            ) : (
              sections.map((section) => {
                const isHidden = hiddenMap[section.id] || false;
                const isAvailable = availabilityMap[section.id] || false;

                return (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-5 rounded-[24px] border transition-all ${
                      isHidden
                        ? "bg-red-50/50 border-red-100 opacity-75"
                        : "bg-zinc-50 border-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center border shadow-sm ${
                          isHidden
                            ? "text-red-400 border-red-100"
                            : "text-zinc-400 border-zinc-100"
                        }`}
                      >
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p
                          className={`font-black ${isHidden ? "text-red-900" : "text-zinc-900"}`}
                        >
                          {section.name ||
                            `شعبة #${section.sectionNumber || "?"}`}
                        </p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                          نوع الشعبة: {section.type || courseType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleHidden(section.id, isHidden)}
                        className={`px-4 py-2 rounded-xl font-black text-[10px] transition-all border ${
                          isHidden
                            ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                            : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        {isHidden ? "مخفي نهائياً" : "ظاهر في المنهج"}
                      </button>

                      {!isHidden && (
                        <button
                          onClick={() =>
                            handleToggleAvailability(section.id, isAvailable)
                          }
                          className={`px-4 py-2 rounded-xl font-black text-[10px] transition-all border ${
                            isAvailable
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                              : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          {isAvailable ? "متاح (مفتوح)" : "مقفول للطلاب"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={onClose}
              className="bg-zinc-900 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
