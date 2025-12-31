"use client";
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
import { FaGraduationCap } from "react-icons/fa";
import { User } from "../admin/instructor/NewInstructorForm";

export function AppSidebarCoordinator({ user }: { user: User }) {
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
                  <Link href={`/coordinator/${user.id}/home`}>
                    <Home />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* الدورات */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/coordinator/${user.id}/courses`}>
                    <FaGraduationCap />
                    <span>الدورات المتاحة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* الشعب */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/coordinator/${user.id}/courses/sections`}>
                    <List />
                    <span>كل الشعب</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* روابط الشعب حسب الحالة */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/openSection`}
                  >
                    <PlayCircle />
                    <span>الشعب النشطة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/pending_approval_section`}
                  >
                    <Clock />
                    <span>شعب بانتظار الموافقة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/closedSection`}
                  >
                    <Lock />
                    <span>شعب مغلقة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/in_progress_section`}
                  >
                    <Loader />
                    <span>شعب قيد التنفيذ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/completed_section`}
                  >
                    <GraduationCap />
                    <span>شعب مكتملة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/cancelled_section`}
                  >
                    <XCircle />
                    <span>شعب ملغاة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/meetings`}
                  >
                    <Video />
                    <span>لقاءات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link
                    href={`/coordinator/${user.id}/courses/sections/meetings`}
                  >
                    <Video />
                    <span>اعمال الطلاب</span>
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
