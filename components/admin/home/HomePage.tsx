"use client";
import ServiceTable, {
  ServiceRequest,
} from "@/components/attractor/serviceTable";
import LatestNews, { News } from "@/components/news/LatestNews";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface Props {
  stats?: {
    activeUsers: number;
    todayRequests: number;
    activeServices: number;
    endedServices: number;
    allServices: number;
  };
  data?: News[];
  serviceRequestsData?: ServiceRequest[];
  loading?: boolean; // نضيف حالة تحميل
}

const HomePage = ({ stats, data, serviceRequestsData, loading }: Props) => {
  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="md:flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">
          مرحبًا بكم في لوحة الإدارة
        </p>
      </header>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 shadow-sm shadow-primary space-y-2"
            >
              <Skeleton className="h-6 w-16" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-lg p-4 shadow-sm shadow-primary ">
              <h2 className="text-lg font-medium mb-2">المستخدمون النشطون</h2>
              <p className="text-2xl font-bold text-primary">
                {stats?.activeUsers}
              </p>
            </div>
            <div className="rounded-lg p-4 shadow-sm shadow-primary ">
              <h2 className="text-lg font-medium mb-2">
                الطلبات اليوم (دورات + خدمات)
              </h2>
              <p className="text-2xl font-bold text-primary">
                {stats?.todayRequests}
              </p>
            </div>
            <div className="rounded-lg p-4 shadow-sm shadow-primary ">
              <h2 className="text-lg font-medium mb-2">الخدمات النشطة</h2>
              <p className="text-2xl font-bold text-primary">
                {stats?.activeServices}
              </p>
            </div>
            <div className="rounded-lg p-4 shadow-sm shadow-primary ">
              <h2 className="text-lg font-medium mb-2">الخدمات المنتهية</h2>
              <p className="text-2xl font-bold text-primary">
                {stats?.endedServices}
              </p>
            </div>
            <div className="rounded-lg p-4 shadow-sm shadow-primary ">
              <h2 className="text-lg font-medium mb-2">مجموع الخدمات</h2>
              <p className="text-2xl font-bold text-primary">
                {stats?.allServices}
              </p>
            </div>
          </>
        )}
      </div>

      {/* News + Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-auto">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <LatestNews news={data || []} />
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <ServiceTable data={serviceRequestsData || []} role="admin" />
        )}
      </div>
    </div>
  );
};

export default HomePage;
