"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Loader2, ArrowRightLeft } from "lucide-react";
import Swal from "sweetalert2";

interface Section {
  id: string;
  sectionNumber: number;
  instructorName: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  currentSectionId: string;
  allSections: Section[];
  onSuccess: (newSectionId: string) => void;
  studentType: "registered" | "interested";
}

export default function MoveStudentDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  currentSectionId,
  allSections,
  onSuccess,
  studentType,
}: Props) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSections = allSections.filter(
    (s) => s.id !== currentSectionId,
  );

  const handleMove = async () => {
    if (!selectedSectionId) {
      Swal.fire("تنبيه", "يرجى اختيار الشعبة المراد النقل إليها", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      // إذا كان مسجلاً، نعدل جدول enrollments، وإذا كان مهتماً نعدل جدول leads
      const endpoint =
        studentType === "registered"
          ? `/api/course-enrollments/${studentId}`
          : `/api/course-leads/${studentId}`;

      const res = await fetch(endpoint, {
        method: studentType === "registered" ? "PUT" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: selectedSectionId }),
      });

      if (res.ok) {
        Swal.fire("تم بنجاح", `تم نقل الطالب ${studentName} بنجاح`, "success");
        onOpenChange(false);
        onSuccess(selectedSectionId);
      } else {
        const data = await res.json();
        throw new Error(data.message || "فشل عملية النقل");
      }
    } catch (error: any) {
      Swal.fire("خطأ", error.message || "حدث خطأ أثناء نقل الطالب", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[32px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <ArrowRightLeft className="text-blue-500" />
            نقل الطالب إلى شعبة أخرى
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm font-bold">
                {studentName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-blue-600 font-bold">نقل الطالب:</p>
                <p className="font-black text-slate-900">{studentName}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-slate-700 pr-1">
              اختر الشعبة الجديدة:
            </Label>
            <Select
              onValueChange={setSelectedSectionId}
              value={selectedSectionId}
            >
              <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                <SelectValue placeholder="اختر الشعبة..." />
              </SelectTrigger>
              <SelectContent>
                {availableSections.length > 0 ? (
                  availableSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      شعبة {section.sectionNumber} - {section.instructorName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    لا توجد شعب أخرى متاحة
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500 px-1">
              * سيتم نقل جميع بيانات الطالب وسجلاته إلى الشعبة المختارة.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleMove}
            disabled={isSubmitting || !selectedSectionId}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black gap-2 px-8 shadow-lg shadow-blue-100"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="size-4" />
            )}
            نقل الآن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
