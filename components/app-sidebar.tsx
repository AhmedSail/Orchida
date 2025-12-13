"use client";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ChevronDown,
  Users,
  Plus,
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
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export function AppSidebar() {
  const [servicesOpen, setServicesOpen] = useState(false);

  const toggleServices = () => setServicesOpen((prev) => !prev);

  return (
    <Sidebar dir="rtl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Image
              src="/logo.svg"
              alt="Logo"
              width={100}
              height={100}
              className="mt-28 mx-auto"
              priority
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-36 gap-5">
              {/* عناصر القائمة الرئيسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href="/admin/home">
                    <Home />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href="/admin/news">
                    <Inbox />
                    <span>أحدث المستجدات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href="/admin/slider">
                    <ImageIcon />
                    <span>تحكم بالسلايدر</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href="/admin/employees">
                    <Users />
                    <span>الموظفون</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* الخدمات الرقمية - قائمة منسدلة */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={toggleServices}
                  className="text-lg flex justify-between items-center w-full"
                >
                  <div className="flex items-center gap-2">
                    <Calendar />
                    <span>الخدمات الرقمية</span>
                  </div>
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      servicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarMenuButton>

                <div
                  className={`
      overflow-hidden transition-all duration-300 
      ${servicesOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}
    `}
                >
                  <div className="pl-6 flex flex-col gap-2 text-gray-700 text-lg py-2">
                    <Link
                      href="/admin/services"
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - خدماتنا
                    </Link>

                    <Link
                      href="/admin/services/add"
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - إضافة خدمة جديدة
                    </Link>

                    <Link
                      href="/admin/services/in-progress"
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - الخدمات الفعّالة
                    </Link>

                    <Link
                      href="/admin/services/completed"
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - الخدمات المنتهية
                    </Link>

                    <Link
                      href="/admin/services/pending-services"
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - الخدمات المعلقة
                    </Link>

                    <Link
                      href="/admin/services/cancelled"
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - غير متفق عليها
                    </Link>
                    <Link
                      href="/admin/works"
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - معرض الاعمال
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href="/admin/courses">
                    <Search />
                    <span>الدورات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href="/admin/users">
                    <Settings />
                    <span>إدارة الحسابات والصلاحيات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
