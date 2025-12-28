"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AllChapters } from "@/app/instructor/[instructorId]/courses/[sectionId]/content/page";

const AddChapterDialog = ({
  active,
  setActive,
  moduleId, // ✅ الفصل مرتبط بالوحدة
  onChapterAdded,
}: {
  active: boolean;
  setActive: (open: boolean) => void;
  moduleId: string;
  onChapterAdded: (chapter: AllChapters) => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId, // ✅ نربط الفصل بالوحدة
          title,
          description,
          orderIndex: 1,
        }),
      });

      if (res.ok) {
        const newChapter = await res.json();
        Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح 🎉",
          text: `تمت إضافة الفصل: ${title}`,
          confirmButtonText: "موافق",
        }).then(() => {
          window.location.reload();
        });
        setTitle("");
        setDescription("");
        setActive(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "تعذر حفظ الفصل",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء الاتصال بالسيرفر",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={active} onOpenChange={setActive}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة فصل جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">اسم الفصل</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: HTML"
              required
            />
          </div>
          <div>
            <label className="block mb-1">الوصف</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للفصل"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  جاري الحفظ...
                </span>
              ) : (
                "حفظ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChapterDialog;
