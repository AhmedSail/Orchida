"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save, X } from "lucide-react";
import Swal from "sweetalert2";

interface Props {
  active: boolean;
  setActive: (val: boolean) => void;
  sectionId: string;
  initialNotes: string;
  onUpdate: (newNotes: string) => void;
}

export default function EditNotesDialog({
  active,
  setActive,
  sectionId,
  initialNotes,
  onUpdate,
}: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (active) {
      setNotes(initialNotes);
    }
  }, [active, initialNotes]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/courses/courseSections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        onUpdate(notes);
        Swal.fire({
          icon: "success",
          title: "تم حفظ الملاحظات",
          timer: 1500,
          showConfirmButton: false,
        });
        setActive(false);
      } else {
        throw new Error();
      }
    } catch (error) {
      Swal.fire("خطأ", "فشل في حفظ الملاحظات", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent className="sm:max-w-md rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <StickyNote className="text-primary" />
            تعديل ملاحظات الدورة
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="اكتب ملاحظاتك هنا لتظهر للطلاب في أعلى الصفحة..."
            className="min-h-[200px] rounded-2xl border-slate-200 focus:ring-primary"
          />
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setActive(false)}
            className="rounded-xl font-bold"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2"
          >
            {isSubmitting ? (
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            حفظ الملاحظات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
