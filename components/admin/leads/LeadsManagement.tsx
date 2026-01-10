"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  UserPlus,
  Trash2,
  ExternalLink,
  Loader2,
  GraduationCap,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MySwal = withReactContent(Swal);

type Lead = {
  id: string;
  courseId: string;
  sectionId: string | null;
  studentId: string | null;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  studentAge: number | null;
  studentMajor: string | null;
  studentCountry: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  course: {
    title: string;
  };
  section: {
    sectionNumber: number;
  } | null;
};

const LeadsManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourseId, setFilterCourseId] = useState("all");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/course-leads");
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/course-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads(
          leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        MySwal.fire({
          icon: "success",
          title: "تم التحديث",
          text: "تم تغيير حالة الطلب بنجاح",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const convertToEnrollment = async (lead: Lead) => {
    const result = await MySwal.fire({
      title: "تأكيد التحويل",
      text: `هل أنت متأكد من تحويل الطالب ${lead.studentName} إلى التسجيل النهائي؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، قم بالتحويل",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#10b981",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/course-leads/${lead.id}`, {
          method: "POST",
        });
        if (res.ok) {
          fetchLeads();
          MySwal.fire({
            icon: "success",
            title: "تم التحويل بنجاح! 🎉",
            text: "تمت إضافة الطالب إلى جدول التسجيلات وتحديث حالته.",
          });
        } else {
          const err = await res.json();
          throw new Error(err.message);
        }
      } catch (error: any) {
        MySwal.fire({
          icon: "error",
          title: "فشل التحويل",
          text: error.message || "حدث خطأ ما أثناء التحويل",
        });
      }
    }
  };

  const deleteLead = async (id: string) => {
    const result = await MySwal.fire({
      title: "حذف الطلب؟",
      text: "هذا الإجراء لا يمكن التراجع عنه",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "حذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/course-leads/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setLeads(leads.filter((l) => l.id !== id));
          MySwal.fire("تم الحذف", "تم حذف الطلب بنجاح", "success");
        }
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.studentPhone.includes(searchTerm) ||
      lead.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || lead.status === filterStatus;
    const matchesCourse =
      filterCourseId === "all" || lead.courseId === filterCourseId;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const uniqueCourses = Array.from(
    new Map(leads.map((l) => [l.courseId, l.course.title])).entries()
  ).map(([id, title]) => ({ id, title }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 ml-1" /> جديد
          </Badge>
        );
      case "contacted":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1 rounded-full">
            <Phone className="w-3 h-3 ml-1" /> تم التواصل
          </Badge>
        );
      case "interested":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 ml-1" /> مهتم
          </Badge>
        );
      case "registered":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 rounded-full">
            <UserPlus className="w-3 h-3 ml-1" /> مسجل
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            إدارة المهتمين (Leads)
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            تابع طلبات التسجيل السريع وقم بتحويلها إلى تسجيلات نهائية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchLeads}
            disabled={loading}
            className="rounded-2xl h-11"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "تحديث البيانات"
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative w-full md:flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            placeholder="بحث بالاسم، الهاتف، أو الدورة..."
            className="pr-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-zinc-400 mr-2" />
            <select
              className="h-12 px-4 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 outline-none text-sm w-full md:w-44"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="new">جديد</option>
              <option value="contacted">تم التواصل</option>
              <option value="interested">مهتم</option>
              <option value="registered">مسجل</option>
            </select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <GraduationCap className="w-5 h-5 text-zinc-400 mr-2 md:mr-0" />
            <select
              className="h-12 px-4 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 outline-none text-sm w-full md:w-56"
              value={filterCourseId}
              onChange={(e) => setFilterCourseId(e.target.value)}
            >
              <option value="all">كل الدورات</option>
              {uniqueCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "إجمالي الطلبات",
            value: leads.length,
            color: "bg-zinc-100",
            textColor: "text-zinc-900",
          },
          {
            label: "طلبات جديدة",
            value: leads.filter((l) => l.status === "new").length,
            color: "bg-blue-50",
            textColor: "text-blue-600",
          },
          {
            label: "بانتظار التحويل",
            value: leads.filter((l) => l.status === "interested").length,
            color: "bg-yellow-50",
            textColor: "text-yellow-600",
          },
          {
            label: "تم تحويلهم",
            value: leads.filter((l) => l.status === "registered").length,
            color: "bg-green-50",
            textColor: "text-green-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.color} p-4 rounded-4xl border border-white dark:border-zinc-800 shadow-sm`}
          >
            <p className="text-xs font-bold text-zinc-500">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.textColor}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-5xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-5 font-bold text-zinc-600 dark:text-zinc-400">
                  الطالب
                </th>
                <th className="px-6 py-5 font-bold text-zinc-600 dark:text-zinc-400">
                  الدورة / الشعبة
                </th>
                <th className="px-6 py-5 font-bold text-zinc-600 dark:text-zinc-400">
                  التواصل
                </th>
                <th className="px-6 py-5 font-bold text-zinc-600 dark:text-zinc-400">
                  الحالة
                </th>
                <th className="px-6 py-5 font-bold text-zinc-600 dark:text-zinc-400">
                  التاريخ
                </th>
                <th className="px-6 py-5 font-bold text-zinc-600 dark:text-zinc-400 text-center">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              <AnimatePresence>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {lead.studentName}
                          </span>
                          <span className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />{" "}
                            {lead.studentMajor || "غير محدد"}
                            <span className="mx-1">•</span>
                            <MapPin className="w-3 h-3" />{" "}
                            {lead.studentCountry || "--"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {lead.course?.title}
                          </span>
                          <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full w-fit mt-1">
                            الشعبة {lead.section?.sectionNumber || "--"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <a
                            href={`tel:${lead.studentPhone}`}
                            className="text-sm font-medium hover:text-primary flex items-center gap-2"
                          >
                            <Phone className="w-3 h-3" /> {lead.studentPhone}
                          </a>
                          <a
                            href={`mailto:${lead.studentEmail}`}
                            className="text-xs text-zinc-500 hover:text-primary flex items-center gap-2"
                          >
                            <Mail className="w-3 h-3" /> {lead.studentEmail}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-5 text-sm text-zinc-500">
                        {format(new Date(lead.createdAt), "dd MMM yyyy", {
                          locale: ar,
                        })}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {lead.status !== "registered" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2 font-bold px-4"
                              onClick={() => convertToEnrollment(lead)}
                            >
                              <UserPlus className="w-4 h-4" />
                              تحويل
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-2xl p-2"
                            >
                              <DropdownMenuItem
                                className="rounded-xl gap-2 cursor-pointer"
                                onClick={() =>
                                  updateStatus(lead.id, "contacted")
                                }
                              >
                                <Phone className="w-4 h-4" /> تم التواصل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="rounded-xl gap-2 cursor-pointer"
                                onClick={() =>
                                  updateStatus(lead.id, "interested")
                                }
                              >
                                <CheckCircle2 className="w-4 h-4" /> مهتم
                                بالاشتراك
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="rounded-xl gap-2 text-blue-600 focus:text-blue-600 cursor-pointer"
                                onClick={() => {
                                  MySwal.fire({
                                    title: "ملاحظات الطالب",
                                    text: lead.notes || "لا يوجد ملاحظات",
                                    icon: "info",
                                    confirmButtonText: "إغلاق",
                                  });
                                }}
                              >
                                <MessageSquare className="w-4 h-4" /> عرض
                                الملاحظات
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="rounded-xl gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => deleteLead(lead.id)}
                              >
                                <Trash2 className="w-4 h-4" /> حذف الطلب
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center ">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-12 h-12 text-zinc-200" />
                        <p className="text-zinc-500 font-medium">
                          لا توجد طلبات مطابقة للبحث
                        </p>
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("all");
                            setFilterCourseId("all");
                          }}
                        >
                          إعادة تعيين الفلاتر
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsManagement;
