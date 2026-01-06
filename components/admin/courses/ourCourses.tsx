"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { Spinner } from "@/components/ui/spinner";
import Swal from "sweetalert2";
import Image from "next/image";
import CourseDrwaer from "./courseDrwaer";
import CourseDialog from "./courseDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { CourseWithSections } from "@/app/coordinator/[coordinatorId]/courses/page";
import { useEdgeStore } from "@/lib/edgestore";

interface Props {
  courses: CourseWithSections[];
  role: string;
  userId: string;
}

const OurCourses = ({ courses, role, userId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState<CourseWithSections[]>([]);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseWithSections | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5; // عدد الكورسات في كل صفحة

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = allCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  const totalPages = Math.ceil(allCourses.length / coursesPerPage);

  const handleView = (course: CourseWithSections) => {
    setSelectedCourse(course);
    setIsOpen(true);
  };

  useEffect(() => {
    setAllCourses(courses);
  }, [courses]);

  const { edgestore } = useEdgeStore();
  const handleDelete = async (course: CourseWithSections) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة بيانات هذه الدورة بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    try {
      if (course.imageUrl) {
        await edgestore.protectedFiles.delete({
          url: course.imageUrl,
        });
      }
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");

      setAllCourses((prev) => prev.filter((c) => c.id !== course.id));

      Swal.fire({
        title: "تم الحذف!",
        text: "تم حذف الدورة والصورة الخاصة بها بنجاح.",
        icon: "success",
        confirmButtonText: "حسناً",
      });
    } catch (error) {
      Swal.fire({
        title: "خطأ!",
        text: "حدث خطأ أثناء الحذف. حاول مرة أخرى.",
        icon: "error",
        confirmButtonText: "حسناً",
      });
    }
  };

  const canOpenNewSection = (course: CourseWithSections): boolean => {
    if (course.sections.length === 0) return true;
    const lastSection = course.sections[course.sections.length - 1];
    // Allow opening new section if the current one is NOT in an active registration/approval state
    // i.e., allow if status is: 'in_progress', 'completed', 'closed', 'cancelled'
    const activeStatuses = ["open", "pending_approval"];
    return !activeStatuses.includes(lastSection.status);
  };

  return (
    <div className="p-5">
      <div className="lg:flex justify-between items-center mb-4">
        <h2 className="text-2xl text-primary font-bold mb-4">قائمة الدورات</h2>
        {role === "admin" && (
          <Button
            onClick={() => {
              setLoading(true);
              window.location.href = `/admin/${userId}/courses/add`;
            }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <Spinner />
                <span>إضافة دورة جديدة</span>
              </div>
            ) : (
              <span>إضافة دورة جديدة</span>
            )}
          </Button>
        )}
      </div>

      {/* جدول للديسكتوب */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الصورة</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الساعات</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCourses.map((course) => {
              const isNewSectionDisabled = !canOpenNewSection(course);
              return (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={100}
                        height={100}
                        unoptimized
                      />
                    ) : (
                      <span>لا توجد صورة</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.hours} ساعة</TableCell>
                  <TableCell>{course.price?.toString()} $</TableCell>
                  <TableCell>
                    {course.isActive ? (
                      <span className="text-green-600 font-semibold">نشط</span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        غير نشط
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="flex flex-col gap-2">
                    {role === "admin" && (
                      <>
                        <Link
                          href={`/admin/${userId}/courses/edit/${course.id}`}
                        >
                          <Button variant={"outline"} className="w-full">
                            تعديل
                          </Button>
                        </Link>
                        <Button
                          variant={"destructive"}
                          onClick={() => handleDelete(course)}
                        >
                          حذف
                        </Button>
                      </>
                    )}
                    <Button
                      variant={"secondary"}
                      onClick={() => handleView(course)}
                    >
                      <span className="font-semibold">عرض</span>
                    </Button>
                    <Link
                      href={`/${role}/${userId}/courses/newSection/${course.id}`}
                    >
                      <Button
                        variant={"default"}
                        size="sm"
                        disabled={isNewSectionDisabled}
                        className="w-full"
                      >
                        فتح شعبة
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* ✅ Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            السابق
          </Button>
          <span>
            صفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            التالي
          </Button>
        </div>
      </div>

      {/* كارد للموبايل */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {currentCourses.map((course) => (
          <div
            key={course.id}
            className="border rounded-lg shadow-md p-4 flex flex-col items-center text-center"
          >
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                width={200}
                height={150}
                className="rounded-md object-cover mb-3"
                unoptimized
              />
            ) : (
              <span>لا توجد صورة</span>
            )}
            <h3 className="text-lg font-bold text-primary">{course.title}</h3>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">المدة:</span> {course.hours} ساعة
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">السعر:</span>{" "}
              {course.price ?? "—"} $
            </p>
            <p
              className={`text-sm font-semibold ${
                course.isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="font-semibold">الحالة:</span>{" "}
              {course.isActive ? "نشط" : "غير نشط"}
            </p>
            <div className="flex justify-center gap-2 mt-3">
              {role === "admin" && (
                <>
                  <Link href={`/admin/${userId}/courses/edit/${course.id}`}>
                    <Button variant={"outline"} size="sm" className="w-full">
                      تعديل
                    </Button>
                  </Link>
                  <Button
                    variant={"destructive"}
                    size="sm"
                    onClick={() => handleDelete(course)}
                  >
                    حذف
                  </Button>
                </>
              )}
              <Button
                variant={"secondary"}
                size="sm"
                onClick={() => handleView(course)}
              >
                عرض
              </Button>
              <Link href={`/${role}/${userId}/courses/newSection/${course.id}`}>
                <Button
                  variant={"default"}
                  size="sm"
                  disabled={!canOpenNewSection(course)}
                  className="w-full"
                >
                  فتح شعبة
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {/* ✅ Pagination Controls للموبايل */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            السابق
          </Button>
          <span>
            صفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            التالي
          </Button>
        </div>
      </div>

      {/* عرض التفاصيل إما في Drawer أو Dialog حسب الجهاز */}
      {isMobile ? (
        <CourseDrwaer
          course={selectedCourse}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      ) : (
        <CourseDialog
          course={selectedCourse}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </div>
  );
};

export default OurCourses;
