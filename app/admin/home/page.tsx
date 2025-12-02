import LatestNews from "@/components/news/LatestNews";
import React from "react";

export default function AdminHomePage() {
  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">
          مرحبًا بكم في لوحة الإدارة
        </p>
      </header>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">المستخدمون النشطون</h2>
          <p className="text-2xl font-bold text-primary">1,234</p>
        </div>
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">
            الطلبات اليوم (دورات + خدمات)
          </h2>
          <p className="text-2xl font-bold text-primary">56</p>
        </div>
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">الدورات النشطة</h2>
          <p className="text-2xl font-bold text-primary">3</p>
        </div>
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">الدورات المنتهية</h2>
          <p className="text-2xl font-bold text-primary">5</p>
        </div>
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">مجموع الدورات</h2>
          <p className="text-2xl font-bold text-primary">5</p>
        </div>
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">الخدمات المتاحة</h2>
          <p className="text-2xl font-bold text-primary">5</p>
        </div>
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">الخدمات المنتهية</h2>
          <p className="text-2xl font-bold text-primary">5</p>
        </div>
        <div className="rounded-lg p-4 shadow-sm shadow-primary ">
          <h2 className="text-lg font-medium mb-2">مجموع الخدمات</h2>
          <p className="text-2xl font-bold text-primary">5</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-auto">
        <LatestNews />
      </div>
    </div>
  );
}
