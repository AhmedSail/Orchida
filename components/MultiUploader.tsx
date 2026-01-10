"use client";

import { useEdgeStore } from "@/lib/edgestore";
import { useEffect, useState } from "react";
import { FileState, MultiFileDropzone } from "./multi-file-dropzone";
import Swal from "sweetalert2";

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
  const { edgestore } = useEdgeStore();
  useEffect(() => {
    // عند كل تغيير في قائمة الروابط المكتملة،
    // قم بإبلاغ الفورم الرئيسي (NewWorks) بالقائمة الجديدة.
    onChange(completedUrls);
  }, [completedUrls]);
  async function removeFile(key: string) {
    const fileToRemove = fileStates.find((f) => f.key === key);

    if (fileToRemove?.fileUrl) {
      try {
        const cleanUrl = fileToRemove.fileUrl.trim().replace(/\s/g, "");
        await edgestore.publicFiles.delete({ url: cleanUrl });
      } catch (err) {
        console.error("فشل حذف الملف من EdgeStore:", err);
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
                const res = await edgestore.publicFiles.upload({
                  file: addedFileState.file,
                  onProgressChange: async (progress: number) => {
                    updateFileProgress(addedFileState.key, progress);
                    if (progress === 100) {
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      updateFileProgress(addedFileState.key, "COMPLETE");
                    }
                  },
                });

                // تحديث حالة الملف بالرابط الجديد
                setFileStates((prev) =>
                  prev.map((f) =>
                    f.key === addedFileState.key
                      ? { ...f, fileUrl: res.url }
                      : f
                  )
                );

                // إضافة الرابط إلى قائمة المكتملة
                setCompletedUrls((prevUrls) => [...prevUrls, res.url]);
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
