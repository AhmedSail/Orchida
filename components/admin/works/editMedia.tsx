"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

type MediaFile = {
  id: number;
  url: string;
  type: "image" | "video";
  workId: string;
};

const EditMedia = ({ workId }: { workId: string }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [mainId, setMainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const fetchData = async () => {
    const res = await fetch(`/api/work/${workId}/media`);
    if (res.ok) {
      const data = await res.json();
      setFiles(data.files);
      setMainId(data.mainMediaId ?? null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workId]);

  const handleSelectMain = (id: number) => setMainId(id);

  const saveMain = async () => {
    if (!mainId) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "اختر وسيط رئيسي أولاً",
      });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/work/set-main-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workId, mediaId: mainId }),
    });
    setLoading(false);

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "تم الحفظ ✅",
        text: "تم تحديث الوسيط الرئيسي",
      });
      router.push(`/admin/works`);
      fetchData();
    } else {
      Swal.fire({ icon: "error", title: "خطأ ❌", text: "فشل حفظ التحديث" });
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا الوسيط نهائيًا",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });
    if (!confirm.isConfirmed) return;

    const res = await fetch("/api/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, workId }),
    });

    if (res.ok) {
      Swal.fire({ icon: "success", title: "تم الحذف ✅" });
      fetchData();
    } else {
      Swal.fire({ icon: "error", title: "خطأ ❌", text: "فشل الحذف" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="border rounded-lg p-2 flex flex-col items-center space-y-2"
          >
            {file.type === "image" ? (
              <Image
                src={file.url}
                alt="media"
                width={220}
                height={150}
                className="object-cover w-[220px] h-[150px] rounded"
              />
            ) : (
              <video
                src={file.url}
                controls
                className="w-[220px] h-[150px] rounded"
              />
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                checked={mainId === file.id}
                onCheckedChange={() => handleSelectMain(file.id)}
              />
              <span>اجعل رئيسي</span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(file.id)}
              className="w-1/2"
            >
              حذف
            </Button>
          </div>
        ))}
      </div>

      <Button
        onClick={saveMain}
        className="bg-primary text-white hover:bg-primary/90 w-1/4 mx-auto block"
        disabled={loading}
      >
        {loading ? "جاري الحفظ..." : "حفظ التحديد الرئيسي"}
      </Button>
    </div>
  );
};

export default EditMedia;
