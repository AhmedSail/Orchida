"use client";
import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SectionTable from "./SectionTable";

type Section = {
  id: string;
  number: number;
  instructorId: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  instructorName: string;
  instructorEmail: string;
  instructorSpecialty: string;
  status:
    | "pending_approval"
    | "open"
    | "in_progress"
    | "completed"
    | "closed"
    | "cancelled";
  currentEnrollment: number;
};

type Courses = {
  id: string;
  title: string;
  description: string;
  sections: Section[];
};

const Sections = ({
  courses,
  role,
  userId,
}: {
  courses: Courses[];
  role: string;
  userId: string;
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Courses | null>(null);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">الدورات والشعب</h2>

      {/* ✅ عرض الكاردز فقط */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {courses.map((course) => (
          <Card
            key={course.id}
            className={`shadow-md cursor-pointer transition ${
              selectedCourse?.id === course.id ? "shadow shadow-primary" : ""
            }`}
            onClick={() => setSelectedCourse(course)}
          >
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                عدد الشعب: {course.sections.length}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* ✅ عرض جدول الشعب للدورة المختارة فقط */}
      {/* ✅ عرض جدول الشعب للدورة المختارة فقط */}
      {selectedCourse ? (
        <div className="mt-6">
          {selectedCourse.sections.length > 0 ? (
            <SectionTable course={selectedCourse} role={role} userId={userId} />
          ) : (
            <p className="text-sm text-gray-500">
              لا توجد شعب لهذه الدورة حالياً
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">اختر دورة لعرض الشعب الخاصة بها</p>
      )}
    </div>
  );
};

export default Sections;
