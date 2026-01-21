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
  MessageSquare,
  Image as ImageIcon,
  Save,
  Sparkles,
  Edit3,
} from "lucide-react";
import Swal from "sweetalert2";
import MediaLibraryDialog from "./MediaLibraryDialog";

interface Props {
  active: boolean;
  setActive: (val: boolean) => void;
  prompt: any;
  onSuccess: () => void;
}

export default function EditAiPromptDialog({
  active,
  setActive,
  prompt,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title || "",
        prompt: prompt.prompt || "",
        imageUrl: prompt.imageUrl || "",
      });
    }
  }, [prompt]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.prompt) {
      Swal.fire("تنبيه", "يرجى إدخال العنوان والبرومبت", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/ai-prompts/${prompt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire("تم التحديث", "تم تعديل البرومبت بنجاح", "success");
        setActive(false);
        onSuccess();
      } else {
        throw new Error();
      }
    } catch (error) {
      Swal.fire("خطأ", "فشل في تحديث البرومبت", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={active} onOpenChange={setActive}>
        <DialogContent className="sm:max-w-lg rounded-[32px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black text-amber-600">
              <Edit3 className="size-6 text-amber-600" />
              تعديل البرومبت الذكي
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">عنوان البرومبت</Label>
              <Input
                placeholder="مثال: برومبت توليد صور سينمائية..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="rounded-2xl h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">
                نص البرومبت (Prompt)
              </Label>
              <Textarea
                placeholder="أدخل البرومبت هنا بدقة..."
                value={formData.prompt}
                onChange={(e) =>
                  setFormData({ ...formData, prompt: e.target.value })
                }
                className="rounded-2xl min-h-[150px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">
                الصورة المرفقة (اختياري)
              </Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaDialog(true)}
                  className="w-full rounded-2xl border-dashed h-12 gap-2 font-bold"
                >
                  <ImageIcon className="size-4" />
                  {formData.imageUrl
                    ? "تغيير الصورة"
                    : "اختر صورة توضيحية من المكتبة"}
                </Button>
                {formData.imageUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute top-2 right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

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
              disabled={isSubmitting}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black gap-2 px-8"
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
