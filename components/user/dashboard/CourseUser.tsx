"use client";
import React from "react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertCircle } from "lucide-react";

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
    <div className="p-6 md:p-8 min-h-screen bg-gray-50/50" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              الكورسات المسجل بها 📚
            </h1>
            <p className="text-gray-500 text-sm">
              قائمة بجميع الكورسات والشعب الدراسية التي قمت بالتسجيل فيها
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.length > 0 ? (
            enrollments.map((course) => (
              <div
                key={course.enrollmentId}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="mb-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <BookOpen className="w-6 h-6" />
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {course.courseTitle}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50 p-2 rounded-lg w-fit">
                    <span className="font-medium">الشعبة:</span>
                    <span className="font-bold">{course.sectionNumber}</span>
                  </div>
                </div>

                <Link
                  href={`/dashboardUser/${userId}/courses/${course.sectionId}/content`}
                  className="w-full"
                >
                  <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <BookOpen className="w-4 h-4" />
                    فتح المحتوى التعليمي
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                عفواً، لا توجد كورسات مسجلة
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                لم تقم بالتسجيل في أي كورس دراسي حتى الآن. يمكنك تصفح الكورسات
                المتاحة والتسجيل فيها.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseUser;
