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
      course: `كورس ${courseTitle}`,
      students: count,
    }));

  // ✅ نسبة إكمال الكورسات
  const completionRate =
    stats && stats.completedCourses && stats.activeCourses
      ? Math.round(
          (stats.completedCourses /
            (stats.completedCourses + stats.inProgressCourses)) *
            100
        )
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Pie Chart لحالة الخدمات */}
      <div className="p-4 border rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📊 حالة الخدمات</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={serviceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {serviceData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart لتوزيع الطلاب على الكورسات */}
      <div className="p-4 border rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">👨‍🎓 توزيع الطلاب على الكورسات</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={studentDistribution || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart للتسجيلات اليومية */}
      <div className="p-4 border rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">📅 التسجيلات اليومية</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={enrollmentsByDay || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* نسبة إكمال الكورسات */}
      <div className="p-4 border rounded-lg shadow flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold mb-4">🎯 نسبة إكمال الكورسات</h3>
        <div className="text-4xl font-bold text-primary">{completionRate}%</div>
      </div>
    </div>
  );
};

export default DashboardCharts;
