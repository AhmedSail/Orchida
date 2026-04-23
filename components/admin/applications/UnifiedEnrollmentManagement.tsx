"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationsManagement from "./ApplicationsManagement";
import EnrollmentsManagement from "./EnrollmentsManagement";
import { Layers, Users, Sparkles } from "lucide-react";

const UnifiedEnrollmentManagement = () => {
  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          إدارة التسجيل والالتحاق
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </h1>
        <p className="text-zinc-500 font-bold text-lg">
          تحكم بالطلبات الجديدة والطلاب المسجلين في مكان واحد
        </p>
      </div>

      <Tabs defaultValue="applications" className="w-full space-y-6">
        <TabsList className="bg-zinc-100/50 p-1.5 rounded-2xl h-16 w-full max-w-md border border-zinc-200/50">
          <TabsTrigger 
            value="applications" 
            className="rounded-xl font-black text-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300"
          >
            <Layers className="w-5 h-5" />
            طلبات الالتحاق
          </TabsTrigger>
          <TabsTrigger 
            value="enrollments" 
            className="rounded-xl font-black text-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300"
          >
            <Users className="w-5 h-5" />
            المسجلون فعلياً
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="focus-visible:outline-none focus-visible:ring-0">
          <ApplicationsManagement />
        </TabsContent>
        
        <TabsContent value="enrollments" className="focus-visible:outline-none focus-visible:ring-0">
          <EnrollmentsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedEnrollmentManagement;
