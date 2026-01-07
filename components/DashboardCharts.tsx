"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import React from "react";
import { Badge } from "./ui/badge";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
  };
  studentsCountByCourse?: Record<string, number>;
  enrollmentsByDay?: { day: string; count: number }[]; // ✅ التسجيلات اليومية
}

const DashboardCharts = ({
  stats,
  studentsCountByCourse,
  enrollmentsByDay,
}: Props) => {
  // ✅ Pie chart لحالة الخدمات
  const serviceData = [
    { name: "نشطة", value: stats?.activeServices || 0 },
    { name: "مكتملة", value: stats?.endedServices || 0 },
  ];

  // ✅ توزيع الطلاب على الكورسات
  const studentDistribution =
    studentsCountByCourse &&
    Object.entries(studentsCountByCourse).map(([courseTitle, count]) => ({
      course:
        courseTitle.length > 15
          ? courseTitle.substring(0, 15) + "..."
          : courseTitle,
      students: count,
    }));

  // ✅ نسبة إكمال الكورسات
  const completionRate =
    stats && (stats.completedCourses || stats.inProgressCourses)
      ? Math.round(
          (stats.completedCourses /
            (stats.completedCourses + stats.inProgressCourses)) *
            100
        )
      : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 border border-slate-100 shadow-xl rounded-xl">
          <p className="font-bold text-slate-800 mb-1">
            {label || payload[0].name}
          </p>
          <p className="text-primary font-black">
            {payload[0].value}{" "}
            <span className="text-[10px] text-slate-400 font-normal">سجل</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
      {/* توزيع الطلاب على الكورسات - Bar Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-700">
            توزيع المسجلين حسب الدورة
          </h3>
          <Badge variant="outline" className="text-[10px] opacity-60">
            Bar Chart
          </Badge>
        </div>
        <div className="h-[300px] w-full bg-slate-50/50 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentDistribution || []}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#675795" stopOpacity={1} />
                  <stop offset="100%" stopColor="#897baa" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="course"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f1f5f9" }}
              />
              <Bar
                dataKey="students"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* التسجيلات اليومية - Area Chart style with Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-700">
            نشاط التسجيل الأسبوعي
          </h3>
          <Badge variant="outline" className="text-[10px] opacity-60">
            Daily Activity
          </Badge>
        </div>
        <div className="h-[300px] w-full bg-slate-50/50 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentsByDay || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickFormatter={(val) =>
                  new Date(val).toLocaleDateString("ar-EG", {
                    weekday: "short",
                  })
                }
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f1f5f9" }}
              />
              <Bar
                dataKey="count"
                fill="#eeb919"
                radius={[6, 6, 0, 0]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart لحالة الخدمات */}
      <div className="space-y-4 lg:col-span-1">
        <h3 className="text-lg font-bold text-slate-700 px-2">
          توازن الخدمات الرقمية
        </h3>
        <div className="h-[300px] w-full bg-slate-50/50 rounded-2xl p-4 flex flex-col items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
              >
                {serviceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#675795" : "#10b981"}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-[10px] text-slate-500 font-bold">نشطة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500 font-bold">
                مكتملة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* نسبة الإنجاز والتقدم */}
      <div className="space-y-4 lg:col-span-1">
        <h3 className="text-lg font-bold text-slate-700 px-2">
          معدل الإنجاز العام
        </h3>
        <div className="h-[300px] w-full bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="relative z-10 text-center">
            <p className="text-sm font-bold text-primary/60 mb-2 uppercase tracking-widest leading-none">
              Global Progress
            </p>
            <div className="text-7xl font-black text-primary mb-2 group-hover:scale-110 transition-transform duration-500">
              {completionRate}%
            </div>
            <p className="text-slate-500 text-xs max-w-[200px] mx-auto">
              نسبة الكورسات المكتملة مقارنة بجميع الكورسات قيد التنفيذ
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 size-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
          <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
