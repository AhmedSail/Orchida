import React from "react";
import LeadsManagement from "@/components/admin/leads/LeadsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارة المهتمين | لوحة منشئ المحتوى",
  description: "لوحة منشئ المحتوى | إدارة طلبات التسجيل السريع والمهتمين",
};

const Page = () => {
  return (
    <div className="p-4 md:p-8">
      <LeadsManagement />
    </div>
  );
};

export default Page;
