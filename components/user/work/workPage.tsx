"use client";

import React from "react";
import Image from "next/image";

// نوع للوسائط المرتبطة بالعمل
type MediaFile = {
  id: number;
  url: string;
  type: string; // image | video
  filename?: string | null;
  mimeType?: string | null;
  size?: number | null;
};
export type Work = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  projectUrl: string | null;
  priceRange: string | null;
  tags: string | null;
  duration: string | null;
  toolsUsed: string | null;
  isActive: boolean;
  imageUrl: string | null;
  type: string; // نوع العمل (مثلاً: image | video | design)
  serviceId: string;
  uploaderId: string;
  uploadDate: Date;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
const WorkPage = ({ work, media }: { work: Work; media: MediaFile[] }) => {
  return (
    <div
      className="max-w-5xl mx-auto mt-12 p-8 bg-white shadow-lg rounded-xl space-y-6"
      dir="rtl"
    >
      {/* العنوان */}
      {work.title && (
        <h1 className="text-4xl font-extrabold text-primary border-b pb-4">
          {work.title}
        </h1>
      )}
      {/* الصورة الرئيسية للعمل */}
      {work.imageUrl && (
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">
            الصورة الرئيسية
          </h2>
          <Image
            src={work.imageUrl}
            alt={work.title}
            width={800}
            height={500}
            className="rounded-lg object-cover w-full  shadow-md"
            unoptimized
          />
        </section>
      )}

      {/* الوصف */}
      {work.description && (
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-primary">
            وصف العمل
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            {work.description}
          </p>
        </div>
      )}

      {/* تفاصيل أساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
        {work.category && (
          <p>
            <span className="font-semibold text-gray-600">الفئة:</span>{" "}
            {work.category}
          </p>
        )}

        {work.duration && (
          <p>
            <span className="font-semibold text-gray-600">المدة:</span>{" "}
            {work.duration}
          </p>
        )}

        {work.toolsUsed && (
          <p>
            <span className="font-semibold text-gray-600">
              الأدوات المستخدمة:
            </span>{" "}
            {work.toolsUsed}
          </p>
        )}

        {work.tags && (
          <p>
            <span className="font-semibold text-gray-600">التاجات:</span>{" "}
            {work.tags}
          </p>
        )}

        {work.projectUrl && (
          <p>
            <span className="font-semibold text-gray-600">رابط المشروع:</span>{" "}
            <a
              href={work.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {work.projectUrl}
            </a>
          </p>
        )}
      </div>

      {/* الوسائط */}
      {media.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">وسائط العمل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {media.map((file) => {
              if (file.type === "image") {
                return (
                  <Image
                    key={file.id}
                    src={file.url}
                    alt={file.filename || work.title}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full h-[300px] shadow-md"
                    unoptimized
                  />
                );
              } else if (file.type === "video") {
                return (
                  <video
                    key={file.id}
                    src={file.url}
                    controls
                    className="rounded-lg w-full h-[300px] object-cover shadow-md"
                  />
                );
              } else if (
                file.url.match(/\.(pdf|docx?|pptx?|xlsx?)$/i) ||
                file.mimeType?.includes("pdf") ||
                file.mimeType?.includes("word") ||
                file.mimeType?.includes("presentation") ||
                file.mimeType?.includes("excel")
              ) {
                // ✅ مستندات
                return (
                  <div
                    key={file.id}
                    className="rounded-lg w-full h-[300px] flex flex-col items-center justify-center border shadow-md p-4 bg-gray-50"
                  >
                    <p className="font-semibold mb-2">
                      {file.filename || "ملف"}
                    </p>
                    {/* لو PDF نعرضه داخل iframe */}
                    {file.url.endsWith(".pdf") ? (
                      <iframe
                        src={file.url}
                        className="w-full h-full rounded-md"
                        title={file.filename || "PDF"}
                      />
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        تحميل الملف
                      </a>
                    )}
                  </div>
                );
              } else {
                // ✅ أي نوع آخر غير مدعوم → رابط تحميل
                return (
                  <div
                    key={file.id}
                    className="rounded-lg w-full h-[300px] flex items-center justify-center border shadow-md bg-gray-100"
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {file.filename || "تحميل الملف"}
                    </a>
                  </div>
                );
              }
            })}
          </div>
        </section>
      )}

      {/* معلومات إضافية */}
      <div className="text-sm text-gray-500 border-t pt-4">
        {work.createdAt && (
          <p>تاريخ الإنشاء: {new Date(work.createdAt).toLocaleDateString()}</p>
        )}
        {work.updatedAt && (
          <p>آخر تحديث: {new Date(work.updatedAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export default WorkPage;
