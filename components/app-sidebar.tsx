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

export function AppSidebar({ user }: { user: User }) {
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
              priority
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-36 gap-5">
              {/* عناصر القائمة الرئيسية */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/admin/${user.id}/home`}>
                    <Home />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/admin/${user.id}/news`}>
                    <Inbox />
                    <span>أحدث المستجدات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/admin/${user.id}/slider`}>
                    <ImageIcon />
                    <span>تحكم بالسلايدر</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/admin/${user.id}/employees`}>
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
                      href={`/admin/${user.id}/services`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - خدماتنا
                    </Link>
                    <Link
                      href={`/admin/${user.id}/services/add`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - إضافة خدمة جديدة
                    </Link>
                    <Link
                      href={`/admin/${user.id}/services/in-progress`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - الخدمات الفعّالة
                    </Link>
                    <Link
                      href={`/admin/${user.id}/services/completed`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - الخدمات المنتهية
                    </Link>
                    <Link
                      href={`/admin/${user.id}/services/pending-services`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - الخدمات المعلقة
                    </Link>
                    <Link
                      href={`/admin/${user.id}/services/cancelled`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - غير متفق عليها
                    </Link>
                    <Link
                      href={`/admin/${user.id}/works`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - معرض الاعمال
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={toggleCourses}
                  className="text-lg flex justify-between items-center w-full"
                >
                  <div className="flex items-center justify-end gap-2">
                    <FaGraduationCap />

                    <span>الدورات</span>
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
      ${coursesOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}
    `}
                >
                  <div className="pl-6 flex flex-col gap-2 text-gray-700 text-lg py-2">
                    <Link
                      href={`/admin/${user.id}/courses`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - دوراتنا
                    </Link>
                    <Link
                      href={`/admin/${user.id}/courses/sections/meetings`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      - اللقاءات
                    </Link>
                  </div>
                  <div className="w-full">
                    <button
                      onClick={toggleSections}
                      className="text-lg flex justify-between items-center w-full text-right"
                    >
                      <div className="flex items-center gap-2">
                        <LucideAlignJustify className="w-5 h-5" />
                        <span> الشعب</span>
                      </div>
                      <ChevronDown
                        className={`transition-transform duration-300 w-4 h-4 ${
                          sectionsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        sectionsOpen
                          ? "max-h-[500px] opacity-100 mt-2"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-8 flex flex-col gap-2 text-gray-600 text-base py-2">
                        <Link
                          href={`/admin/${user.id}/courses/sections/openSection`}
                          className="transition-all hover:text-primary hover:translate-x-1"
                        >
                          - الشعب النشطة
                        </Link>
                        <Link
                          href={`/admin/${user.id}/courses/sections/pending_approval_section`}
                          className="transition-all hover:text-primary hover:translate-x-1"
                        >
                          - شعب بانتظار الموافقة
                        </Link>
                        <Link
                          href={`/admin/${user.id}/courses/sections/closedSection`}
                          className="transition-all hover:text-primary hover:translate-x-1"
                        >
                          - شعب مغلقة
                        </Link>
                        <Link
                          href={`/admin/${user.id}/courses/sections/in_progress_section`}
                          className="transition-all hover:text-primary hover:translate-x-1"
                        >
                          - شعب قيد التنفيذ
                        </Link>
                        <Link
                          href={`/admin/${user.id}/courses/sections/completed_section`}
                          className="transition-all hover:text-primary hover:translate-x-1"
                        >
                          - شعب مكتملة
                        </Link>
                        <Link
                          href={`/admin/${user.id}/courses/sections/cancelled_section`}
                          className="transition-all hover:text-primary hover:translate-x-1"
                        >
                          - شعب ملغاة
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="pl-6 flex flex-col gap-2 text-gray-700 text-lg py-2">
                    <Link
                      href={`/admin/${user.id}/instructor`}
                      className="transition-all hover:text-primary hover:translate-x-1"
                    >
                      -المدربين
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/admin/${user.id}/info`}>
                    <Info />
                    <span>بيانات الشركة</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-lg">
                  <Link href={`/admin/${user.id}/users`}>
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
