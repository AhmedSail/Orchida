"use client";

import React, { useState, useEffect } from "react";
import SectionContent from "./SectionContent";
import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  MessageSquare,
  AlertCircle,
  Calendar,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  UserCheck2,
  Phone,
  Mail,
  MoreVertical,
  Activity,
  StickyNote,
  Star,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "../ui/badge";
import EditNotesDialog from "./EditNotesDialog";
import AddRecommendationDialog from "./AddRecommendationDialog";
import EditRecommendationDialog from "./EditRecommendationDialog";
import Swal from "sweetalert2";
import { Edit2 } from "lucide-react";

interface Section {
  id: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
  sectionStatus?: string;
  notes?: string | null;
  instructorId?: string | null;
}

interface Student {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  confirmationStatus: string | null;
}

interface Props {
  user: string;
  userId: string;
  instructorSections: {
    sectionId: string;
    sectionNumber: number;
    startDate: Date | null;
    endDate: Date | null;
    courseTitle: string | null;
  }[];
  section: Section | null;
  allModules: AllModules[];
  courseId: string;
  chapters: AllChapters[];
  contents: AllContent[];
  role?: string;
  students: Student[];
}

const Clasification = ({
  user,
  section: initialSection,
  allModules,
  userId,
  courseId,
  chapters,
  contents,
  role,
  students,
  instructorSections,
}: Props) => {
  const [activeTab, setActiveTab] = useState<
    "content" | "members" | "forum" | "recommendations" | "aiPrompts"
  >("content");
  const [aiPrompts, setAiPrompts] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showAddRec, setShowAddRec] = useState(false);
  const [showEditRec, setShowEditRec] = useState(false);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [section, setSection] = useState(initialSection);
  const [showEditNotes, setShowEditNotes] = useState(false);
  const router = useRouter();

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="size-12 text-red-500 animate-pulse" />
        <h3 className="text-xl font-bold">لا يوجد بيانات لهذه الشعبة</h3>
      </div>
    );
  }

  const tabItems: {
    id: "content" | "members" | "forum" | "recommendations" | "aiPrompts";
    label: string;
    icon: any;
    color: string;
    action: () => void;
  }[] = [
    {
      id: "content" as const,
      label: "المحتوى التعليمي",
      icon: BookOpen,
      color: "text-blue-500",
      action: () => {
        setActiveTab("content");
        const targetRole = role === "user" ? "dashboardUser" : "instructor";
        router.push(`/${targetRole}/${userId}/courses/${section.id}/content`);
      },
    },
    {
      id: "members" as const,
      label: "الأعضاء والطلاب",
      icon: Users,
      color: "text-emerald-500",
      action: () => setActiveTab("members"),
    },
    {
      id: "forum" as const,
      label: "المنتدى والنقاش",
      icon: MessageSquare,
      color: "text-purple-500",
      action: () => {
        const targetRole = role === "user" ? "dashboardUser" : "instructor";
        router.push(`/${targetRole}/${userId}/courses/${section.id}/chat`);
      },
    },
    {
      id: "recommendations" as const,
      label: "توصيات المدرب",
      icon: Star,
      color: "text-amber-500",
      action: () => setActiveTab("recommendations"),
    },
  ];

  if (courseId === "a837434d-58c3-422e-a21b-1d3fd4b485a5") {
    tabItems.splice(1, 0, {
      id: "aiPrompts" as const,
      label: "برومبات جاهزة",
      icon: Sparkles,
      color: "text-emerald-500",
      action: () => setActiveTab("aiPrompts"),
    });
  }

  const fetchRecommendations = async () => {
    if (!section?.instructorId) return;
    setLoadingRecs(true);
    try {
      const res = await fetch(
        `/api/recommendations?instructorId=${section.instructorId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchAiPrompts = async () => {
    if (!section?.id) return;
    setLoadingPrompts(true);
    try {
      const res = await fetch(`/api/ai-prompts?sectionId=${section.id}`);
      if (res.ok) {
        const data = await res.json();
        setAiPrompts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPrompts(false);
    }
  };

  useEffect(() => {
    if (activeTab === "recommendations") {
      fetchRecommendations();
    }
    if (activeTab === "aiPrompts") {
      fetchAiPrompts();
    }
  }, [activeTab, section?.instructorId, section?.id]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteRec = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه التوصية من جميع شعبك!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/recommendations/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          Swal.fire("تم الحذف", "تم حذف التوصية بنجاح", "success");
          fetchRecommendations();
        }
      } catch (error) {
        Swal.fire("خطأ", "فشل الحذف", "error");
      }
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Edit Notes Dialog */}
      {section && (
        <EditNotesDialog
          active={showEditNotes}
          setActive={setShowEditNotes}
          sectionId={section.id}
          initialNotes={section.notes || ""}
          onUpdate={(newNotes: string) =>
            setSection((prev: any) =>
              prev ? { ...prev, notes: newNotes } : null,
            )
          }
        />
      )}

      {/* Add Recommendation Dialog */}
      <AddRecommendationDialog
        active={showAddRec}
        setActive={setShowAddRec}
        onSuccess={fetchRecommendations}
        sections={instructorSections.map((s) => ({
          sectionId: s.sectionId,
          sectionNumber: s.sectionNumber,
          courseTitle: s.courseTitle,
        }))}
      />

      {/* Edit Recommendation Dialog */}
      <EditRecommendationDialog
        active={showEditRec}
        setActive={setShowEditRec}
        onSuccess={fetchRecommendations}
        recommendationId={selectedRecId}
        sections={instructorSections.map((s) => ({
          sectionId: s.sectionId,
          sectionNumber: s.sectionNumber,
          courseTitle: s.courseTitle,
        }))}
      />

      {/* Header Section */}
      <div className="relative overflow-hidden p-8 md:p-12 rounded-[48px] bg-slate-900 border border-slate-800">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/20 to-transparent opacity-50" />
        <div className="absolute -bottom-24 -left-24 size-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-primary tracking-widest font-black uppercase text-xs"
              >
                <Activity className="size-4" />
                <span>لوحة التحكم الأكاديمية</span>
              </motion.div>

              {role === "instructor" && (
                <Button
                  variant="ghost"
                  onClick={() => setShowEditNotes(true)}
                  className="rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white font-bold gap-2 py-1 h-auto"
                >
                  <StickyNote className="size-4 text-emerald-500" />
                  تحديث ملاحظات الدورة
                </Button>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black text-white leading-tight"
            >
              مرحباً <span className="text-primary">{user}</span>
              <br />
              <span className="text-slate-400 text-2xl md:text-3xl font-bold mt-2 block">
                {section.courseTitle}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80">
                <LayoutDashboard className="size-4 text-primary" />
                <span className="font-bold text-sm">
                  الشعبة {section.sectionNumber}
                </span>
              </div>
              {section.startDate && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80">
                  <Calendar className="size-4 text-emerald-500" />
                  <span className="font-bold text-sm">
                    تاريخ البدء:{" "}
                    {new Date(section.startDate).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl"
          >
            <div className="text-center">
              <span className="block text-3xl font-black text-white">
                {students.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                طالب مسجل
              </span>
            </div>
            <div className="w-px h-12 bg-slate-800" />
            <div className="text-center">
              <Badge
                variant="outline"
                className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black"
              >
                {section.sectionStatus === "open" ? "مفتوحة" : "قائمة"}
              </Badge>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                حالة الشعبة
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex flex-wrap gap-3 p-2 bg-slate-100 dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-zinc-800">
        {tabItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`
                relative px-8 py-4 rounded-3xl flex items-center gap-3 transition-all duration-300
                ${
                  isActive
                    ? "bg-white dark:bg-zinc-800 shadow-xl shadow-black/5"
                    : "hover:bg-white/50 dark:hover:bg-white/5"
                }
              `}
            >
              <item.icon
                className={`size-5 ${isActive ? item.color : "text-slate-400"}`}
              />
              <span
                className={`font-black text-sm ${
                  isActive ? "text-slate-800 dark:text-white" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[500px]"
      >
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Course Notes Section (Internal Preview) */}
            {section.notes && (
              <div className="p-8 rounded-[40px] bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <AlertCircle className="size-24 text-blue-600" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                    <StickyNote className="size-6" />
                    <h3 className="text-xl font-black tracking-tight">
                      ملاحظات الدورة (معاينة الطلاب)
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {section.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <BookOpen className="size-6 text-primary" />
                المحتوى التعليمي
              </h2>
            </div>

            {["open", "in_progress", "closed"].includes(
              section.sectionStatus || "",
            ) ? (
              <div className="relative group">
                <SectionContent
                  modules={allModules}
                  sectionId={section.id}
                  userId={userId}
                  courseId={courseId}
                  chapters={chapters}
                  contents={contents}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 rounded-[40px] bg-amber-50 dark:bg-amber-950/10 border-2 border-dashed border-amber-200 dark:border-amber-900/30 text-center gap-6">
                <div className="size-20 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
                  <AlertCircle className="size-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-amber-800 dark:text-amber-200">
                    المحتوى غير متاح حالياً
                  </h3>
                  <p className="text-amber-600/70 font-medium">
                    هذا المحتوى متاح فقط للشعب المفتوحة أو التي قيد التنفيذ.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Users className="size-6 text-emerald-500" />
                قائمة الطلاب المسجلين
              </h2>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
                    <TableHead className="px-8 py-5 font-black text-slate-500">
                      الطالب
                    </TableHead>
                    <TableHead className="px-8 py-5 font-black text-slate-500">
                      بيانات التواصل
                    </TableHead>
                    <TableHead className="px-8 py-5 font-black text-slate-500 text-center">
                      حالة التسجيل
                    </TableHead>
                    <TableHead className="px-8 py-5 font-black text-slate-500 text-center">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((st, index) => (
                      <motion.tr
                        key={st.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors border-b border-slate-50 dark:border-zinc-900"
                      >
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black">
                              {st.studentName.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white">
                              {st.studentName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <Mail className="size-3 text-primary" />
                              {st.studentEmail}
                            </div>
                            {st.studentPhone && (
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Phone className="size-3 text-emerald-500" />
                                {st.studentPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <Badge
                            className={`
                                rounded-full px-4 py-1 font-black border-2
                                ${
                                  st.confirmationStatus === "confirmed"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                }
                              `}
                          >
                            {st.confirmationStatus === "confirmed"
                              ? "مؤكد"
                              : "قيد المراجعة"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                          >
                            <MoreVertical className="size-5 text-slate-400" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="size-10 text-slate-200" />
                          <p className="font-bold text-slate-400 text-lg">
                            لا يوجد طلاب مسجلين حالياً
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <Star className="size-8 text-amber-500 fill-amber-500" />
                  توصيات وخدمات المدرب
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                  أهم المنتجات والأدوات والخدمات التي ينصح بها المدرب لتطوير
                  مستواك.
                </p>
              </div>

              {role === "instructor" && (
                <Button
                  onClick={() => setShowAddRec(true)}
                  className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black gap-2 h-12 px-6 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Star className="size-5 fill-white" />
                  إضافة توصية جديدة
                </Button>
              )}
            </div>

            {loadingRecs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-3xl bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative flex flex-col bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all h-full"
                  >
                    {role === "instructor" && (
                      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecId(rec.id);
                            setShowEditRec(true);
                          }}
                          className="size-10 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-xl"
                        >
                          <Edit2 className="size-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRec(rec.id)}
                          className="size-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-xl"
                        >
                          <Trash className="size-5" />
                        </button>
                      </div>
                    )}

                    <div className="relative h-48 overflow-hidden">
                      {rec.imageUrl ? (
                        <img
                          src={rec.imageUrl}
                          alt={rec.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-300">
                          <ImageIcon className="size-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-8 flex flex-col flex-1 space-y-4">
                      <div className="space-y-1">
                        <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px] font-black tracking-widest uppercase px-3">
                          توصية رائدة
                        </Badge>
                        <h4 className="text-xl font-black text-slate-800 dark:text-white">
                          {rec.title}
                        </h4>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm line-clamp-3 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="pt-4 mt-auto">
                        <a
                          href={rec.linkUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-100 text-white font-black flex items-center justify-center gap-2 group/btn transition-all shadow-lg active:scale-95"
                        >
                          <LinkIcon className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                          عرض الرابط / الخدمة
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-950 rounded-[40px] border border-dashed border-slate-200 dark:border-zinc-800 text-center gap-6">
                <div className="size-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <Star className="size-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black">لا يوجد توصيات حالياً</h3>
                  <p className="text-slate-500">
                    سوف تظهر هنا أهم المنتجات والخدمات التي ينصح بها المدرب.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "forum" && (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 shadow-xl text-center gap-8">
            <div className="size-24 rounded-[32px] bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 shadow-2xl shadow-purple-500/10">
              <MessageSquare className="size-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                المنتدى الطلابي التفاعلي
              </h2>
              <p className="text-slate-500 font-medium max-w-sm">
                هذا القسم مخصص للمناقشات الأكاديمية وتبادل الخبرات بين الطلاب
                والمدربين.
              </p>
            </div>
            <Button
              onClick={() => {
                const targetRole =
                  role === "user" ? "dashboardUser" : "instructor";
                router.push(
                  `/${targetRole}/${userId}/courses/${section.id}/chat`,
                );
              }}
              className="h-14 px-10 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-lg shadow-xl shadow-purple-600/20 active:scale-95 transition-all"
            >
              دخول المنتدى الآن
            </Button>
          </div>
        )}

        {activeTab === "aiPrompts" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <Sparkles className="size-8 text-emerald-500" />
                  برومبات ذكية جاهزة (معاينة)
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                  هذا ما يراه الطلاب في تبويب البرومبتات الجاهزة. يمكنك إدارتها
                  من تبويب "المحتوى التعليمي".
                </p>
              </div>
            </div>

            {loadingPrompts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-3xl bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : aiPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {aiPrompts.map((p, index) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative flex flex-col bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all h-full"
                  >
                    <div
                      onClick={() => {
                        const targetRole =
                          role === "user" ? "dashboardUser" : "instructor";
                        router.push(
                          `/${targetRole}/${userId}/courses/${section.id}/ai-prompts/${p.id}`,
                        );
                      }}
                      className="relative h-48 overflow-hidden cursor-pointer"
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-300">
                          <ImageIcon className="size-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-8 flex flex-col flex-1 space-y-4">
                      <div className="space-y-1">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black tracking-widest uppercase px-3">
                          برومبت احترافي
                        </Badge>
                        <h4
                          onClick={() =>
                            router.push(
                              `/${role === "user" ? "dashboardUser" : role || "instructor"}/${userId}/courses/${section.id}/ai-prompts/${p.id}`,
                            )
                          }
                          className="text-xl font-black text-slate-800 dark:text-white cursor-pointer hover:text-emerald-500 transition-colors"
                        >
                          {p.title}
                        </h4>
                      </div>

                      <div className="relative flex-1">
                        <div
                          className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-sm font-mono text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-wrap text-right"
                          dir="rtl"
                        >
                          {p.prompt}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-slate-50 dark:from-zinc-900 to-transparent" />
                      </div>

                      <div className="pt-4 mt-auto flex flex-col gap-2">
                        <Button
                          onClick={() =>
                            router.push(
                              `/${role === "user" ? "dashboardUser" : role || "instructor"}/${userId}/courses/${section.id}/ai-prompts/${p.id}`,
                            )
                          }
                          className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center gap-2 group/btn transition-all shadow-lg shadow-emerald-500/10 active:scale-95 text-sm"
                        >
                          فتح صفحة البرومبت
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleCopy(p.prompt, p.id)}
                          className="w-full h-11 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 transition-all text-xs"
                        >
                          {copiedId === p.id ? (
                            <>
                              <Check className="size-4 text-emerald-400" />
                              تم النسخ
                            </>
                          ) : (
                            <>
                              <Copy className="size-4 group-hover/btn:scale-110 transition-transform" />
                              نسخ سريع
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-950 rounded-[40px] border border-dashed border-slate-200 dark:border-zinc-800 text-center gap-6">
                <div className="size-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Sparkles className="size-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black">لا توجد برومبات حالياً</h3>
                  <p className="text-slate-500">
                    يمكنك إضافة برومبتات من تبويب "المحتوى التعليمي".
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Clasification;
