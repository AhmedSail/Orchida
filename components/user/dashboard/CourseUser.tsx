import React from "react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertCircle, Sparkles, GraduationCap, Clock, ChevronLeft, Layout } from "lucide-react";

interface CourseUserProps {
  enrollments: {
    enrollmentId: string;
    sectionId: string;
    sectionNumber: number | null;
    courseTitle: string | null;
  }[];
  applications?: {
    id: string;
    courseId: string;
    course: {
      title: string;
      imageUrl: string | null;
    };
    status: string;
  }[];
  userId: string | null;
}

const CourseUser = ({ enrollments, applications = [], userId }: CourseUserProps) => {
  return (
    <div className="p-6 md:p-12 min-h-screen bg-zinc-50/50" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-zinc-900 rounded-[40px] p-10 md:p-16 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary/20 text-primary text-[10px] font-black px-4 py-1.5 rounded-full border border-primary/30 uppercase tracking-widest">
                  لوحة الطالب
                </span>
                <span className="bg-white/10 text-white/60 text-[10px] font-black px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                  LMS v2.0
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                أهلاً بك في رحلتك <br /> <span className="text-primary">التعليمية المتميزة</span>
              </h1>
              <p className="text-white/60 font-medium max-w-lg leading-relaxed text-lg">
                هنا تجد جميع مساراتك التعليمية، يمكنك متابعة دروسك أو استكشاف اللقاءات المتاحة لك بكل سهولة.
              </p>
            </div>
            
            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-8 rounded-[32px] border border-white/10 shadow-inner">
               <div className="text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter mb-2">الدورات المسجلة</p>
                  <p className="text-3xl font-black">{enrollments.length}</p>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div className="text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter mb-2">طلبات معلقة</p>
                  <p className="text-3xl font-black">{applications.length}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Applications / Pending Section */}
        {applications.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                   <Clock className="w-5 h-5" />
                </div>
                طلبات التحاق بانتظار التشعيب
              </h2>
              <div className="hidden md:flex h-px flex-1 mx-8 bg-zinc-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="group relative bg-white border border-zinc-100 rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500/10 group-hover:bg-amber-500 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-500">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 uppercase tracking-tighter">
                        قيد المراجعة
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-zinc-900 mb-3 group-hover:text-amber-600 transition-colors leading-tight">
                      {app.course.title}
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed">
                      سيتم تخصيص شعبة لك قريباً. يمكنك الآن البدء بمعاينة المادة التعليمية الأولى مجاناً.
                    </p>
                  </div>

                  <Link href={`/academy/course/${app.courseId}`} className="relative z-10 w-full">
                    <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 border-zinc-100 text-zinc-600 font-black hover:bg-amber-500 hover:border-amber-500 hover:text-white shadow-sm transition-all duration-300">
                      <BookOpen className="w-5 h-5" />
                      بدء المعاينة المجانية
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Enrollments Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                 <GraduationCap className="w-5 h-5" />
              </div>
              الكورسات المسجل بها رسمياً
            </h2>
            <div className="hidden md:flex h-px flex-1 mx-8 bg-zinc-100" />
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrollments.map((course) => (
                <div
                  key={course.enrollmentId}
                  className="group relative bg-white border border-zinc-100 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col justify-between h-full overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-full h-1.5 bg-zinc-50 group-hover:bg-primary transition-colors duration-500" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 bg-zinc-900 text-white rounded-[24px] flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:rotate-6 transition-all duration-500">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">الشعبة</span>
                        <span className="text-lg font-black text-zinc-900">{course.sectionNumber}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-black text-zinc-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                      {course.courseTitle}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-10">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">المحتوى متاح الآن</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboardUser/${userId}/courses/${course.sectionId}/content`}
                    className="relative z-10 w-full"
                  >
                    <Button className="w-full h-14 rounded-2xl gap-3 bg-zinc-900 text-white font-black shadow-xl hover:bg-primary hover:scale-[1.02] active:scale-95 transition-all duration-300">
                      فتح المحتوى التعليمي
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-zinc-100 border-dashed text-center shadow-sm">
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-8">
                <Layout className="w-10 h-10 text-zinc-300" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-3">
                لا توجد كورسات نشطة حالياً
              </h3>
              <p className="text-zinc-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                لم تقم بالتسجيل في أي كورس دراسي حتى الآن. ابدأ رحلتك التعليمية اليوم واستكشف مساراتنا المتميزة.
              </p>
              <Link href="/courses" className="mt-10">
                 <Button className="px-10 h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                    تصفح الدورات المتاحة
                 </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseUser;
