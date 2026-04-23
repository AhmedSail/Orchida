import React from "react";
import Link from "next/link";
import { getInstructorCoursesAction } from "@/app/actions/lms-v2";
import { BookOpen, ArrowLeft, ChevronLeft, GraduationCap, Layout, Users, Zap } from "lucide-react";

export default async function InstructorV2Dashboard() {
  const { data: courses, success, error } = await getInstructorCoursesAction();

  if (!success || !courses) {
    return (
      <div className="p-10 text-center bg-red-50 text-red-500 rounded-3xl border border-red-100">
        <h2 className="text-xl font-bold mb-2">خطأ في جلب البيانات</h2>
        <p>{error || "تأكد من صلاحياتك كمدرب في النظام الجديد"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 mb-2 flex items-center gap-3">
              <Layout className="w-8 h-8 text-primary" />
              لوحة تحكم المنهج الدراسي (V2)
            </h1>
            <p className="text-zinc-500 font-medium">إدارة محتوى الدورات المسندة إليك بالنظام المطور</p>
          </div>
          
          <Link
            href="/instructor"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors font-bold text-sm bg-white px-5 py-2.5 rounded-2xl border border-zinc-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            النظام القديم
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: "إجمالي الطلاب", value: courses.reduce((acc, c: any) => acc + (c.studentCount || 0), 0), icon: <Users className="w-6 h-6" />, color: "bg-blue-500" },
            { label: "الدورات النشطة", value: courses.length, icon: <BookOpen className="w-6 h-6" />, color: "bg-emerald-500" },
            { label: "إجمالي الدروس", value: courses.reduce((acc, c: any) => acc + (c.lessonsCount || 0), 0), icon: <Zap className="w-6 h-6" />, color: "bg-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400">
              <BookOpen className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-bold">لا توجد دورات مسندة إليك حالياً في النظام الجديد</p>
            </div>
          ) : (
            courses.map((course: any) => (
              <Link
                key={course.id}
                href={`/instructor/v2/course/${course.id}`}
                className="group bg-white rounded-[40px] p-8 border border-zinc-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
              >
                {/* Decorative background circle */}
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:bg-primary transition-colors">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-4 py-2 rounded-xl">
                       {course.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-zinc-900 mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  
                  <p className="text-zinc-500 text-sm font-medium line-clamp-2 mb-8 flex-1 leading-relaxed">
                    {course.description || "لا يوجد وصف لهذه الدورة حالياً. ابدأ بإضافة المنهج الدراسي."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <div className="flex items-center gap-2 text-zinc-400 mb-1">
                        <Users className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">الطلاب</span>
                      </div>
                      <p className="text-lg font-black text-zinc-900">{course.studentCount || 0}</p>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <div className="flex items-center gap-2 text-zinc-400 mb-1">
                        <BookOpen className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">الدروس</span>
                      </div>
                      <p className="text-lg font-black text-zinc-900">{course.lessonsCount || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-zinc-50 mt-auto">
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center text-[8px] font-bold text-zinc-500">U</div>
                       ))}
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[8px] font-bold">+{course.studentCount > 3 ? course.studentCount - 3 : 0}</div>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-black text-sm">
                      إدارة الكورس
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
