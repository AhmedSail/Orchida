"use client";

import { useEffect, useState } from "react";
import { FileState, MultiFileDropzone } from "./multi-file-dropzone";
import Swal from "sweetalert2";

import { uploadFile } from "@/lib/multipart-upload";

type MultiUploaderProps = {
  bucket?: "publicFiles";
  onChange: (urls: string[]) => void;
  initialUrls?: string[];
  maxFiles?: number;
  required?: boolean;
};

export function MultiUploader({
  bucket,
  onChange,
  initialUrls = [],
  maxFiles,
  required = false,
}: MultiUploaderProps) {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [completedUrls, setCompletedUrls] = useState<string[]>(initialUrls);

  useEffect(() => {
    // عند كل تغيير في قائمة الروابط المكتملة،
    // قم بإبلاغ الفورم الرئيسي (NewWorks) بالقائمة الجديدة.
    onChange(completedUrls);
  }, [completedUrls]);

  async function removeFile(key: string) {
    const fileToRemove = fileStates.find((f) => f.key === key);

    if (fileToRemove?.fileUrl) {
      try {
        await fetch("/api/upload/r2", {
          method: "DELETE",
          body: JSON.stringify({ url: fileToRemove.fileUrl }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("فشل حذف الملف:", err);
      }
    }

    // تحديث حالة الواجهة
    const newFileStates = fileStates.filter((f) => f.key !== key);
    setFileStates(newFileStates);

    // تحديث قائمة الروابط المكتملة
    const newUrls = completedUrls.filter(
      (url) => url !== fileToRemove?.fileUrl
    );
    setCompletedUrls(newUrls);

    // تحديث الفورم فوراً بالقائمة الجديدة
    onChange(newUrls);
  }

  function updateFileProgress(key: string, progress: FileState["progress"]) {
    setFileStates((currentFileStates) => {
      const newFileStates = structuredClone(currentFileStates);
      const fileState = newFileStates.find((file) => file.key === key);
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }
  return (
    <div>
      <MultiFileDropzone
        value={fileStates}
        onRemove={removeFile}
        maxFiles={maxFiles}
        onFilesAdded={async (addedFiles: FileState[]) => {
          setFileStates((prev) => [...prev, ...addedFiles]);

          await Promise.all(
            addedFiles.map(async (addedFileState: FileState) => {
              try {
                const url = await uploadFile(
                  addedFileState.file,
                  (progress) => {
                    updateFileProgress(addedFileState.key, progress);
                  }
                );

                // تحديث حالة الملف بالرابط الجديد
                setFileStates((prev) =>
                  prev.map((f) =>
                    f.key === addedFileState.key
                      ? { ...f, fileUrl: url } // url is already the string
                      : f
                  )
                );

                updateFileProgress(addedFileState.key, "COMPLETE");

                // إضافة الرابط إلى قائمة المكتملة
                setCompletedUrls((prevUrls) => [...prevUrls, url]);
              } catch (err) {
                updateFileProgress(addedFileState.key, "ERROR");
                Swal.fire({
                  icon: "error",
                  title: "خطأ في رفع الملف",
                  text: "تعذر رفع الملف، حاول مرة أخرى.",
                });
              }
            })
          );
        }}
      />
    </div>
  );
}
