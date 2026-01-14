"use client";

import { useState } from "react";
import { UploadCloudIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import Image from "next/image";
import { uploadFile } from "@/lib/multipart-upload";

type SingleUploaderProps = {
  bucket?: "publicFiles"; // Kept for compatibility but unused
  onChange: (url: string) => void;
  initialUrl?: string;
  required?: boolean;
};

export function SingleUploader({
  bucket,
  onChange,
  initialUrl = "",
  required = false,
}: SingleUploaderProps) {
  const [fileUrl, setFileUrl] = useState<string>(initialUrl);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);

  // تحديد نوع الملف مبدئياً بناءً على الرابط، أو false إذا كان فارغاً
  const [isVideo, setIsVideo] = useState<boolean>(() => {
    if (!initialUrl) return false;
    const ext = initialUrl.split(".").pop()?.toLowerCase();
    return ["mp4", "mov", "avi", "webm", "mkv"].includes(ext || "");
  });

  const [progress, setProgress] = useState<number | "COMPLETE" | "ERROR">(0);

  async function handleFileUpload(file: File) {
    setProgress(0);

    // إنشاء معاينة فورية
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // تحديد النوع بناءً على الملف المختار
    setIsVideo(file.type.startsWith("video/"));

    try {
      const url = await uploadFile(file, (progress) => {
        setProgress(progress);
      });

      setFileUrl(url);
      setPreviewUrl(url); // تحديث الرابط بالرابط الحقيقي
      setProgress("COMPLETE");
      onChange(url);
    } catch (err) {
      setProgress("ERROR");
      setPreviewUrl("");
      setIsVideo(false);
      Swal.fire({
        icon: "error",
        title: "خطأ في رفع الملف",
        text: "تعذر رفع الملف، حاول مرة أخرى.",
      });
    }
  }

  async function removeFile() {
    if (fileUrl) {
      try {
        await fetch("/api/upload/r2", {
          method: "DELETE",
          body: JSON.stringify({ url: fileUrl }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("فشل حذف الملف:", err);
      }
    }
    setFileUrl("");
    setPreviewUrl("");
    setIsVideo(false);
    onChange("");
  }

  return (
    <div className="space-y-2">
      {!previewUrl ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:border-gray-400">
          <UploadCloudIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">اختر ملفاً (صورة أو فيديو)</p>
          <input
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            required={required}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </label>
      ) : (
        <div className="relative flex items-center gap-2 rounded-lg border p-2">
          {isVideo ? (
            <video
              src={previewUrl}
              className="h-32 w-48 rounded-md object-cover bg-black"
              controls
            />
          ) : (
            <Image
              width={160}
              height={160}
              src={previewUrl}
              alt="Uploaded"
              className="h-20 w-20 rounded-md object-cover"
              unoptimized={false}
            />
          )}

          {typeof progress === "number" && progress < 100 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200 w-full transition-all">
              <div
                className="h-1 bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            onClick={removeFile}
            className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
