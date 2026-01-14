"use client";

import { useState } from "react";
import LargeFileUpload from "@/components/upload/LargeFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";

export default function ExampleUsage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVideoUpload = (url: string) => {
    console.log("✅ الرابط الدائم للفيديو:", url);
    setVideoUrl(url);
    Swal.fire({
      icon: "success",
      title: "تم رفع الفيديو بنجاح!",
      text: "الرابط دائم ويمكن استخدامه الآن",
      timer: 2000,
    });
  };

  const handleSubmit = async () => {
    if (!videoUrl || !title) {
      Swal.fire("خطأ", "يرجى إدخال العنوان ورفع الفيديو", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          videoUrl, // هذا الرابط دائم!
        }),
      });

      if (response.ok) {
        Swal.fire("نجح!", "تم حفظ العمل بنجاح", "success");
        setTitle("");
        setVideoUrl("");
      }
    } catch (error) {
      Swal.fire("خطأ", "فشل في حفظ العمل", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">إضافة عمل جديد</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">عنوان العمل</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل عنوان العمل"
            className="mt-2"
          />
        </div>

        <div>
          <Label>رفع الفيديو (حتى 2GB)</Label>
          <div className="mt-2">
            <LargeFileUpload
              onUploadComplete={handleVideoUpload}
              accept="video/*"
              maxSizeMB={2048}
            />
          </div>
          {videoUrl && (
            <p className="text-sm text-emerald-600 mt-2">
              ✅ تم رفع الفيديو: {videoUrl}
            </p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !videoUrl || !title}
          className="w-full h-12"
        >
          {loading ? "جاري الحفظ..." : "حفظ العمل"}
        </Button>
      </div>
    </div>
  );
}
