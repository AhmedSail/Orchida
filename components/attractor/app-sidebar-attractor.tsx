"use client";
import {
  Home,
  Clock, // للخدمات المعلقة
  CheckCircle, // للخدمات الفعّالة
  Archive, // للخدمات المنتهية
  XCircle, // لغير متفق عليها
  FileText,
  Briefcase, // للعقود
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
import { Link } from "next-view-transitions";
import { useState } from "react";
import { User } from "../admin/instructor/NewInstructorForm";

export function AppSidebarAttractor({ user }: { user: User }) {
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
              unoptimized
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-36 gap-5">
              {/* عناصر القائمة الرئيسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/attractor/${user.id}/home`}>
                    <Home />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/attractor/${user.id}/allServices`}>
                    <Briefcase />
                    <span>الخدمات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/attractor/${user.id}/pending-services`}>
                    <Clock />
                    <span>الخدمات المعلقة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/attractor/${user.id}/in-progress`}>
                    <CheckCircle />
                    <span>الخدمات الفعّالة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/attractor/${user.id}/completed`}>
                    <Archive />
                    <span>الخدمات المنتهية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/attractor/${user.id}/cancelled`}>
                    <XCircle />
                    <span>غير متفق عليها</span>
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
