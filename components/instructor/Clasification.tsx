"use client";
import React, { useState } from "react";
import SectionContent from "./SectionContent";
import {
  AllChapters,
  AllContent,
  AllModules,
} from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";

interface Section {
  id: string;
  sectionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  courseTitle: string | null;
  sectionStatus?: string; // 👈 الحالة
}
interface Student {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  confirmationStatus: string | null;
}
interface Props {
  user: string;
  userId: string;
  instructorSections: {
    sectionId: string;
    sectionNumber: number;
    startDate: Date | null;
    endDate: Date | null;
    courseTitle: string | null;
  }[];
  section: Section | null;
  allModules: AllModules[];
  courseId: string;
  chapters: AllChapters[];
  contents: AllContent[];
  role?: string;
  students: Student[];
}

const Clasification = ({
  user,
  instructorSections,
  section,
  allModules,
  userId,
  courseId,
  chapters,
  contents,
  role,
  students,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"content" | "members" | "forum">(
    "content"
  );
  const [loading, setLoading] = useState(false); // ✅ حالة السبنر

  const router = useRouter();
  if (!section) {
    return <div>❌ لا يوجد بيانات لهذه الشعبة</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-lg md:text-2xl mb-4">
        مرحبا {user} اهلا بك في محتوى {section.courseTitle} - الشعبة{" "}
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
            activeTab === "members" ? "border-b-2 border-primary font-bold" : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          👥 الأعضاء
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

          {/* ✅ الشرط: إذا الحالة open أو in_progress أو closed → يعرض المحتوى */}
          {section.sectionStatus === "open" ||
          section.sectionStatus === "in_progress" ||
          section.sectionStatus === "closed" ? (
            <SectionContent
              modules={allModules}
              sectionId={section.id}
              userId={userId}
              courseId={courseId}
              chapters={chapters}
              contents={contents}
            />
          ) : (
            <div className="p-4 border rounded-lg bg-yellow-50 text-center">
              <p className="text-lg font-medium text-yellow-700">
                ⚠️ المحتوى غير متاح لهذه الحالة
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">الأعضاء المسجلين</h2>

          {/* جدول الطلاب */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">👤 الاسم</TableHead>
                <TableHead className="text-right">
                  📧 البريد الإلكتروني
                </TableHead>
                <TableHead className="text-right">📱 الهاتف</TableHead>
                <TableHead className="text-right">✅ حالة التسجيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((st) => (
                  <TableRow key={st.id}>
                    <TableCell>{st.studentName}</TableCell>
                    <TableCell>{st.studentEmail}</TableCell>
                    <TableCell>{st.studentPhone ?? "—"}</TableCell>
                    <TableCell>{st.confirmationStatus ?? "—"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    لا يوجد طلاب مسجلين في هذه الشعبة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
