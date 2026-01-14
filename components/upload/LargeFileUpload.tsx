"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  uploadLargeFile,
  shouldUseMultipartUpload,
} from "@/lib/multipart-upload";
import { uploadToR2 } from "@/lib/r2-client";

interface LargeFileUploadProps {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function LargeFileUpload({
  onUploadComplete,
  onUploadError,
  accept = "video/*,image/*",
  maxSizeMB = 2048, // 2GB default
  className,
}: LargeFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadInfo, setUploadInfo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // فحص حجم الملف
    const maxSize = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setErrorMessage(`حجم الملف يتجاوز الحد الأقصى ${maxSizeMB}MB`);
      setUploadStatus("error");
      onUploadError?.(`حجم الملف يتجاوز الحد الأقصى ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    setUploadStatus("idle");
    setErrorMessage("");
    setUploadInfo("");
    setProgress(0);
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus("uploading");
    setProgress(0);

    // إنشاء AbortController للتحكم في الإلغاء
    abortControllerRef.current = new AbortController();

    try {
      let url: string;

      if (shouldUseMultipartUpload(file)) {
        // استخدام الرفع المجزأ للملفات الكبيرة
        setUploadInfo("يتم رفع الملف على أجزاء...");
        url = await uploadLargeFile(file, {
          onProgress: (progress) => {
            setProgress(progress.percentage);
            setUploadInfo(
              `جاري رفع الجزء ${progress.currentPart} من ${progress.totalParts}`
            );
          },
          onPartComplete: (partNumber, totalParts) => {
            console.log(`Part ${partNumber}/${totalParts} completed`);
          },
          signal: abortControllerRef.current.signal,
        });
      } else {
        // استخدام الرفع العادي للملفات الصغيرة
        url = await uploadToR2(file, (progress) => {
          setProgress(progress);
        });
      }

      setUploadStatus("success");
      setProgress(100);
      setUploadInfo("");
      onUploadComplete?.(url);
    } catch (error: any) {
      if (error.name === "AbortError" || error.message === "Upload aborted") {
        setErrorMessage("تم إلغاء الرفع");
      } else {
        setErrorMessage(error.message || "حدث خطأ غير متوقع");
      }
      setUploadStatus("error");
      onUploadError?.(error.message || "حدث خطأ غير متوقع");
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setUploadStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* File Input */}
      {!file && (
        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:border-primary transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="large-file-upload"
          />
          <label
            htmlFor="large-file-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="size-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                اضغط لاختيار ملف
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                الحد الأقصى:{" "}
                {maxSizeMB >= 1024 ? `${maxSizeMB / 1024}GB` : `${maxSizeMB}MB`}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* File Preview & Upload */}
      {file && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold text-zinc-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
            {uploadStatus !== "uploading" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetUpload}
                className="shrink-0"
              >
                <X className="size-5" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {uploadStatus === "uploading" && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {uploadInfo || "جاري الرفع..."}
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <Button
                variant="destructive"
                size="sm"
                onClick={cancelUpload}
                className="w-full"
              >
                <X className="size-4 ml-2" />
                إلغاء الرفع
              </Button>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === "success" && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl">
              <CheckCircle2 className="size-5" />
              <span className="font-bold">تم الرفع بنجاح!</span>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl">
              <AlertCircle className="size-5" />
              <span className="font-bold">{errorMessage}</span>
            </div>
          )}

          {/* Upload Button */}
          {uploadStatus === "idle" && (
            <Button
              onClick={uploadFile}
              className="w-full h-12 rounded-xl font-bold"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-5 animate-spin ml-2" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="size-5 ml-2" />
                  رفع الملف
                </>
              )}
            </Button>
          )}

          {uploadStatus === "success" && (
            <Button
              onClick={resetUpload}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold"
            >
              رفع ملف آخر
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
