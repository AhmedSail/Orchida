"use client";
import DashboardCharts from "@/components/DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

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
  };
  studentsCountByCourse?: Record<string, number>;
  loading?: boolean;
  userId?: string;
  latestEnrollments?: Enrollment[];
  enrollmentsByDay?: { day: string; count: number }[];
}

const HomePage = ({
  stats,
  studentsCountByCourse,
  loading,
  userId,
  latestEnrollments,
  enrollmentsByDay,
}: Props) => {
  return (
    <div className="mx-auto p-4 sm:p-6 space-y-6 ">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          لوحة التحكم
        </h1>
        <p className="text-sm text-muted-foreground">
          مرحبًا بكم في لوحة الإدارة
        </p>
      </header>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 shadow-sm shadow-primary space-y-2"
            >
              <Skeleton className="h-6 w-16" />
            </div>
          ))
        ) : (
          <>
            {[
              { label: "المستخدمون النشطون", value: stats?.activeUsers },
              { label: "الطلبات اليوم", value: stats?.todayRequests },
              { label: "الخدمات النشطة", value: stats?.activeServices },
              { label: "الخدمات المنتهية", value: stats?.endedServices },
              { label: "مجموع الخدمات", value: stats?.allServices },
              { label: "الكورسات النشطة", value: stats?.activeCourses },
              {
                label: "كورسات بانتظار الموافقة",
                value: stats?.pendingCourses,
              },
              { label: "كورسات قيد التنفيذ", value: stats?.inProgressCourses },
              { label: "كورسات مغلقة", value: stats?.ClosedCourses },
              { label: "كورسات مكتملة", value: stats?.completedCourses },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg p-4 shadow-sm shadow-primary bg-white"
              >
                <h2 className="text-base sm:text-lg font-medium mb-2">
                  {item.label}
                </h2>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {item.value}
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* جدول آخر 5 تسجيلات */}
      {/* آخر 5 تسجيلات */}
      {latestEnrollments && latestEnrollments.length > 0 && (
        <div className="rounded-lg p-4 shadow-sm shadow-primary bg-white">
          <h2 className="text-lg font-bold mb-4">🆕 آخر 5 تسجيلات</h2>

          {/* ✅ Cards للموبايل والآيباد */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {latestEnrollments.map((enr) => (
              <div
                key={enr.enrollmentId}
                className="border rounded-lg p-4 shadow-sm bg-gray-50 flex flex-col space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-primary">
                    {enr.studentName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(enr.registeredAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>

                <p className="text-sm text-gray-700">📧 {enr.studentEmail}</p>
                <p className="text-sm text-gray-700">
                  📱 {enr.studentPhone ?? "—"}
                </p>

                <div className="mt-2">
                  <p className="text-sm">
                    🎓 <span className="font-medium">الكورس:</span>{" "}
                    {enr.courseTitle}
                  </p>
                  <p className="text-sm">
                    🗂 <span className="font-medium">الشعبة:</span>{" "}
                    {enr.sectionStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Table للـ Laptop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-right">اسم الطالب</th>
                  <th className="p-2 text-right">الإيميل</th>
                  <th className="p-2 text-right">الهاتف</th>
                  <th className="p-2 text-right">الكورس</th>
                  <th className="p-2 text-right">الشعبة</th>
                  <th className="p-2 text-right">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {latestEnrollments.map((enr) => (
                  <tr key={enr.enrollmentId} className="border-b">
                    <td className="p-2">{enr.studentName}</td>
                    <td className="p-2">{enr.studentEmail}</td>
                    <td className="p-2">{enr.studentPhone ?? "—"}</td>
                    <td className="p-2">{enr.courseTitle}</td>
                    <td className="p-2">{enr.sectionStatus}</td>
                    <td className="p-2">
                      {new Date(enr.registeredAt).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <DashboardCharts
          stats={stats}
          studentsCountByCourse={studentsCountByCourse}
          enrollmentsByDay={enrollmentsByDay}
        />
      )}
    </div>
  );
};

export default HomePage;
