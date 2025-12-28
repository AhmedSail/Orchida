"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Courses } from "@/app/admin/[adminId]/courses/page";

interface Props {
  course: Courses | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CourseDialog = ({ course, open, onOpenChange }: Props) => {
  return (
    <div>
      <div className="hidden lg:block">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            dir="rtl"
            className={cn(
              "sm:top-[50%] hidden lg:block sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-2xl sm:rounded-lg"
            )}
          >
            <DialogHeader>
              <DialogTitle className="text-center">{course?.title}</DialogTitle>
              <DialogDescription className="text-center">
                تفاصيل الدورة كاملة
              </DialogDescription>
            </DialogHeader>

            {course && (
              <div className="space-y-3 text-sm text-gray-700 mt-4" dir="rtl">
                <Image
                  src={course.imageUrl ?? ""}
                  alt={course.title}
                  width={200}
                  height={200}
                  className="rounded-md object-cover mx-auto"
                />
                <div>
                  <span className="font-semibold">الوصف:</span>{" "}
                  {course.description ?? "—"}
                </div>
                <div>
                  <span className="font-semibold">عدد الساعات:</span>{" "}
                  {course.hours} ساعة
                </div>
                <div>
                  <span className="font-semibold">السعر:</span>{" "}
                  {course.price ?? "—"} $
                </div>
                <div>
                  <span className="font-semibold">المدة:</span>{" "}
                  {course.duration ?? "—"}
                </div>
                <div>
                  <span className="font-semibold">الفئة المستهدفة:</span>{" "}
                  {course.targetAudience ?? "—"}
                </div>
                <div>
                  <span className="font-semibold">الأهداف:</span>{" "}
                  {course.objectives ?? "—"}
                </div>
                <div>
                  <span className="font-semibold">الحالة:</span>{" "}
                  {course.isActive ? "نشط" : "غير نشط"}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <DialogClose asChild>
                <Button variant="outline">إغلاق</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseDialog;
