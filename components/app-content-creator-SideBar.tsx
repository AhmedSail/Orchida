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
  Section,
  LucideSection,
  LucideAlignJustify,
  Info,
  ImagesIcon,
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
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { FaGraduationCap } from "react-icons/fa";
import { User } from "./admin/instructor/NewInstructorForm";

export function AppContentCreatorSidebar({ user }: { user: User }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const toggleServices = () => setServicesOpen((prev) => !prev);
  const toggleCourses = () => setCoursesOpen((prev) => !prev);
  const toggleSections = () => setSectionsOpen((prev) => !prev);

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
              priority
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-36 gap-5">
              {/* عناصر القائمة الرئيسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/content_creator/${user.id}/home`}>
                    <Home />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/content_creator/${user.id}/news`}>
                    <Inbox />
                    <span>أحدث المستجدات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/content_creator/${user.id}/slider`}>
                    <ImageIcon />
                    <span>تحكم بالسلايدر</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/content_creator/${user.id}/works`}>
                    <ImagesIcon />
                    <span>معرض الاعمال</span>
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
