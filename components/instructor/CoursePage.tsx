// 📍 src/components/instructor/CoursePage.tsx
"use client";
import React from "react";
import { Link } from "next-view-transitions";
import { Button } from "../ui/button";

interface CoursePageProps {
  instructorSections: {
    sectionId: string;
    sectionNumber: number;
    startDate: Date | null;
    endDate: Date | null;
    courseTitle: string | null;
    courseStatus: string; // 👈 الحالة موجودة هنا
  }[];
  userId: string;
}

const sectionStatuses = [
  { key: "pending_approval", label: "⏳ بانتظار الموافقة" },
  { key: "open", label: "📖 التسجيل مفتوح" },
  { key: "in_progress", label: "🚀 الدورة قيد التنفيذ" },
  { key: "completed", label: "🏁 الدورة انتهت" },
  { key: "closed", label: "🔒 التسجيل مغلق" },
  { key: "cancelled", label: "❌ التسجيل ملغى" },
];
const CoursePage = ({ instructorSections, userId }: CoursePageProps) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 الكورسات الخاصة بك</h1>
      <div className="grid grid-cols-1 gap-4">
        {instructorSections.map((section) => (
          <Link
            key={section.sectionId}
            href={`/instructor/${userId}/courses/${section.sectionId}/content`}
            className="block p-4 border rounded-2xl shadow hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{section.courseTitle}</h2>
                <p>الشعبة رقم: {section.sectionNumber}</p>
                <p className="text-gray-500">
                  {section.startDate?.toString().slice(0, 10)} -{" "}
                  {section.endDate?.toString().slice(0, 10)}
                </p>

                <ul className="space-y-2">
                  {sectionStatuses.map((status) => {
                    // ✅ إذا تساوت الحالة مع الحالة الحالية للشعبة
                    if (status.key === section.courseStatus) {
                      return (
                        <li
                          key={status.key}
                          className="p-3 border rounded-lg shadow hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span className="font-medium">{status.label}</span>
                          <span className="text-gray-500 text-sm">
                            ({status.key})
                          </span>
                        </li>
                      );
                    }
                    return null; // 👈 إذا مش نفس الحالة ما يعرض شيء
                  })}
                </ul>
              </div>

              <div>
                <Link
                  href={`/instructor/${userId}/courses/${section.sectionId}/content`}
                >
                  <Button>فتح المحتوى التعليمي</Button>
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CoursePage;
