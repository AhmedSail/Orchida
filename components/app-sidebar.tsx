"use client";

import React, { useState } from "react";
import {
  Home,
  Inbox,
  Settings,
  ChevronDown,
  Users,
  Calendar,
  Image as ImageIcon,
  GraduationCap,
  LayoutGrid,
  PlusCircle,
  Activity,
  CheckCircle2,
  Clock,
  Ban,
  Briefcase,
  Info,
  Layers,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "./admin/instructor/NewInstructorForm";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

export function AppSidebar({ user }: { user: User }) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    services: false,
    courses: false,
    sections: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    {
      title: "الرئيسية",
      icon: Home,
      url: `/admin/${user.id}/home`,
    },
    {
      title: "أحدث المستجدات",
      icon: Inbox,
      url: `/admin/${user.id}/news`,
    },
    {
      title: "تحكم بالسلايدر",
      icon: ImageIcon,
      url: `/admin/${user.id}/slider`,
    },
    {
      title: "الموظفون",
      icon: Users,
      url: `/admin/${user.id}/employees`,
    },
  ];

  const NavItem = ({ item }: { item: (typeof menuItems)[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="group h-11 px-4 transition-all duration-300 hover:bg-primary/5 active:scale-95"
      >
        <Link href={item.url} className="flex items-center gap-3 w-full">
          <item.icon className="size-5 text-slate-500 group-hover:text-primary transition-colors" />
          <span className="font-semibold text-slate-700 group-hover:text-slate-900">
            {item.title}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar dir="rtl" className="border-l border-slate-200">
      <SidebarHeader className="p-6 border-b border-slate-100 flex flex-col items-center">
        <Link
          href="/"
          className="transition-transform hover:scale-105 duration-300"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={140}
            height={40}
            className="h-32 w-auto"
            unoptimized
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 scrollbar-thin scrollbar-thumb-slate-200">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            نظرة عامة
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* الخدمات الرقمية */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            الأعمال والخدمات
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => toggleMenu("services")}
                className={cn(
                  "group h-11 px-4 flex justify-between items-center transition-all duration-300 active:scale-[0.98]",
                  openMenus.services ? "bg-slate-50" : "hover:bg-slate-50/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Layers
                    className={cn(
                      "size-5 transition-colors",
                      openMenus.services
                        ? "text-primary"
                        : "text-slate-500 group-hover:text-primary"
                    )}
                  />
                  <span
                    className={cn(
                      "font-bold transition-colors",
                      openMenus.services
                        ? "text-slate-900"
                        : "text-slate-700 group-hover:text-slate-900"
                    )}
                  >
                    الخدمات الرقمية
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-slate-400 transition-transform duration-300",
                    openMenus.services && "rotate-180"
                  )}
                />
              </SidebarMenuButton>

              <AnimatePresence>
                {openMenus.services && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden mr-6 mt-1 border-r-2 border-slate-100"
                  >
                    <div className="flex flex-col gap-1 py-2 pr-4">
                      {[
                        {
                          label: "جميع الخدمات",
                          url: `/admin/${user.id}/services`,
                          icon: Briefcase,
                        },
                        {
                          label: "إضافة خدمة",
                          url: `/admin/${user.id}/services/add`,
                          icon: PlusCircle,
                        },
                        {
                          label: "الخدمات الفعّالة",
                          url: `/admin/${user.id}/services/in-progress`,
                          icon: Activity,
                        },
                        {
                          label: "الخدمات المنتهية",
                          url: `/admin/${user.id}/services/completed`,
                          icon: CheckCircle2,
                        },
                        {
                          label: "الخدمات المعلقة",
                          url: `/admin/${user.id}/services/pending-services`,
                          icon: Clock,
                        },
                        {
                          label: "غير متفق عليها",
                          url: `/admin/${user.id}/services/cancelled`,
                          icon: Ban,
                        },
                        {
                          label: "معرض الأعمال",
                          url: `/admin/${user.id}/works`,
                          icon: LayoutGrid,
                        },
                      ].map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.url}
                          className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5 transition-all group/sub"
                        >
                          <sub.icon className="size-3.5 opacity-0 group-hover/sub:opacity-100 transition-opacity -mr-4 group-hover/sub:mr-0" />
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* الدورات التعليمية */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            الأكاديمية
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => toggleMenu("courses")}
                className={cn(
                  "group h-11 px-4 flex justify-between items-center transition-all duration-300 active:scale-[0.98]",
                  openMenus.courses ? "bg-slate-50" : "hover:bg-slate-50/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap
                    className={cn(
                      "size-5 transition-colors",
                      openMenus.courses
                        ? "text-primary"
                        : "text-slate-500 group-hover:text-primary"
                    )}
                  />
                  <span
                    className={cn(
                      "font-bold transition-colors",
                      openMenus.courses
                        ? "text-slate-900"
                        : "text-slate-700 group-hover:text-slate-900"
                    )}
                  >
                    الدورات التعليمية
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-slate-400 transition-transform duration-300",
                    openMenus.courses && "rotate-180"
                  )}
                />
              </SidebarMenuButton>

              <AnimatePresence>
                {openMenus.courses && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mr-6 mt-1 border-r-2 border-slate-100"
                  >
                    <div className="flex flex-col gap-1 py-1 pr-4">
                      <Link
                        href={`/admin/${user.id}/courses`}
                        className="text-sm py-2.5 px-3 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        دوراتنا المتوفرة
                      </Link>

                      <Link
                        href={`/admin/${user.id}/courses/sections/meetings`}
                        className="text-sm py-2.5 px-3 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        جدول اللقاءات
                      </Link>

                      {/* الشعب المنسدلة داخل الدورات */}
                      <button
                        onClick={() => toggleMenu("sections")}
                        className="flex items-center justify-between text-sm py-2.5 px-3 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5 transition-all w-full text-right"
                      >
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="size-4" />
                          <span>إدارة الشعب</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "size-3 transition-transform",
                            openMenus.sections && "rotate-180"
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {openMenus.sections && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mr-4 mt-1 border-r border-slate-200"
                          >
                            <div className="flex flex-col gap-1 py-1 pr-3">
                              {[
                                {
                                  label: "شعب نشطة",
                                  url: `/admin/${user.id}/courses/sections/openSection`,
                                },
                                {
                                  label: "في انتظار الموافقة",
                                  url: `/admin/${user.id}/courses/sections/pending_approval_section`,
                                },
                                {
                                  label: "شعب مغلقة",
                                  url: `/admin/${user.id}/courses/sections/closedSection`,
                                },
                                {
                                  label: "قيد التنفيذ",
                                  url: `/admin/${user.id}/courses/sections/in_progress_section`,
                                },
                                {
                                  label: "شعب مكتملة",
                                  url: `/admin/${user.id}/courses/sections/completedSection`,
                                },
                                {
                                  label: "شعب ملغاة",
                                  url: `/admin/${user.id}/courses/sections/cancelledSection`,
                                },
                              ].map((sec) => (
                                <Link
                                  key={sec.label}
                                  href={sec.url}
                                  className="text-[13px] py-1.5 px-3 rounded-md text-slate-500 hover:text-primary transition-all whitespace-nowrap"
                                >
                                  - {sec.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Link
                        href={`/admin/${user.id}/instructor`}
                        className="text-sm py-2.5 px-3 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        إدارة المدربين
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* الإعدادات والبيانات */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            المنصة
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="group h-11 px-4 transition-all duration-300 hover:bg-primary/5"
              >
                <Link
                  href={`/admin/${user.id}/info`}
                  className="flex items-center gap-3 w-full"
                >
                  <Info className="size-5 text-slate-500 group-hover:text-primary transition-colors" />
                  <span className="font-semibold text-slate-700 group-hover:text-slate-900">
                    بيانات الشركة
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="group h-11 px-4 transition-all duration-300 hover:bg-primary/5"
              >
                <Link
                  href={`/admin/${user.id}/users`}
                  className="flex items-center gap-3 w-full"
                >
                  <Settings className="size-5 text-slate-500 group-hover:text-primary transition-colors" />
                  <span className="font-semibold text-slate-700 group-hover:text-slate-900">
                    الصلاحيات والحسابات
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-2xl">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <UserIcon className="size-6" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-black text-slate-800 truncate">
              {user.name}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              مدير النظام
            </span>
          </div>
          <button className="mr-auto size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"></button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
