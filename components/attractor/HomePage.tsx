"use client";
import React from "react";
import { ServiceRequests } from "@/src/modules/home/ui/view/home-view";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Zap,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HomePageProps {
  todayRequests: ServiceRequests[];
  activeServices: ServiceRequests[];
  endedServices: ServiceRequests[];
  allServices: ServiceRequests[];
  userId: string;
}

export default function AttractorHomePage({
  todayRequests,
  activeServices,
  endedServices,
  allServices,
  userId,
}: HomePageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
              نظام استقطاب المشاريع
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            لوحة تحكم المستقطب
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl text-lg leading-relaxed font-medium">
            مرحباً بك. تتبع طلبات الخدمات، إدارة العملاء، ومراقبة أداء المشاريع
            من مكان واحد.
          </p>
        </div>
        {/* Abstract Shapes Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 size-64 rounded-full bg-black/10 blur-2xl" />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="طلبات اليوم"
          value={todayRequests.length}
          label="طلب جديد"
          icon={Mail}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatsCard
          title="خدمات قيد التنفيذ"
          value={activeServices.length}
          label="مشروع جاري"
          icon={Zap}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatsCard
          title="الخدمات المنتهية"
          value={endedServices.length}
          label="مشروع مكتمل"
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatsCard
          title="مجموع الخدمات"
          value={allServices.length}
          label="مشروع كلياً"
          icon={Briefcase}
          color="text-slate-600"
          bg="bg-slate-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Today's Requests Section */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
          <CardHeader className="bg-white px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Clock className="size-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    آخر الطلبات الواردة اليوم
                  </CardTitle>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-amber-600"
                asChild
              >
                <Link href={`/attractor/${userId}/serviceRequest`}>
                  عرض السجل الكامل <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 grow">
            {todayRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">اسم العميل</th>
                      <th className="px-6 py-4">الخدمة المطلوبة</th>
                      <th className="px-6 py-4">وسيلة التواصل</th>
                      <th className="px-6 py-4">الميزانية</th>
                      <th className="px-6 py-4">التاريخ</th>
                      <th className="px-6 py-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {todayRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="group hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                          {req.clientName}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {req.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs">{req.clientEmail}</span>
                            <span className="text-xs">{req.clientPhone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">
                          {req.budget ? `${req.budget} $` : "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                req.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : ""
                              }
                              ${
                                req.status === "in_progress"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : ""
                              }
                              ${
                                req.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ""
                              }
                              ${
                                req.status === "cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : ""
                              }
                            `}
                          >
                            {req.status === "pending" && "قيد المراجعة"}
                            {req.status === "in_progress" && "قيد التنفيذ"}
                            {req.status === "completed" && "مكتمل"}
                            {req.status === "cancelled" && "ملغي"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Mail} text="لا توجد طلبات جديدة اليوم" />
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

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
