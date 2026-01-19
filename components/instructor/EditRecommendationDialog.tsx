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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Star,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import MediaLibraryDialog from "./MediaLibraryDialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Section {
  sectionId: string;
  sectionNumber: number;
  courseTitle: string | null;
}

interface Props {
  active: boolean;
  setActive: (val: boolean) => void;
  onSuccess: () => void;
  sections: Section[];
  recommendationId: string | null;
}

export default function EditRecommendationDialog({
  active,
  setActive,
  onSuccess,
  sections,
  recommendationId,
}: Props) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    sectionIds: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);

  useEffect(() => {
    if (active && recommendationId) {
      fetchRecommendation();
    }
  }, [active, recommendationId]);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommendations/${recommendationId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          linkUrl: data.linkUrl || "",
          sectionIds:
            data.sectionAssignments?.map((a: any) => a.sectionId) || [],
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sectionIds: prev.sectionIds.includes(id)
        ? prev.sectionIds.filter((s) => s !== id)
        : [...prev.sectionIds, id],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      Swal.fire("تنبيه", "يرجى إدخال عنوان التوصية", "warning");
      return;
    }

    if (formData.sectionIds.length === 0) {
      Swal.fire("تنبيه", "يرجى اختيار شعبة واحدة على الأقل", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/recommendations/${recommendationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire("تم التحديث", "تم تحديث التوصية بنجاح", "success");
        setActive(false);
        onSuccess();
      } else {
        throw new Error();
      }
    } catch (error) {
      Swal.fire("خطأ", "فشل في تحديث التوصية", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={active} onOpenChange={setActive}>
        <DialogContent className="sm:max-w-lg rounded-[32px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <Star className="text-amber-500 fill-amber-500" />
              تعديل التوصية
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="font-bold text-slate-500">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">
                  عنوان التوصية
                </Label>
                <Input
                  placeholder="أدخل عنواناً جذاباً..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="rounded-2xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">وصف قصير</Label>
                <Textarea
                  placeholder="اشرح لماذا تنصح بهذا الشيء للطلاب..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="rounded-2xl min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <Label className="font-bold text-slate-700">
                  تعديل الشعب المختارة:
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto p-2 border rounded-2xl">
                  {sections.map((sec) => (
                    <div
                      key={sec.sectionId}
                      className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl"
                    >
                      <Checkbox
                        id={`edit-${sec.sectionId}`}
                        checked={formData.sectionIds.includes(sec.sectionId)}
                        onCheckedChange={() => toggleSection(sec.sectionId)}
                      />
                      <label
                        htmlFor={`edit-${sec.sectionId}`}
                        className="text-xs font-bold cursor-pointer"
                      >
                        شعبة {sec.sectionNumber} - {sec.courseTitle}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">رابط خارجي</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      placeholder="https://..."
                      value={formData.linkUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkUrl: e.target.value })
                      }
                      className="rounded-2xl pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">
                    صورة التوصية
                  </Label>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMediaDialog(true)}
                      className="w-full rounded-2xl border-dashed h-12 gap-2 font-bold"
                    >
                      <ImageIcon className="size-4" />
                      تغيير الصورة
                    </Button>
                    {formData.imageUrl && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={formData.imageUrl}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setFormData({ ...formData, imageUrl: "" })
                          }
                          className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setActive(false)}
              className="rounded-xl font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || loading}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2 px-8"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaLibraryDialog
        open={showMediaDialog}
        onClose={() => setShowMediaDialog(false)}
        onSelect={(url) => setFormData({ ...formData, imageUrl: url })}
      />
    </>
  );
}
