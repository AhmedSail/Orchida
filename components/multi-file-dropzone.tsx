"use client";

import { formatFileSize } from "@/src/components/upload/uploader-provider";
import { UploadCloudIcon, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useDropzone } from "react-dropzone";

export type FileState = {
  file: File;
  key: string;
  progress: "PENDING" | "COMPLETE" | "ERROR" | number;
  fileUrl?: string; // ✅ رابط الملف بعد الرفع
};

type MultiFileDropzoneProps = {
  value?: FileState[];
  onChange?: (files: FileState[]) => void;
  onFilesAdded?: (addedFiles: FileState[]) => void;
  onRemove?: (key: string) => void;
  disabled?: boolean;
  maxFiles?: number;
};

export function MultiFileDropzone({
  value,
  onChange,
  onFilesAdded,
  onRemove,
  disabled,
  maxFiles,
}: MultiFileDropzoneProps) {
  const [files, setFiles] = React.useState<FileState[]>(value ?? []);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileState[] = acceptedFiles.map((file) => ({
        file,
        key: Math.random().toString(36).slice(2),
        progress: "PENDING",
      }));

      if (onFilesAdded) {
        onFilesAdded(newFiles);
      }
      if (onChange) {
        onChange([...(value ?? []), ...newFiles]);
      }
      setFiles((prev) => [...(prev ?? []), ...newFiles]);
    },
    [value, onChange, onFilesAdded]
  );

  React.useEffect(() => {
    setFiles(value ?? []);
  }, [value]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled,
    maxFiles,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-gray-400"
      >
        <div className="space-y-1 text-center">
          <UploadCloudIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            اسحب وأفلت الملفات هنا، أو اضغط للاختيار
          </p>
        </div>
        <input {...getInputProps()} className="sr-only" />
      </div>

      <div className="mt-4 space-y-2">
        {files.map(({ file, key, progress }) => (
          <div
            key={key}
            className="relative flex items-center justify-between rounded-lg border p-2"
          >
            <div className="flex items-center gap-2">
              <div>
                {file.type.startsWith("image/") ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    width={40}
                    height={40}
                    className="h-20 w-20 rounded-md object-cover"
                    unoptimized
                  />
                ) : file.type.startsWith("video/") ? (
                  <video
                    src={URL.createObjectURL(file)}
                    className="h-32 w-48 rounded-md object-cover"
                    controls
                  />
                ) : file.type === "application/pdf" ? (
                  <div className="flex items-center gap-2">
                    <Image
                      width={40}
                      height={40}
                      src="/icons/pdf-icon.svg"
                      alt="PDF"
                      className="h-10 w-10 rounded-md object-cover"
                      unoptimized
                    />
                    <span className="text-sm text-gray-600">ملف PDF</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Image
                      width={40}
                      height={40}
                      src="/icons/file-icon.svg"
                      alt="File"
                      className="h-10 w-10 rounded-md object-cover"
                      unoptimized
                    />
                    <span className="text-sm text-gray-600">ملف عام</span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {typeof progress === "number" && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-200">
                <div
                  className="h-1 bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRemove) {
                  onRemove(key); // ✅ يحذف من EdgeStore + الواجهة + الفورم
                }
              }}
              className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
