"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface Section {
  id: string;
  sectionNumber: number;
  instructor?: {
    name: string;
  };
  status: string;
}

interface BulkAcceptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationIds: string[];
  courseId: string;
  courseTitle: string;
  onSuccess: () => void;
}

const BulkAcceptDialog = ({
  open,
  onOpenChange,
  applicationIds,
  courseId,
  courseTitle,
  onSuccess,
}: BulkAcceptDialogProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && courseId) {
      fetchSections();
    }
  }, [open, courseId]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${courseId}/sections`);
      if (!res.ok) throw new Error("Failed to fetch sections");
      const data = await res.json();
      setSections(data);
      if (data.length > 0) {
        setSelectedSection(data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAccept = async () => {
    if (!selectedSection) return;

    try {
      setSubmitting(true);
      
      // We will perform serial acceptance for now
      // Alternatively, we could create a bulk acceptance API endpoint
      const promises = applicationIds.map(async (id) => {
        const res = await fetch(`/api/course-applications/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: selectedSection }),
        });
        return res.ok;
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r).length;

      onOpenChange(false);
      onSuccess();
      
      Swal.fire({
        title: "اكتملت العملية!",
        text: `تم قبول ${successCount} طلاب وتحويلهم بنجاح.`,
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    } catch (error: any) {
      Swal.fire("خطأ", error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <CheckCircle2 className="text-green-500 w-6 h-6" />
            قبول مجموعة طلاب
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium pt-2">
            سيتم نقل <span className="text-primary font-bold">{applicationIds.length}</span> طلاب إلى دورة <span className="font-bold">{courseTitle}</span>. يرجى تحديد الشعبة المشتركة.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 mr-1">اختيار الشعبة المتاحة</label>
            {loading ? (
              <div className="flex items-center justify-center py-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sections.length > 0 ? (
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-zinc-50 focus:ring-primary/20">
                  <SelectValue placeholder="اختر الشعبة..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id} className="rounded-xl py-3">
                      شعبة رقم {section.sectionNumber} {section.instructor ? ` - مدرب: ${section.instructor.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-red-50 rounded-2xl border border-red-100 text-red-600 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p className="font-bold text-sm">لا توجد شعب مفتوحة حالياً لهذه الدورة!</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-2xl font-bold"
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleBulkAccept}
            disabled={submitting || sections.length === 0}
            className="flex-1 h-12 rounded-2xl font-black bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "تأكيد القبول الجماعي"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAcceptDialog;
