"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// استدعاء hook الخاص بـ EdgeStore
import { useEdgeStore } from "@/lib/edgestore";
import { useRouter } from "next/navigation";

interface StudentWorkFormProps {
  courseId: string;
  sectionId: string;
  students: { id: string | null; name: string }[];
  userRole: string;
  courseTitle: string | null;
  sectionNumber?: number;
  userId: string | null;
}

const StudentWorkForm = ({
  courseId,
  sectionId,
  students,
  userRole,
  courseTitle,
  sectionNumber,
  userId,
}: StudentWorkFormProps) => {
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<"story" | "image" | "video">("story");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { edgestore } = useEdgeStore();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !title.trim()) {
      Swal.fire("⚠️ خطأ", "يجب اختيار الطالب وإدخال عنوان العمل", "error");
      return;
    }

    let fileUrl: string | null = null;

    // ✅ رفع الملف على EdgeStore إذا النوع صورة أو فيديو
    if (file && type !== "story") {
      try {
        const resUpload = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => setUploadProgress(progress),
        });
        fileUrl = resUpload.url; // الرابط النهائي من EdgeStore
      } catch (err) {
        Swal.fire("❌ خطأ", "فشل رفع الملف على EdgeStore", "error");
        return;
      }
    }

    // ✅ إرسال البيانات للـ API مع الرابط
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("courseId", courseId);
    formData.append("sectionId", sectionId);
    formData.append("type", type);
    formData.append("title", title);
    formData.append("description", description);
    if (fileUrl) formData.append("mediaUrl", fileUrl);

    const res = await fetch("/api/student-work", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      Swal.fire("✅ تم الحفظ", "تم رفع العمل بنجاح", "success");
      setStudentId("");
      setTitle("");
      setDescription("");
      setFile(null);
      setType("story");
      setUploadProgress(0);
      router.push(
        `/${userRole}/${userId}/courses/sections/${sectionId}/allStudentsWork`
      );
    } else {
      Swal.fire("❌ خطأ", "حدث خطأ أثناء رفع العمل", "error");
    }
  };

  if (userRole !== "coordinator" && userRole !== "admin") {
    return <p className="text-red-600">❌ ليس لديك صلاحية لرفع الأعمال</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 border rounded-lg shadow bg-white"
    >
      <h2 className="text-xl font-bold">➕ إضافة عمل طالب / قصة نجاح</h2>
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="text-sm text-gray-700">
          الكورس: <span className="font-semibold">{courseTitle}</span>
        </p>
        <p className="text-sm text-gray-700">
          رقم الشعبة: <span className="font-semibold">{sectionNumber}</span>
        </p>
      </div>

      {/* اختيار الطالب */}
      <Select onValueChange={(val) => setStudentId(val)}>
        <SelectTrigger className="w-full" dir="rtl">
          <SelectValue placeholder="اختر الطالب" className="w-full" dir="rtl" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {students.map((s) => (
            <SelectItem key={s.id} value={s.id ?? ""}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* نوع العمل */}
      <Select
        onValueChange={(val) => setType(val as "story" | "image" | "video")}
        defaultValue="story"
      >
        <SelectTrigger dir="rtl" className="w-full">
          <SelectValue placeholder="اختر نوع العمل" />
        </SelectTrigger>
        <SelectContent dir="rtl" className="w-full">
          <SelectItem value="story">📖 قصة</SelectItem>
          <SelectItem value="image">🖼️ صورة</SelectItem>
          <SelectItem value="video">🎥 فيديو</SelectItem>
        </SelectContent>
      </Select>

      {/* العنوان */}
      <Input
        placeholder="عنوان العمل"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* الوصف */}
      <Textarea
        placeholder="الوصف أو القصة"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* رفع ملف إذا النوع صورة أو فيديو */}
      {type !== "story" && (
        <div>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded h-2 mt-2">
              <div
                className="bg-primary h-2 rounded"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-sm mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="w-full">
        رفع العمل
      </Button>
    </form>
  );
};

export default StudentWorkForm;
