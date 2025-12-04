"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// تعريف نوع البيانات (اختياري)
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  imageUrl?: string;
  eventType: string;
  isActive: boolean; // ✅ جديد
}

const LatestNews = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const data = await res.json();
        setNewsData(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);
  const eventTypeMap: Record<string, string> = {
    news: "خبر",
    announcement: "إعلان",
    article: "مقال",
    event: "فعالية",
    update: "تحديث",
    blog: "مدونة",
    pressRelease: "بيان صحفي",
    promotion: "عرض ترويجي",
    alert: "تنبيه",
  };
  const deleteNews = async (id: string) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع هذا الخبر بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/news/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setNewsData((prev) => prev.filter((item) => item.id !== id));
          Swal.fire("تم الحذف ✅", "تم حذف الخبر بنجاح", "success");
        } else {
          Swal.fire("خطأ ❌", "فشل في حذف الخبر", "error");
        }
      }
    });
  };

  return (
    <div className="p-6">
      {loading ? (
        <p className="text-center text-muted-foreground">
          جاري تحميل الأخبار...
        </p>
      ) : (
        <Table className="w-full text-center border">
          <TableCaption>آخر الأخبار والتحديثات</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] text-center">الصورة</TableHead>
              <TableHead className="text-center">العنوان</TableHead>
              <TableHead className="text-center">الملخص</TableHead>
              <TableHead className="text-center">نوع الحدث</TableHead>
              <TableHead className="text-center">تاريخ النشر</TableHead>
              <TableHead className="text-center">الحالة</TableHead>{" "}
              {/* ✅ جديد */}
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {newsData.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="rounded-md object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-md mx-auto" />
                  )}
                </TableCell>
                <TableCell className="font-semibold">{item.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.summary}
                </TableCell>
                <TableCell className="text-sm">
                  {eventTypeMap[item.eventType] || item.eventType}
                </TableCell>
                <TableCell className="text-sm">
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString("ar-EG")
                    : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {item.isActive ? "نشط ✅" : "غير نشط ❌"}{" "}
                  {/* ✅ عرض الحالة */}
                </TableCell>
                <TableCell className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/news/edit/${item.id}`)}
                    className="cursor-pointer"
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteNews(item.id)}
                    className="cursor-pointer"
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
  );
};

export default LatestNews;
