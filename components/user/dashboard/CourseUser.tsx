// 📍 src/components/user/dashboard/CourseUser.tsx
"use client";
import React from "react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";

interface CourseUserProps {
  enrollments: {
    enrollmentId: string;
    sectionId: string;
    sectionNumber: number | null;
    courseTitle: string | null;
  }[];
  userId: string | null;
}

const CourseUser = ({ enrollments, userId }: CourseUserProps) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl text-primary font-bold mb-4">
        الكورسات المسجل بها
      </h1>
      <div className="grid grid-cols-1 gap-4">
        {enrollments.length > 0 ? (
          enrollments.map((course) => (
            <Link
              key={course.enrollmentId}
              href={`/dashboardUser/${userId}/courses/${course.sectionId}/content`} // 👈 رابط المحتوى الدراسي للطالب
              className="block p-4 border rounded-2xl shadow hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {course.courseTitle}
                  </h2>
                  <p>الشعبة رقم: {course.sectionNumber}</p>
                </div>
                <div>
                  <Link
                    href={`/dashboardUser/${userId}/courses/${course.sectionId}/content`}
                  >
                    <Button>فتح المحتوى التعليمي</Button>
                  </Link>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>❌ لم تسجل في أي كورس بعد</p>
        )}
      </div>
    </div>
  );
};

export default CourseUser;
