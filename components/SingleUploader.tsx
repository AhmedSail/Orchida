"use client";

import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";
import { UploadCloudIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import Image from "next/image";

type SingleUploaderProps = {
  bucket: "protectedFiles";
  onChange: (url: string) => void; // رابط واحد فقط
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
  const { edgestore } = useEdgeStore();

  async function handleFileUpload(file: File) {
    try {
      const res = await edgestore[bucket].upload({
        file,
        onProgressChange: async (p: number) => {
          setProgress(p);
          if (p === 100) {
            setProgress("COMPLETE");
          }
        },
      });

      setFileUrl(res.url);
      onChange(res.url); // ✅ تحديث الفورم بالرابط النهائي
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
        await edgestore[bucket].delete({ url: fileUrl });
      } catch (err) {
        console.error("فشل حذف الملف:", err);
      }
    }
    setFileUrl("");
    onChange(""); // ✅ تفريغ الفورم
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
          {fileUrl.endsWith(".mp4") || fileUrl.endsWith(".mov") ? (
            <video
              src={fileUrl}
              className="h-32 w-48 rounded-md object-cover"
              controls
            />
          ) : (
            <Image
              width={40}
              height={40}
              src={fileUrl}
              alt="Uploaded"
              className="h-20 w-20 rounded-md object-cover"
              unoptimized
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
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
