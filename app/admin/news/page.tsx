"use client";
import LatestNews from "@/components/news/LatestNews";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

const LatestNewsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const newNews = () => {
    setLoading(true); // إظهار السبينر
    setTimeout(() => {
      router.push("/admin/news/newNews");
    }, 500); // نصف ثانية كافية لعرض السبينر
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary mb-6">أحدث المستجدات</h1>
        <Button
          className="bg-primary text-white disabled:opacity-50 flex items-center gap-2"
          onClick={newNews}
          disabled={loading} // ✅ تعطيل الزر أثناء التحميل
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
            </>
          ) : (
            "إضافة خبر جديد"
          )}
        </Button>
      </div>
      <LatestNews />
    </>
  );
};

export default LatestNewsPage;
