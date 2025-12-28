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
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl mb-5">مرحبا {userName}</h1>
      <h1 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" /> لوحة التحكم
      </h1>

      {/* ✅ Tabs */}
      <div className="flex flex-wrap gap-4 border-b mb-6">
        <button
          className={`pb-2 text-sm md:text-base ${
            activeTab === "overview"
              ? "border-b-2 border-primary font-bold"
              : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          🏠 نظرة عامة
        </button>
        <button
          className={`pb-2 text-sm md:text-base ${
            activeTab === "courses"
              ? "border-b-2 border-primary md:text-base"
              : ""
          }`}
          onClick={() => setActiveTab("courses")}
        >
          <BookOpen className="inline-block w-4 h-4 mr-1" /> كورساتي
        </button>
        <button
          className={`pb-2 text-sm md:text-base ${
            activeTab === "meetings"
              ? "border-b-2 border-primary  md:text-base"
              : ""
          }`}
          onClick={() => setActiveTab("meetings")}
        >
          <Calendar className="inline-block w-4 h-4 mr-1" /> اللقاءات القادمة
        </button>
      </div>

      {/* ✅ محتوى التبويبات */}
      {activeTab === "overview" && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            مرحباً بك 👋
          </h2>

          {/* جدول المعلومات */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300 text-sm md:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">الاسم</th>
                  <th className="border p-2">عدد الكورسات</th>
                  <th className="border p-2">عدد اللقاءات القادمة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{userName}</td>
                  <td className="border p-2">{enrollments.length}</td>
                  <td className="border p-2">{meetings.length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* الكورسات */}
          <h3 className="text-lg font-semibold mb-2">
            📚 الكورسات المسجل فيها
          </h3>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {enrollments.map((c) => (
                <div
                  key={c.enrollmentId}
                  className="border rounded-lg shadow p-4 bg-white hover:shadow-lg transition"
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-800">
                    {c.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-600">
                    الشعبة {c.sectionNumber}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">❌ لم تسجل في أي كورس بعد</p>
          )}

          {/* اللقاءات القادمة (أول 3 فقط) */}
          <h3 className="text-lg font-semibold mb-2">📅 أقرب 3 لقاءات</h3>
          {meetings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">الدورة</th>
                    <th className="border p-2">الشعبة</th>
                    <th className="border p-2">التاريخ</th>
                    <th className="border p-2">الوقت</th>
                    <th className="border p-2">المكان</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.slice(0, 3).map((m) => (
                    <tr key={m.id}>
                      <td className="border p-2">{m.courseTitle}</td>
                      <td className="border p-2">{m.sectionNumber}</td>
                      <td className="border p-2">
                        {new Date(m.date).toLocaleDateString()}
                      </td>
                      <td className="border p-2">
                        {m.startTime} - {m.endTime}
                      </td>
                      <td className="border p-2">{m.location ?? "غير محدد"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>❌ لا يوجد لقاءات قادمة حالياً</p>
          )}
        </div>
      )}

      {/* باقي التبويبات */}
      {activeTab === "courses" && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            📚 الكورسات المسجل فيها
          </h2>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((c) => (
                <div
                  key={c.enrollmentId}
                  className="border rounded-lg shadow p-4 bg-white hover:shadow-lg transition"
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-800">
                    {c.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-600">
                    الشعبة {c.sectionNumber}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">❌ لم تسجل في أي كورس بعد</p>
          )}
        </div>
      )}

      {activeTab === "meetings" && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            📅 اللقاءات القادمة
          </h2>
          {meetings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">الدورة</th>
                    <th className="border p-2">الشعبة</th>
                    <th className="border p-2">التاريخ</th>
                    <th className="border p-2">الوقت</th>
                    <th className="border p-2">المكان</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={m.id}>
                      <td className="border p-2">{m.courseTitle}</td>
                      <td className="border p-2">{m.sectionNumber}</td>
                      <td className="border p-2">
                        {new Date(m.date).toLocaleDateString()}
                      </td>
                      <td className="border p-2">
                        {m.startTime} - {m.endTime}
                      </td>
                      <td className="border p-2">{m.location ?? "غير محدد"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>❌ لا يوجد لقاءات قادمة حالياً</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeUser;
