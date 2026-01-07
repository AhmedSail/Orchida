"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  TrendingUp,
  Newspaper,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  CalendarDays,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Define the stats interface
export interface CoordinatorStats {
  activeCourses: number;
  openSections: number; // Represents Active Sections (in_progress, closed)
  totalEnrollments: number;
  todayEnrollments: number;
}

// Define enrollment interface
export interface EnrollmentSummary {
  id: string;
  studentName: string;
  courseTitle: string | null;
  sectionNumber: number | null;
  registeredAt: Date;
}

interface Props {
  stats?: CoordinatorStats;
  latestEnrollments?: EnrollmentSummary[];
  loading?: boolean;
  userId?: string;
}

const HomeCordinatorPage = ({
  stats,
  latestEnrollments,
  loading,
  userId,
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  const recentEnrollments = latestEnrollments || [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto p-4 sm:p-8 space-y-10 bg-[#fafafa]/50 min-h-screen"
    >
      {/* Premium Header */}
      <header className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/90 to-primary p-10 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 opacity-90">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <LayoutDashboard className="size-6" />
            </div>
            <span className="text-sm font-semibold tracking-wider uppercase">
              نظام المنسقين
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            لوحة تحكم المنسق
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl text-lg leading-relaxed font-medium">
            مرحباً بك. يمكنك هنا متابعة الدورات والطلاب، وإدارة الجداول الدراسية
            بكفاءة عالية.
          </p>
        </div>
        {/* Abstract Shapes Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 size-64 rounded-full bg-black/10 blur-2xl" />
      </header>

      {/* Stats Grid - Updated for Coordinator */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="الكورسات النشطة"
          value={stats?.activeCourses || 0}
          label="دورة تدريبية"
          icon={BookOpen}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatsCard
          title="الشعب النشطة"
          value={stats?.openSections || 0}
          label="شعبة جارية"
          icon={CalendarDays}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatsCard
          title="تسجيلات اليوم"
          value={stats?.todayEnrollments || 0}
          label="طالب جديد"
          icon={UserPlus}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatsCard
          title="إجمالي الطلاب"
          value={stats?.totalEnrollments || 0}
          label="طالب مسجل"
          icon={GraduationCap}
          color="text-slate-600"
          bg="bg-slate-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Latest Enrollments Section - Full Width */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
          <CardHeader className="bg-white px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Users className="size-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    آخر المسجلين
                  </CardTitle>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-purple-600"
                asChild
              >
                <Link href={`/coordinator/${userId}/courses`}>
                  إدارة الكورسات <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 grow">
            {recentEnrollments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentEnrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      {enr.studentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">
                        {enr.studentName}
                      </h4>
                      <p className="text-sm text-slate-500 truncate">
                        {enr.courseTitle} - شعبة {enr.sectionNumber}
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(enr.registeredAt).toLocaleDateString("ar-EG")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Users} text="لا يوجد طلاب مسجلين مؤخراً" />
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

// Sub-components
function StatsCard({
  title,
  value,
  label,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  label: string;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start z-10 relative">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                {value}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {label}
              </span>
            </div>
          </div>
          <div
            className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
          >
            <Icon className="size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="p-4 bg-slate-50 rounded-full mb-3">
        <Icon className="size-8 opacity-50" />
      </div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

export default HomeCordinatorPage;
