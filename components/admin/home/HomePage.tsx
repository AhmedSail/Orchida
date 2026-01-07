"use client";
import DashboardCharts from "@/components/DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  BookOpen,
  AlertCircle,
  LayoutDashboard,
  TrendingUp,
  History,
  Mail,
  Users2,
  Lock,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Enrollment {
  enrollmentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  registeredAt: Date;
  sectionId: string;
  sectionStatus: string;
  courseId: string;
  courseTitle: string;
}

interface Props {
  stats?: {
    activeUsers: number;
    todayRequests: number;
    activeServices: number;
    endedServices: number;
    allServices: number;
    activeCourses: number;
    pendingCourses: number;
    inProgressCourses: number;
    completedCourses: number;
    ClosedCourses: number;
    totalOpenEnrollment: number;
  };
  studentsCountByCourse?: Record<string, number>;
  loading?: boolean;
  userId?: string;
  latestEnrollments?: Enrollment[];
  enrollmentsByDay?: { day: string; count: number }[];
  openSections?: {
    sectionId: string;
    courseTitle: string;
    sectionNumber: number;
    enrollmentCount: number;
    maxCapacity: number;
  }[];
}

const HomePage = ({
  stats,
  studentsCountByCourse,
  loading,
  userId,
  latestEnrollments,
  enrollmentsByDay,
  openSections,
}: Props) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const statGroups = [
    {
      title: "المستخدمين والطلبات",
      items: [
        {
          label: "المستخدمون النشطون",
          value: stats?.activeUsers,
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "الطلبات اليوم",
          value: stats?.todayRequests,
          icon: Mail,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
      ],
    },
    {
      title: "الخدمات الرقمية",
      items: [
        {
          label: "الخدمات النشطة",
          value: stats?.activeServices,
          icon: Clock,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          label: "الخدمات المنتهية",
          value: stats?.endedServices,
          icon: CheckCircle2,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "مجموع الخدمات",
          value: stats?.allServices,
          icon: Briefcase,
          color: "text-slate-600",
          bg: "bg-slate-50",
        },
      ],
    },
    {
      title: "الأكاديمية والكورسات",
      items: [
        {
          label: "الكورسات النشطة",
          value: stats?.activeCourses,
          icon: BookOpen,
          color: "text-primary",
          bg: "bg-primary/5",
        },
        {
          label: "بانتظار الموافقة",
          value: stats?.pendingCourses,
          icon: AlertCircle,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          label: "قيد التنفيذ",
          value: stats?.inProgressCourses,
          icon: TrendingUp,
          color: "text-cyan-600",
          bg: "bg-cyan-50",
        },
        {
          label: "مغلقة / مكتملة",
          value: (stats?.ClosedCourses || 0) + (stats?.completedCourses || 0),
          icon: Lock,
          color: "text-slate-500",
          bg: "bg-slate-50",
        },
        {
          label: "إجمالي المسجلين حالياً",
          value: stats?.totalOpenEnrollment,
          icon: Users2,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto p-4 sm:p-8 space-y-10 bg-[#fafafa]/50 min-h-screen"
    >
      {/* Premium Header */}
      <header className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/90 to-primary p-8 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 opacity-80">
            <LayoutDashboard className="size-5" />
            <span className="text-sm font-medium tracking-wider uppercase">
              نظام إدارة اوركيدة
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl leading-relaxed">
            مرحباً بك مجدداً. إليك نظرة شاملة على أداء المركز، الطلاب، والخدمات
            الرقمية اليوم.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 size-40 rounded-full bg-black/10 blur-2xl" />
      </header>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Open Sections Table */}
        {openSections && openSections.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm h-full flex flex-col overflow-hidden">
              <CardHeader className="border-b bg-white/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                      الشعب المفتوحة
                    </CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-none"
                  >
                    {openSections.length} شعبة
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 grow overflow-auto lg:max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="px-6 py-4 text-right">
                        الكورس
                      </TableHead>
                      <TableHead className="text-center">الشعبة</TableHead>
                      <TableHead className="text-center">المسجلين</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openSections.map((sec) => (
                      <TableRow
                        key={sec.sectionId}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <TableCell className="px-6 py-4 font-bold text-slate-700">
                          {sec.courseTitle}
                        </TableCell>
                        <TableCell className="text-center text-slate-500">
                          {sec.sectionNumber}#
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-black text-primary text-base leading-none">
                              {sec.enrollmentCount}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                              من أصل {sec.maxCapacity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {sec.enrollmentCount >= sec.maxCapacity ? (
                            <Badge variant="destructive" className="font-bold">
                              مكتملة
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-50"
                            >
                              نشطة
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Latest Enrollments */}
        {latestEnrollments && latestEnrollments.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm h-full flex flex-col overflow-hidden">
              <CardHeader className="border-b bg-white/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <History className="size-5 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                      آخر المسجلين
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-200 text-amber-700"
                  >
                    تحديث مباشر
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 grow overflow-auto lg:max-h-[500px]">
                <div className="divide-y divide-slate-100">
                  {latestEnrollments.map((enr) => (
                    <div
                      key={enr.enrollmentId}
                      className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          {enr.studentName.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 leading-tight">
                            {enr.studentName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="size-3" />
                            <span>{enr.studentEmail}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0 h-5 bg-slate-100 text-slate-600 border-none truncate max-w-[120px]"
                        >
                          {enr.courseTitle}
                        </Badge>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(enr.registeredAt).toLocaleDateString(
                            "ar-EG",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      {/* Modern Stats Sections */}
      <div className="space-y-8">
        {statGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h3 className="text-lg font-bold text-slate-800">
                {group.title}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.items.map((item, iIdx) => (
                <motion.div key={iIdx} variants={itemVariants}>
                  <Card className="group border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">
                            {item.label}
                          </p>
                          <p className="text-3xl font-black text-slate-900 tracking-tight">
                            {item.value ?? 0}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <item.icon className="size-6" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                        <TrendingUp className="size-3 text-emerald-500" />
                        <span>تحديث فوري للسجلات</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b px-8 py-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-6 text-primary" />
              <CardTitle className="text-2xl font-black">
                تحليلات الأداء والبيانات
              </CardTitle>
            </div>
            <p className="text-slate-400 text-sm">
              تمثيل بياني لتوزيع الطلاب والخدمات على مدار الوقت
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <DashboardCharts
              stats={stats}
              studentsCountByCourse={studentsCountByCourse}
              enrollmentsByDay={enrollmentsByDay}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
