"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Swal from "sweetalert2";

const AddMedia = ({
  workId,
  onUploaded,
}: {
  workId: string;
  onUploaded?: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isMain, setIsMain] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "اختر ملف أولاً",
        confirmButtonText: "موافق",
      });
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("workId", workId);
    formData.append("isMain", String(isMain));

    try {
      const res = await fetch("/api/media", { method: "POST", body: formData });
      setLoading(false);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم الرفع ✅",
          text: isMain ? "تم تعيين الوسيط كرئيسي" : "تم إضافة الوسيط للمعرض",
          confirmButtonText: "موافق",
        });
        setFile(null);
        setIsMain(false);
        onUploaded?.();
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل الرفع",
          confirmButtonText: "إعادة المحاولة",
        });
      }
    } catch {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "حاول مرة أخرى",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow">
      <div className="space-y-2">
        <Label htmlFor="file">اختر صورة أو فيديو</Label>
        <Input
          id="file"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isMain"
          checked={isMain}
          onCheckedChange={(c) => setIsMain(!!c)}
        />
        <Label htmlFor="isMain">اجعل هذا الوسيط رئيسي</Label>
      </div>

      <Button
        onClick={handleUpload}
        className="bg-primary text-white w-1/2 block mx-auto  hover:bg-primary/90 "
        disabled={loading}
      >
        {loading ? "جاري الرفع..." : "رفع الملف"}
      </Button>
    </div>
  );
};

export default AddMedia;
