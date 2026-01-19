"use client";

import React from "react";
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  LogOut,
  User as UserIcon,
  GraduationCap,
  FolderOpen,
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
import { User } from "../admin/instructor/NewInstructorForm";

export function AppSidebarInstructor({ user }: { user: User }) {
  const menuItems = [
    {
      title: "الرئيسية",
      icon: Home,
      url: `/instructor/${user.id}/home`,
    },
    {
      title: "المقررات الدراسية",
      icon: BookOpen,
      url: `/instructor/${user.id}/courses`,
    },
    {
      title: "الجدول الزمني",
      icon: Calendar,
      url: `/instructor/${user.id}/celender`,
    },
    {
      title: "الطلاب",
      icon: Users,
      url: `/instructor/${user.id}/students`,
    },
    {
      title: "مكتبة الوسائط",
      icon: FolderOpen,
      url: `/instructor/${user.id}/library`,
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

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <GraduationCap className="size-3" />
            لوحة المدرب
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
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
              مدرب معتمد
            </span>
          </div>
          <button className="mr-auto size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"></button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
