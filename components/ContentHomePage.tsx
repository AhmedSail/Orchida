import { auth } from "@/lib/auth";
import { db } from "@/src";
import { news, sliders, users, works } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  LayoutDashboard,
  Newspaper,
  Layers,
  ArrowUpRight,
  Clock,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { News } from "./tableNews";
import { Work } from "./user/work/workPage";
import { Slider } from "./admin/slider/adminSlider";

const ContentCreatorHomePage = async ({
  activeSliders,
  recentWorks,
  recentNews,
  userName,
  userId,
  slidersData,
}: {
  activeSliders: number;
  recentWorks: Work[];
  recentNews: News[];
  userName: string | null;
  userId: string | null;
  slidersData: Slider[];
}) => {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 min-h-screen bg-[#fafafa]/50">
      {/* Header Section */}
      <header className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/90 to-primary p-10 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 opacity-90">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <LayoutDashboard className="size-6" />
            </div>
            <span className="text-sm font-semibold tracking-wider uppercase">
              نظام إدارة المحتوى
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
            مرحباً، {userName}
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl text-lg leading-relaxed font-medium">
            هذه لوحة التحكم الخاصة بك. يمكنك من هنا إدارة أعمال المعرض، نشر آخر
            الأخبار، واعداد صور العرض الرئيسية للموقع بكل سهولة.
          </p>
        </div>
        {/* Abstract Shapes Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 size-64 rounded-full bg-black/10 blur-2xl" />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="معرض الأعمال"
          value={recentWorks.length}
          label="عمل تم رفعه"
          icon={Briefcase}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatsCard
          title="الأخبار والمقالات"
          value={recentNews.length}
          label="خبر منشور"
          icon={Newspaper}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatsCard
          title="شرائح العرض (Slider)"
          value={activeSliders}
          label="شريحة نشطة"
          subValue={`من أصل ${slidersData.length}`}
          icon={Layers}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Works Section */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
          <CardHeader className="bg-white px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Briefcase className="size-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    آخر الأعمال المضافة
                  </CardTitle>
                  <CardDescription className="mt-1">
                    أحدث المشاريع التي تم رفعها للمعرض
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-blue-600"
                asChild
              >
                <Link href={`/content-creator/${userId}/works`}>
                  عرض الكل <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 grow">
            {recentWorks.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentWorks.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {work.type === "image" ? (
                        <Image
                          src={work.imageUrl ?? ""}
                          alt={work.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        work.type === "video" && (
                          <video
                            autoPlay
                            loop
                            muted
                            controls
                            src={work.imageUrl ?? ""}
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        )
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {work.title}
                      </h4>
                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {work.category}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant="outline"
                        className="bg-white hover:bg-white text-xs font-normal text-slate-500 border-slate-200"
                      >
                        {new Date(work.createdAt).toLocaleDateString("ar-EG")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Briefcase} text="لا توجد أعمال مضافة حالياً" />
            )}
          </CardContent>
        </Card>

        {/* Recent News Section */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
          <CardHeader className="bg-white px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Newspaper className="size-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    آخر الأخبار
                  </CardTitle>
                  <CardDescription className="mt-1">
                    أحدث المستجدات التي تم نشرها
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-amber-600"
                asChild
              >
                <Link href={`/content-creator/${userId}/news`}>
                  عرض الكل <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 grow">
            {recentNews.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentNews.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="relative size-12 shrink-0 rounded-full overflow-hidden bg-slate-100 border border-slate-200 mt-1">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Newspaper className="size-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <Clock className="size-3" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(
                            "ar-EG",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {item.isActive ? (
                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none shadow-none">
                          نشط
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-slate-500 bg-slate-100"
                        >
                          مسودة
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Newspaper} text="لا توجد أخبار منشورة حالياً" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
function StatsCard({
  title,
  value,
  label,
  subValue,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  label: string;
  subValue?: string;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <Card
      className={`border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start z-10 relative">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                {value}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {label}
              </span>
            </div>
            {subValue && (
              <p className="text-xs text-slate-400 mt-1">{subValue}</p>
            )}
          </div>
          <div
            className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
          >
            <Icon className="size-6" />
          </div>
        </div>
        <div
          className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-${
            color.split("-")[1]
          }-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
        />
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="p-4 bg-slate-50 rounded-full mb-3">
        <Icon className="size-8 opacity-50" />
      </div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

export default ContentCreatorHomePage;
