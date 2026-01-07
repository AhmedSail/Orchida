"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Tag,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

export default function WorkPage({
  work,
  media,
}: {
  work: Work;
  media: MediaFile[];
}) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 1. Images
  // Include main image only if type is 'image'
  const allImages = [
    work.type === "image" ? work.imageUrl : null,
    ...media.filter((m) => m.type === "image").map((m) => m.url),
  ].filter(Boolean) as string[];

  // 2. Videos
  // Include main video only if type is 'video'
  const mainVideo =
    work.type === "video" && work.imageUrl
      ? { id: -1, url: work.imageUrl, type: "video" }
      : null;

  const galleryVideos = media.filter((m) => m.type === "video");
  const allVideos = [mainVideo, ...galleryVideos].filter(Boolean) as {
    id: number;
    url: string;
    type: string;
  }[];

  // 3. Documents / Others
  const allDocuments = media.filter(
    (m) => m.type !== "image" && m.type !== "video"
  );

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setSelectedImage(allImages[index]);
  };
  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };
  const prevImage = () => {
    const newIndex =
      (currentImageIndex - 1 + allImages.length) % allImages.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  const tagsArray = work.tags ? work.tags.split(",").map((t) => t.trim()) : [];

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background z-10" />
        {work.type === "image" && (
          <Image
            src={work.imageUrl || "/placeholder.jpg"}
            alt={work.title || "Work Image"}
            width={600}
            height={400}
            className="object-cover w-full"
            priority
            unoptimized
          />
        )}
        {work.type === "video" && (
          <video
            src={work.imageUrl || "/placeholder.mp4"}
            autoPlay
            muted
            loop
            className="object-cover w-full"
          />
        )}
        {/* Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="bg-background/80 backdrop-blur-md border-white/10 hover:bg-background/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            رجوع
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-32 relative z-20 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <Card className="bg-card/95 backdrop-blur-xl border-white/10 rounded-[2.5rem] shadow-2xl mb-12 p-8 md:p-12">
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-blue-500 to-purple-400">
                    {work.title}
                  </h1>
                  {work.type === "image" && (
                    <Image
                      src={work.imageUrl || "/placeholder.jpg"}
                      alt={work.title || "Work Image"}
                      width={600}
                      height={400}
                      className="object-cover h-[70vh] w-full"
                      priority
                      unoptimized
                    />
                  )}
                  {work.type === "video" && (
                    <video
                      src={work.imageUrl || "/placeholder.mp4"}
                      autoPlay
                      loop
                      controls
                      className="object-cover h-[70vh] w-full object-top"
                    />
                  )}
                  {/* Show main media content in header if desired, or relying on Hero */}

                  {/* Tags */}
                  {tagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tagsArray.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold border border-blue-500/20 uppercase tracking-wider"
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {new Date(work.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {work.projectUrl && (
                    <Button
                      asChild
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl"
                    >
                      <a
                        href={work.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        عرض المشروع
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              {work.description && (
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {work.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 1. Image Gallery */}
          {allImages.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <span className="w-12 h-1.5 bg-blue-600 rounded-full" />
                معرض الصور
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allImages.map((url, idx) => (
                  <Card
                    key={idx}
                    className="group cursor-pointer overflow-hidden bg-card/40 border-white/5 hover:border-blue-500/30 transition-all duration-300 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10"
                    onClick={() => openLightbox(idx)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={url}
                        alt={`${work.title} - Image ${idx + 1}`}
                        width={600}
                        height={400}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 2. Video Gallery */}
          {allVideos.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <span className="w-12 h-1.5 bg-blue-600 rounded-full" />
                مقاطع الفيديو
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allVideos.map((file) => (
                  <Card
                    key={file.id}
                    className="overflow-hidden bg-card/40 border-white/5 rounded-3xl shadow-xl"
                  >
                    <div className="relative aspect-video">
                      <video
                        src={file.url}
                        controls
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 3. Documents Gallery */}
          {allDocuments.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <span className="w-12 h-1.5 bg-blue-600 rounded-full" />
                الملفات والمستندات
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDocuments.map((file) => (
                  <Card
                    key={file.id}
                    className="group bg-card/40 border-white/5 hover:border-blue-500/30 transition-all duration-300 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 p-6 flex flex-col items-center justify-center text-center gap-4 py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1 break-all px-2">
                        {file.filename || "ملف مرفق"}
                      </h3>
                      <p className="text-sm text-muted-foreground uppercase">
                        {file.url.split(".").pop() || "FILE"}
                      </p>
                    </div>

                    {file.url.endsWith(".pdf") ? (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mt-2 gap-2"
                      >
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          فتح PDF
                        </a>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mt-2 gap-2"
                      >
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                          تحميل
                        </a>
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full w-12 h-12"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <X className="w-6 h-6" />
          </Button>

          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/10 rounded-full w-12 h-12"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/10 rounded-full w-12 h-12"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Full size"
              width={800}
              height={600}
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
