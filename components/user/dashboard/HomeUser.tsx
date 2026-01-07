"use client";
import React, { useState } from "react";
import { LayoutDashboard, BookOpen, Calendar } from "lucide-react";

interface Enrollment {
  enrollmentId: string;
  sectionId: string;
  courseTitle: string | null;
  sectionNumber: number | null;
}

interface Meeting {
  id: string;
  sectionId: string;
  courseTitle: string | null;
  sectionNumber: number | null;
  date: Date;
  startTime: string;
  endTime: string;
  location: string | null;
}

interface Props {
  userName: string;
  enrollments: Enrollment[];
  meetings: Meeting[];
}

const HomeUser = ({ userName, enrollments, meetings }: Props) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "meetings" | "payments" | "settings"
  >("overview");

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50/50" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              مرحباً، {userName} 👋
            </h1>
            <p className="text-gray-500">أهلاً بك في لوحة التحكم الخاصة بك</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <LayoutDashboard className="w-6 h-6" />
          </div>
        </header>

        {/* ✅ Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              نظرة عامة
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "courses"
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("courses")}
            >
              <BookOpen className="w-4 h-4 ml-1" />
              كورساتي
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "meetings"
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("meetings")}
            >
              <Calendar className="w-4 h-4 ml-1" />
              اللقاءات القادمة
            </button>
          </div>
        </div>

        {/* ✅ محتوى التبويبات */}
        <div className="grid gap-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        عدد الكورسات
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {enrollments.length}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        اللقاءات القادمة
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {meetings.length}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* الكورسات */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    📚 آخر الكورسات المسجلة
                  </h3>
                </div>
                <div className="p-6">
                  {enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {enrollments.map((c) => (
                        <div
                          key={c.enrollmentId}
                          className="group border border-gray-200 rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-white"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                            {c.courseTitle}
                          </h3>
                          <p className="text-sm text-gray-500">
                            الشعبة: {c.sectionNumber}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>لم تسجل في أي كورس بعد</p>
                    </div>
                  )}
                </div>
              </div>

              {/* اللقاءات القادمة */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    📅 اللقاءات القادمة
                  </h3>
                </div>
                {meetings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-6 py-4 font-semibold">الدورة</th>
                          <th className="px-6 py-4 font-semibold">الشعبة</th>
                          <th className="px-6 py-4 font-semibold">التاريخ</th>
                          <th className="px-6 py-4 font-semibold">الوقت</th>
                          <th className="px-6 py-4 font-semibold">المكان</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {meetings.slice(0, 5).map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {m.courseTitle}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {m.sectionNumber}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(m.date).toLocaleDateString("ar-EG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {m.startTime} - {m.endTime}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {m.location ?? "غير محدد"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>لا يوجد لقاءات قادمة حالياً</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-6">
                📚 الكورسات المسجل فيها
              </h2>
              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((c) => (
                    <div
                      key={c.enrollmentId}
                      className="group border border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-white"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {c.courseTitle}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">الشعبة الدراسية:</span>
                        <span className="mr-2">{c.sectionNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">لم تسجل في أي كورس بعد</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "meetings" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  📅 جميع اللقاءات القادمة
                </h3>
              </div>
              {meetings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-6 py-4 font-semibold">الدورة</th>
                        <th className="px-6 py-4 font-semibold">الشعبة</th>
                        <th className="px-6 py-4 font-semibold">التاريخ</th>
                        <th className="px-6 py-4 font-semibold">الوقت</th>
                        <th className="px-6 py-4 font-semibold">المكان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {meetings.map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {m.courseTitle}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {m.sectionNumber}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(m.date).toLocaleDateString("ar-EG", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {m.startTime} - {m.endTime}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {m.location ?? "غير محدد"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">لا يوجد لقاءات قادمة حالياً</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
