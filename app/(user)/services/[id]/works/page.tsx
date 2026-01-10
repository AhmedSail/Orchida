import { db } from "@/src";
import { digitalServices, works } from "@/src/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import WorkService from "@/components/user/service/workService";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { ArrowRight, PlayCircle } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "معرض الأعمال",
  description: "معرض أعمالنا",
};

export default async function ServiceWorksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch the specific service
  const service = await db
    .select()
    .from(digitalServices)
    .where(eq(digitalServices.id, id));

  if (!service[0]) {
    notFound();
  }

  const currentService = service[0];
  const isVideoService =
    currentService.name.includes("فيديو") ||
    currentService.name.includes("مونتاج") ||
    currentService.name.toLowerCase().includes("video");

  // 2. Fetch works for this service
  const serviceWorks = await db
    .select({
      id: works.id,
      title: works.title,
      description: works.description,
      category: works.category,
      duration: works.duration,
      serviceId: works.serviceId,
      projectUrl: works.projectUrl,
      priceRange: works.priceRange,
      tags: works.tags,
      toolsUsed: works.toolsUsed,
      isActive: works.isActive,
      imageUrl: works.imageUrl,
      type: works.type,
      createdAt: works.createdAt,
      updatedAt: works.updatedAt,
      deletedAt: works.deletedAt,
      uploadDate: works.uploadDate,
    })
    .from(works)
    .where(
      and(
        eq(works.serviceId, id),
        eq(works.isActive, true),
        isNull(works.deletedAt)
      )
    )
    .orderBy(works.createdAt);

  return (
    <div className="container mx-auto py-12 px-4" dir="rtl">
      {/* Navigation Back */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2 text-gray-500 hover:text-primary pl-0"
          asChild
        >
          <Link href="/services">
            <ArrowRight className="h-4 w-4" />
            العودة لجميع الخدمات
          </Link>
        </Button>
      </div>

      {/* Hero Section - Full Width Video/Image Style (Like Work Page Hero) */}
      <div className="relative h-[280px] sm:h-[400px] lg:h-[50vh] w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 border border-black/5">
        {/* Background Media */}
        <div className="absolute inset-0">
          {(currentService.largeImage || currentService.smallImage) &&
          (currentService.largeImage?.startsWith("http") ||
            currentService.smallImage?.startsWith("http")) ? (
            <Image
              src={currentService.largeImage || currentService.smallImage || ""}
              alt={currentService.name}
              fill // استخدمنا fill بدلاً من تحديد الأبعاد يدوياً لتملأ الحاوية h-[50vh]
              priority // لتسريع تحميل صورة الـ Hero
              className="object-cover w-full h-full"
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <span className="text-9xl opacity-10">✨</span>
            </div>
          )}
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Content Over Media */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-12 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider">
                  {serviceWorks.length} أعمال
                </span>
                {isVideoService && (
                  <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                    <PlayCircle className="w-3 h-3 inline mr-1" />
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-6xl font-black leading-tight drop-shadow-lg">
                {currentService.name}
              </h1>
              <p className="text-sm md:text-xl text-gray-200 line-clamp-1 md:line-clamp-3 leading-relaxed opacity-90 font-light">
                {currentService.description ||
                  "استكشف أحدث أعمالنا الإبداعية في هذا القسم."}
              </p>
            </div>

            <Button
              asChild
              size="sm"
              className="md:hidden bg-white text-black hover:bg-gray-100 hover:text-primary rounded-full px-6 py-4 font-bold text-sm shadow-xl transition-transform hover:scale-105"
            >
              <Link href="/serviceRequest">اطلب الآن</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="hidden md:flex bg-white text-black hover:bg-gray-100 hover:text-primary rounded-full px-8 py-6 font-bold text-lg shadow-xl transition-transform hover:scale-105"
            >
              <Link href="/serviceRequest">اطلب الخدمة الآن</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Works Section Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="h-8 w-1.5 bg-primary rounded-full"></div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          أحدث الأعمال المنجزة
        </h2>
      </div>

      <WorkService
        active={id}
        allWorks={serviceWorks}
        services={[currentService]}
      />
    </div>
  );
}
