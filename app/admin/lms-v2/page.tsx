"use client";

import React, { useState, useEffect } from "react";
import {
  getAllCoursesWithV2StatusAction,
  getAllInstructorsAction,
  toggleCourseV2Action,
  assignInstructorToCourseAction,
  getAdminV2StatsAction,
} from "@/app/actions/lms-v2";
import {
  ShieldCheck,
  UserPlus,
  Settings2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  Edit3,
  Users,
  Zap,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLmsV2Page() {
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [coursesRes, instructorsRes, statsRes] = await Promise.all([
        getAllCoursesWithV2StatusAction(),
        getAllInstructorsAction(),
        getAdminV2StatsAction(),
      ]);

      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);

      if (instructorsRes.success && instructorsRes.data)
        setInstructors(instructorsRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleToggleV2 = async (courseId: string, currentStatus: boolean) => {
    const res = await toggleCourseV2Action(courseId, !currentStatus);
    if (res.success) {
      setCourses(
        courses.map((c) =>
          c.id === courseId ? { ...c, isV2: !currentStatus } : c,
        ),
      );
      toast.success("تم تحديث حالة النظام بنجاح");
    }
  };

  const [selectedInstructor, setSelectedInstructor] = useState("");

  const handleAssign = async (courseId: string) => {
    if (!selectedInstructor) {
      toast.error("يرجى اختيار مدرس أولاً");
      return;
    }
    const res = await assignInstructorToCourseAction(
      selectedInstructor,
      courseId,
    );
    if (res.success) {
      toast.success("تم إسناد الدورة للمدرس بنجاح");
    }
  };

  if (loading)
    return <div className="p-20 text-center font-bold">جاري التحميل...</div>;

  return (
    <div className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              إدارة النظام المطور (V2)
            </h1>
            <p className="text-zinc-500 font-medium mt-2">
              تفعيل النظام الجديد وإسناد المدرسين للدورات
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-white px-5 py-2.5 rounded-2xl border border-zinc-200 font-bold text-sm flex items-center gap-2 hover:bg-zinc-50 transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة للوحة الإدارة
          </Link>
        </div>

        {/* Global Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-primary/5 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                  إجمالي الطلاب (V2)
                </p>
                <h3 className="text-3xl font-black text-zinc-900 mt-1">
                  {stats.totalStudents}
                </h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-emerald/5 transition-all">
              <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                  إجمالي الدروس
                </p>
                <h3 className="text-3xl font-black text-zinc-900 mt-1">
                  {stats.totalLessons}
                </h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-amber/5 transition-all">
              <div className="w-16 h-16 bg-amber-50 rounded-[24px] flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                  دورات V2 النشطة
                </p>
                <h3 className="text-3xl font-black text-zinc-900 mt-1">
                  {stats.totalCourses}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Courses Table */}
        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-zinc-900 text-white">
              <tr>
                <th className="px-8 py-5 text-sm font-black uppercase tracking-widest">
                  الدورة
                </th>
                <th className="px-8 py-5 text-sm font-black uppercase tracking-widest text-center">
                  النظام المطور
                </th>
                <th className="px-8 py-5 text-sm font-black uppercase tracking-widest">
                  بناء المنهج
                </th>
                <th className="px-8 py-5 text-sm font-black uppercase tracking-widest">
                  إسناد مدرس
                </th>
                <th className="px-8 py-5 text-sm font-black uppercase tracking-widest text-center">
                  الإجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <p className="font-black text-zinc-900">{course.title}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                      ID: {course.id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => handleToggleV2(course.id, course.isV2)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        course.isV2
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                      }`}
                    >
                      {course.isV2 ? "مفعل V2" : "تفعيل V2"}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <Link
                      href={`/instructor/v2/course/${course.id}`}
                      className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      تعديل المنهج
                    </Link>
                  </td>
                  <td className="px-8 py-6">
                    <select
                      onChange={(e) => setSelectedInstructor(e.target.value)}
                      className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                    >
                      <option value="">اختر المدرس...</option>
                      {instructors.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => handleAssign(course.id)}
                      className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all group"
                      title="إسناد المدرس"
                    >
                      <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Hint */}
        <div className="mt-8 bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
          <div>
            <h4 className="font-black text-amber-800 mb-1">
              ملاحظة هامة للأدمن
            </h4>
            <p className="text-sm text-amber-700/80 font-medium leading-relaxed">
              تفعيل النظام المطور (V2) سيقوم بتحويل واجهة الطالب لهذه الدورة إلى
              النظام الجديد. تأكد من أن المدرس قد قام برفع المحتوى المحدث قبل
              التفعيل الكامل للطلاب.
            </p>
          </div>
        </div>
      </div>
  );
}
