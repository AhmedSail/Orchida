"use client";

import { useState } from "react";
import { UploadCloudIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import Image from "next/image";

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
  const [progress, setProgress] = useState<number | "COMPLETE" | "ERROR">(0);

  async function handleFileUpload(file: File) {
    setProgress(0);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload/r2");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.url);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));

        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });

      setFileUrl(url);
      setProgress("COMPLETE");
      onChange(url);
    } catch (err) {
      setProgress("ERROR");
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
    onChange("");
  }

  return (
    <div className="space-y-2">
      {!fileUrl ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:border-gray-400">
          <UploadCloudIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">اختر صورة رئيسية</p>
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
          {fileUrl.toLowerCase().endsWith(".mp4") ||
          fileUrl.toLowerCase().endsWith(".mov") ? (
            <video
              src={fileUrl}
              className="h-32 w-48 rounded-md object-cover"
              controls
            />
          ) : (
            <Image
              width={160}
              height={160}
              src={fileUrl}
              alt="Uploaded"
              className="h-20 w-20 rounded-md object-cover"
              unoptimized={false} // Use optimized images if possible, or keep unoptimized if R2 domain is not configured in next.config
            />
          )}

          {typeof progress === "number" && progress < 100 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200">
              <div
                className="h-1 bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            onClick={removeFile}
            className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            type="button" // Ensure it doesn't submit forms
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
