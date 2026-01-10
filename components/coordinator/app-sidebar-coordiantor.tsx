"use client";

import React, { useState } from "react";
import {
  Home,
  List,
  PlayCircle,
  Clock,
  CheckCircle,
  Lock,
  Loader,
  GraduationCap,
  XCircle,
  Video,
  ChevronDown,
  LayoutGrid,
  User as UserIcon,
  LogOut,
  AppWindow,
  Users2,
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
import { FaGraduationCap } from "react-icons/fa";
import { User } from "../admin/instructor/NewInstructorForm";
import { cn } from "@/lib/utils";

export function AppSidebarCoordinator({ user }: { user: User }) {
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const menuItems = [
    {
      title: "الرئيسية",
      icon: Home,
      url: `/coordinator/${user.id}/home`,
    },
    {
      title: "إدارة المهتمين (Leads)",
      icon: Users2,
      url: `/coordinator/${user.id}/leads`,
    },
    {
      title: "الدورات المتاحة",
      icon: FaGraduationCap,
      url: `/coordinator/${user.id}/courses`,
    },
    {
      title: "جدول اللقاءات",
      icon: Video,
      url: `/coordinator/${user.id}/courses/sections/meetings`,
    },
  ];

  const sectionLinks = [
    {
      label: "كل الشعب",
      url: `/coordinator/${user.id}/courses/sections`,
      icon: List,
    },
    {
      label: "الشعب النشطة",
      url: `/coordinator/${user.id}/courses/sections/openSection`,
      icon: PlayCircle,
    },
    {
      label: "بانتظار الموافقة",
      url: `/coordinator/${user.id}/courses/sections/pending_approval_section`,
      icon: Clock,
    },
    {
      label: "شعب مغلقة",
      url: `/coordinator/${user.id}/courses/sections/closedSection`,
      icon: Lock,
    },
    {
      label: "قيد التنفيذ",
      url: `/coordinator/${user.id}/courses/sections/in_progress_section`,
      icon: Loader,
    },
    {
      label: "شعب مكتملة",
      url: `/coordinator/${user.id}/courses/sections/completed_section`,
      icon: GraduationCap,
    },
    {
      label: "شعب ملغاة",
      url: `/coordinator/${user.id}/courses/sections/cancelled_section`,
      icon: XCircle,
    },
  ];

  const NavItem = ({ item }: { item: any }) => (
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

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            نظام المنسق
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}

            {/* إدارة الشعب - منسدلة بشكل أنيق */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSectionsOpen(!sectionsOpen)}
                className={cn(
                  "group h-11 px-4 flex justify-between items-center transition-all duration-300 active:scale-[0.98]",
                  sectionsOpen ? "bg-slate-50" : "hover:bg-slate-50/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid
                    className={cn(
                      "size-5 transition-colors",
                      sectionsOpen
                        ? "text-primary"
                        : "text-slate-500 group-hover:text-primary"
                    )}
                  />
                  <span
                    className={cn(
                      "font-bold transition-colors",
                      sectionsOpen
                        ? "text-slate-900"
                        : "text-slate-700 group-hover:text-slate-900"
                    )}
                  >
                    إدارة الشعب
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-slate-400 transition-transform duration-300",
                    sectionsOpen && "rotate-180"
                  )}
                />
              </SidebarMenuButton>

              <AnimatePresence>
                {sectionsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mr-6 mt-1 border-r-2 border-slate-100"
                  >
                    <div className="flex flex-col gap-1 py-1 pr-4">
                      {sectionLinks.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.url}
                          className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5 transition-all group/sub"
                        >
                          <sub.icon className="size-3.5 text-slate-400 group-hover/sub:text-primary transition-colors" />
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
              منسق أكاديمي
            </span>
          </div>
          <button className="mr-auto size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"></button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
