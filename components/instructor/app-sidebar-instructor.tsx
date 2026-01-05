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
import { User } from "../admin/instructor/NewInstructorForm";

export function AppSidebarInstructor({ user }: { user: User }) {
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
              unoptimized
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-36 gap-5">
              {/* الرئيسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/instructor/${user.id}/home`}>
                    <Home />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* المقررات الدراسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/instructor/${user.id}/courses`}>
                    <BookOpen />
                    <span>المقررات الدراسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* الجدول الزمني */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/instructor/${user.id}/celender`}>
                    <Calendar />
                    <span>الجدول الزمني</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* الطلاب */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/instructor/${user.id}/students`}>
                    <Users />
                    <span>الطلاب</span>
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
