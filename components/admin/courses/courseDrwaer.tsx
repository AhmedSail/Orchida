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
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Drawer,
} from "@/components/ui/drawer";
import { Courses } from "@/app/admin/[adminId]/courses/page";

interface Props {
  course: Courses | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CourseDrwaer = ({ course, open, onOpenChange }: Props) => {
  return (
    <div>
      <div className="lg:hidden ">
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent
            dir="rtl"
            className={cn(
              "max-sm:fixed lg:hidden max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:w-full max-sm:h-auto max-sm:rounded-t-lg max-sm:translate-x-0 max-sm:translate-y-0 pb-10 px-5"
            )}
          >
            <DrawerHeader>
              <DrawerTitle className="text-center">{course?.title}</DrawerTitle>
              <DrawerDescription className="text-center">
                تفاصيل الدورة كاملة
              </DrawerDescription>
            </DrawerHeader>

            {course && (
              <div className="space-y-3 text-sm text-gray-700 mt-4" dir="rtl">
                <Image
                  src={course.imageUrl ?? ""}
                  alt={course.title}
                  width={200}
                  height={200}
                  className="rounded-md object-cover mx-auto"
                  unoptimized
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
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default CourseDrwaer;
