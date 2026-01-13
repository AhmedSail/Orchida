import { db } from "@/src";
import { digitalServices, works } from "@/src/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import WorkService from "@/components/user/service/workService";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import { ArrowRight, PlayCircle, BookOpen, Layers } from "lucide-react";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const service = await db
    .select({ name: digitalServices.name })
    .from(digitalServices)
    .where(eq(digitalServices.id, id))
    .limit(1);

  if (!service[0]) {
    return {
      title: "معرض الأعمال",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://orchida-ods.com";

  return {
    title: `معرض أعمال ${service[0].name}`,
    description: `استكشف أحدث أعمالنا في مجال ${service[0].name}.`,
    alternates: {
      canonical: `${baseUrl}/services/${id}/works`,
    },
    openGraph: {
      title: `معرض أعمال ${service[0].name}`,
      description: `استكشف أحدث أعمالنا في مجال ${service[0].name}.`,
      url: `${baseUrl}/services/${id}/works`,
    },
  };
}

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
    <div className="min-h-screen py-12" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Navigation Back */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="gap-2 text-gray-500 hover:text-primary pl-0 hover:bg-transparent"
            asChild
          >
            <Link href="/services">
              <ArrowRight className="h-4 w-4" />
              العودة لجميع الخدمات
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Image */}
            <div className="relative aspect-[16/6.6] w-full rounded-2xl overflow-hidden shadow-lg group">
              {currentService.largeImage &&
              currentService.largeImage.startsWith("http") ? (
                <Image
                  src={currentService.largeImage}
                  alt={currentService.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <BookOpen size={64} className="text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <h1 className="absolute bottom-6 right-6 text-2xl md:text-4xl font-bold text-white shadow-sm leading-tight">
                {currentService.name}
              </h1>
            </div>

            {/* Works Gallery Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="bg-primary rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  معرض الأعمال
                </h2>
              </div>
              <WorkService
                active={id}
                allWorks={serviceWorks}
                services={[currentService]}
              />
            </div>
          </div>

          {/* Sidebar / Sticky Action Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-action border border-primary/10">
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Layers className="text-primary" size={20} />
                      </div>
                      عدد الأعمال
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {serviceWorks.length}
                    </span>
                  </div>

                  {isVideoService && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3 text-purple-700 font-medium">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <PlayCircle className="text-purple-600" size={20} />
                        </div>
                        نوع الخدمة
                      </div>
                      <span className="text-sm font-bold bg-white px-3 py-1 rounded-full text-purple-700 shadow-sm">
                        فيديو
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  asChild
                  className="w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 text-white shadow-primary/25 hover:scale-[1.02]"
                >
                  <Link
                    href="/serviceRequest"
                    className="flex items-center justify-center gap-2"
                  >
                    اطلب الخدمة الآن
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
