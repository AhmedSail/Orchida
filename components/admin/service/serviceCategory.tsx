"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Service } from "@/components/admin/service/servicesPage";

// ✅ استيراد مكونات الجدول من shadcn/ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ServicesCategoriesPage({
  services,
}: {
  services: Service[];
}) {
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);

  useEffect(() => {
    if (services.length > 0 && !activeCategory) {
      setActiveCategory(services[0].id);
    }
  }, [services, activeCategory]);

  useEffect(() => {
    if (!activeCategory) return;

    async function loadWorks() {
      setLoadingWorks(true);
      try {
        const res = await fetch(`/api/works?category=${activeCategory}`);
        const data = await res.json();
        setWorks(data);
      } catch (error) {
        console.error("Error loading works:", error);
      } finally {
        setLoadingWorks(false);
      }
    }

    loadWorks();
  }, [activeCategory]);

  const activeService = useMemo(
    () => services.find((s) => s.id === activeCategory),
    [services, activeCategory]
  );

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا العمل؟")) return;
    try {
      await fetch(`/api/works/${id}`, { method: "DELETE" });
      setWorks((prev) => prev.filter((work) => work.id !== id));
    } catch (error) {
      console.error("Error deleting work:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-primary gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="p-6 container mx-auto">
      {/* ✅ قائمة الفئات */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setActiveCategory(service.id)}
            className={`px-4 py-2 rounded-lg border transition 
              ${
                activeCategory === service.id
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {service.name}
          </button>
        ))}
      </div>

      {/* ✅ محتوى الفئة + الأعمال */}
      {activeService && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-primary">
              {activeService.name}
            </h2>

            <Button className="mb-4">
              <Link href={`/admin/teamWorks/addWork`}>إضافة عمل</Link>
            </Button>
          </div>

          <p className="text-gray-600 mb-6">{activeService.description}</p>

          {/* ✅ جدول الأعمال */}
          {loadingWorks ? (
            <p>جاري تحميل الأعمال...</p>
          ) : works.length === 0 ? (
            <p className="text-gray-500">لا يوجد أعمال لهذه الفئة.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الصورة</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell>
                      <Image
                        src={work.thumbnail}
                        alt={work.title}
                        width={100}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {work.title}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {work.description}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-start items-center place-content-center">
                      <Button variant="outline" size="sm">
                        <Link href={`/admin/teamWorks/editWork/${work.id}`}>
                          تعديل
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(work.id)}
                      >
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
