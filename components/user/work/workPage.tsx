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
import { motion } from "framer-motion";
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
  const allImages = [
    work.type === "image" ? work.imageUrl : null,
    ...media.filter((m) => m.type === "image").map((m) => m.url),
  ].filter(Boolean) as string[];

  // 2. Videos
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

  // 3. Documents
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
  const toolsArray = work.toolsUsed
    ? work.toolsUsed.split(",").map((t) => t.trim())
    : [];

  return (
    <div dir="rtl" className="min-h-screen">
      {/* Hero Section - A Cinematic Backdrop */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-white dark:to-zinc-950 z-10" />

        {work.type === "image" && work.imageUrl && (
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            className="object-cover w-full h-full scale-105 blur-[2px] opacity-60"
            priority
            sizes="100vw"
          />
        )}
        {work.type === "video" && work.imageUrl && (
          <video
            src={work.imageUrl}
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover blur-[2px] opacity-40"
          />
        )}

        {/* Back Button Floating */}
        <div className="absolute top-10 right-10 z-30">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white rounded-full px-6 py-6 shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            <span className="font-bold">رجوع</span>
          </Button>
        </div>

        {/* Hero Title Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20 px-6">
          <div className="text-center space-y-4 max-w-4xl">
            <h1 className="text-5xl md:text-8xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-tight">
              {work.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-white/80 font-medium">
              <span className="bg-primary/80 backdrop-blur-md px-4 py-1 rounded-full text-sm">
                {work.category}
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(work.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 -mt-32 relative z-20 pb-24">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Main Info Card */}
          <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-white/40 dark:border-white/10 rounded-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Left Column: Media Showcase */}
                <div className="lg:col-span-7 bg-black flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
                  {work.type === "video" ? (
                    <video
                      src={work.imageUrl || ""}
                      controls
                      className="w-full h-full max-h-[600px] object-contain"
                    />
                  ) : (
                    <div className="relative w-full h-full lg:h-[600px] group">
                      <Image
                        src={work.imageUrl || "/placeholder.jpg"}
                        alt={work.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          onClick={() => openLightbox(0)}
                          variant="secondary"
                          className="rounded-full px-8 py-6 font-bold shadow-2xl"
                        >
                          توسيع الصورة
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Details & Description */}
                <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em]">
                        عن المعرض
                      </h2>
                      <p className="text-xl md:text-2xl leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                        {work.description ||
                          "لا يوجد وصف متاح لهذا العمل حالياً."}
                      </p>
                    </div>

                    {/* Metadata Icons Grid */}
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Tag className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            الوسوم
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tagsArray.map((tag, i) => (
                            <span
                              key={i}
                              className="text-sm font-bold text-zinc-800 dark:text-zinc-100"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {work.duration && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              المدة
                            </span>
                          </div>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                            {work.duration}
                          </p>
                        </div>
                      )}

                      {toolsArray.length > 0 && (
                        <div className="col-span-2 space-y-1">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              الأدوات المستخدمة
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {toolsArray.map((tool, i) => (
                              <div
                                key={i}
                                className="bg-stone-100 dark:bg-zinc-800 px-3 py-1 rounded-lg text-xs font-bold"
                              >
                                {tool}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-10">
                    {work.projectUrl && (
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="w-full rounded-2xl py-8 text-lg font-bold shadow-xl transition-all hover:scale-[1.02]"
                      >
                        <a
                          href={work.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3"
                        >
                          <ExternalLink className="w-5 h-5" />
                          زيارة رابط المشروع
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Galleries Section */}
          <div className="space-y-24">
            {/* Image Gallery */}
            {allImages.length > 0 && (
              <section className="space-y-10">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-2 bg-primary rounded-full" />
                    <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                      معرض الصور
                    </h2>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium mr-5">
                    مجموعة من اللقطات التفصيلية لهذا العمل
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allImages.map((url, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="group relative aspect-square md:aspect-video rounded-4xl overflow-hidden shadow-2xl cursor-pointer bg-white dark:bg-zinc-900 border border-white/20"
                      onClick={() => openLightbox(idx)}
                    >
                      <Image
                        src={url}
                        alt={`${work.title} - ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                          الصورة الرئيسية
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Video Gallery */}
            {allVideos.length > 0 && (
              <section className="space-y-10">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-2 bg-primary rounded-full" />
                    <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                      مقاطع الفيديو
                    </h2>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium mr-5">
                    استعرض المحتوى المرئي المسجل
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {allVideos.map((file, idx) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="overflow-hidden bg-black rounded-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-none group"
                    >
                      <div className="relative aspect-video">
                        <video
                          src={file.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                        {file.id === -1 && (
                          <div className="absolute top-4 right-4 bg-primary backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-10">
                            الفيديو الرئيسي
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Documents Gallery */}
            {allDocuments.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-2 bg-emerald-500 rounded-full" />
                  <h2 className="text-4xl font-black tracking-tight">
                    المرفقات والمستندات
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {allDocuments.map((file) => (
                    <Card
                      key={file.id}
                      className="group bg-white dark:bg-zinc-900 border-none rounded-4xl shadow-xl p-8 hover:shadow-2xl transition-all hover:bg-stone-50"
                    >
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <FileText className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-lg mb-1 line-clamp-1 truncate w-48">
                            {file.filename || "مستند"}
                          </h3>
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                            {file.url.split(".").pop()}
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full rounded-xl py-6 font-bold gap-2"
                        >
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.url.endsWith(".pdf") ? (
                              <>
                                <ExternalLink className="w-4 h-4" />
                                معاينة
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                تحميل
                              </>
                            )}
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Modern Lightbox Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/98 z-100 flex items-center justify-center animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <div className="absolute top-8 right-8 z-110">
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-white/10 hover:bg-white/20 rounded-full w-14 h-14"
              onClick={closeLightbox}
            >
              <X className="w-8 h-8" />
            </Button>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  className="absolute left-8 z-110 text-white bg-white/5 hover:bg-white/20 rounded-full w-16 h-16"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-10 h-10" />
                </Button>
                <Button
                  variant="ghost"
                  className="absolute right-8 z-110 text-white bg-white/5 hover:bg-white/20 rounded-full w-16 h-16"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-10 h-10" />
                </Button>
              </>
            )}

            <div className="relative max-w-7xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden">
              <Image
                src={selectedImage}
                alt="Fullscreen view"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white font-black text-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
