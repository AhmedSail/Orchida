"use client";
import React, { useState } from "react";

import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import SectionContent from "./SectionContent";
import { useRouter } from "next/navigation";

interface Section {
  id: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
  notes?: string | null;
}

interface Props {
  user: string;
  userId: string;
  section: Section | null;
  allModules: AllModules[];
  courseId: string;
  chapters: AllChapters[];
  contents: AllContent[];
  IBAN: string | null;
  role?: string;
}

const Clasification = ({
  user,
  section,
  allModules,
  userId,
  courseId,
  chapters,
  contents,
  IBAN,
  role,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"content" | "forum">("content");
  const router = useRouter();
  if (!section) {
    return <div>❌ لا يوجد بيانات لهذه الشعبة</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-lg md:text-2xl mb-4">
        مرحبا {user} 👋 أهلاً بك في محتوى {section.courseTitle} - الشعبة{" "}
        {section.sectionNumber}
      </h1>

      {/* ✅ Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`pb-2 ${
            activeTab === "content" ? "border-b-2 border-primary font-bold" : ""
          }`}
          onClick={() =>
            router.push(
              `/${
                role === "user" ? "dashboardUser" : `${role}`
              }/${userId}/courses/${section?.id}/content`
            )
          }
        >
          📚 المحتوى
        </button>
        <button
          className={`pb-2 ${
            activeTab === "forum" ? "border-b-2 border-primary font-bold" : ""
          }`}
          onClick={() =>
            router.push(
              `/${
                role === "user" ? "dashboardUser" : `${role}`
              }/${userId}/courses/${section?.id}/chat`
            )
          }
        >
          💬 المنتدى الطلابي
        </button>
      </div>

      {/* ✅ محتوى كل تبويب */}
      {activeTab === "content" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">محتوى الدورة</h2>

          {/* ✅ البوكس الثابت */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              📌 ملاحظات هامة
            </h3>
            <p className="text-sm text-gray-700">
              سوف يتم اضافة جميع الامور المهمة الخاصة بالدورة في هذا الحقل
            </p>
            {/* ✅ عرض الايبان إذا موجود */}
            {IBAN && (
              <div className="mb-4 p-4 mt-5 bg-green-50 border border-green-200 rounded-lg shadow">
                <p className="text-sm text-gray-700">
                  رقم الـ IBAN الخاص بك:{" "}
                  <span className="font-mono">{IBAN}</span>
                </p>
              </div>
            )}
            {section.notes && (
              <div className="mb-4 p-4 mt-5 bg-green-50 border border-green-200 rounded-lg shadow">
                <p className="text-sm text-gray-700">{section.notes}</p>
              </div>
            )}
          </div>

          {/* ✅ المحتوى الفعلي */}
          <SectionContent
            modules={allModules}
            sectionId={section.id}
            userId={userId}
            courseId={courseId}
            chapters={chapters}
            contents={contents}
          />
        </div>
      )}

      {activeTab === "forum" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">المنتدى الطلابي</h2>
          <p>هنا يمكن للطلاب طرح الأسئلة والمناقشات.</p>
        </div>
      )}
    </div>
  );
};

export default Clasification;
