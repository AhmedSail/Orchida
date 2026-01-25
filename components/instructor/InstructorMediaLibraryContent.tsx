"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

interface MediaFile {
  key: string;
  url: string;
  name: string;
  type: "image" | "video" | "file";
  size: number;
  lastModified: string;
}

interface InstructorMediaLibraryContentProps {
  onSelect?: (file: {
    url: string;
    type: "image" | "video" | "file";
    name: string;
  }) => void;
  className?: string; // Allow custom styling wrapper
}

export default function InstructorMediaLibraryContent({
  onSelect,
  className,
}: InstructorMediaLibraryContentProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/r2-library");
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Failed to fetch library", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get Presigned URL
      const presignedRes = await fetch("/api/r2-library/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
        }),
      });

      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key, publicUrl } = await presignedRes.json();

      // Step 2: Direct Upload to R2 using XHR (to track progress)
      const uploadFile = () => {
        return new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader(
            "Content-Type",
            file.type || "application/octet-stream",
          );

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round(
                (event.loaded / event.total) * 100,
              );
              setUploadProgress(percentComplete);
            }
          };

          xhr.onload = () => {
            if (
              xhr.status === 200 ||
              xhr.status === 201 ||
              xhr.status === 204
            ) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Direct upload failed"));
          xhr.send(file);
        });
      };

      await uploadFile();

      // Step 3: Complete upload on server (save metadata to DB)
      let type: "image" | "video" | "file" = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";

      const completeRes = await fetch("/api/r2-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPresigned: true,
          key,
          url: publicUrl,
          name: file.name,
          type,
          size: file.size,
        }),
      });

      if (!completeRes.ok) throw new Error("Failed to save file metadata");
      const data = await completeRes.json();

      // Add to list immediately
      const newFile: MediaFile = {
        key: data.key,
        url: data.url,
        name: data.name,
        type: data.type,
        size: file.size,
        lastModified: new Date().toISOString(),
      };
      setFiles((prev) => [newFile, ...prev]);

      Swal.fire({
        icon: "success",
        title: "تم الرفع بنجاح",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error: any) {
      console.error("Upload process failed:", error);
      Swal.fire("خطأ", error.message || "فشل الرفع", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    try {
      const confirm = await Swal.fire({
        title: "هل أنت متأكد؟",
        text: "سيتم حذف الملف نهائياً",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#ef4444",
      });

      if (confirm.isConfirmed) {
        const res = await fetch("/api/r2-library", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });

        if (res.ok) {
          setFiles((prev) => prev.filter((f) => f.key !== key));
          Swal.fire("تم الحذف", "", "success");
        } else {
          Swal.fire("فشل الحذف", "", "error");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={`flex flex-col h-full ${className}`} dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            مكتبة المدرب
          </h2>
          <p className="text-sm text-slate-500 font-bold">
            إدارة وتنظيم كافة ملفاتك التعليمية
          </p>
        </div>
        <div className="relative">
          <Input
            placeholder="بحث في ملفاتك..."
            className="w-64 pl-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border-none font-medium text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-bold">جاري تحميل المكتبة...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Upload Card */}
            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-primary transition-all group flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleUpload}
                disabled={uploading}
              />
              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-3 w-full px-6 h-full">
                  <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between w-full px-1">
                    <span className="text-[10px] font-bold text-slate-400 animate-pulse">
                      {uploadProgress === 100
                        ? "جاري المعالجة..."
                        : "جاري الرفع..."}
                    </span>
                    <span className="text-[10px] font-black text-primary">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-800 group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-black text-slate-600 dark:text-zinc-400 group-hover:text-primary transition-colors">
                    رفع جديد
                  </p>
                </>
              )}
            </div>

            {filteredFiles.map((file) => (
              <motion.div
                key={file.key}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => {
                  if (onSelect) {
                    onSelect({
                      url: file.url,
                      type: file.type,
                      name: file.name,
                    });
                  }
                }}
              >
                {/* Preview */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-black/20">
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : file.type === "video" ? (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                      autoPlay
                      controls
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center w-full h-full bg-slate-100/50 dark:bg-zinc-900/50">
                      <div className="relative mb-2">
                        <FileText
                          className="w-14 h-14 text-slate-300 dark:text-zinc-700"
                          strokeWidth={1}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase text-slate-500 pt-3">
                          {file.name.split(".").pop()?.substring(0, 4) ||
                            "FILE"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold line-clamp-1 break-all w-full px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to Select
                      </p>
                    </div>
                  )}
                </div>

                {/* Overlay Info */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/80 to-transparent flex flex-col justify-end h-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold truncate mb-1">
                    {file.name}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/70">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-6 h-6 rounded-full opacity-80 hover:opacity-100"
                      onClick={(e) => handleDelete(e, file.key)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Top Badge */}
                <div className="absolute top-2 right-2">
                  {file.type === "video" && (
                    <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Video
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
