"use client";
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  MessageSquare,
  Settings,
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
import { User } from "../edit-profile";

export function AppSidebarUser({ user }: { user: User }) {
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
              {/* الرئيسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/dashboardUser/${user.id}/home`}>
                    <Home />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* المقررات الدراسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/dashboardUser/${user.id}/courses`}>
                    <BookOpen />
                    <span>المقررات الدراسية</span>
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
