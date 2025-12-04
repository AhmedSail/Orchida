import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
// Menu items.
const items = [
  {
    title: "الرئيسية",
    url: "/admin/home",
    icon: Home,
  },
  {
    title: "أحدث المستجدات",
    url: "/admin/news",
    icon: Inbox,
  },

  {
    title: "تحكم بالسلايدر",
    url: "/admin/slider",
    icon: ImageIcon,
  },
  {
    title: "الخدمات الرقمية",
    url: "/admin/services",
    icon: Calendar,
  },
  {
    title: "الدورات",
    url: "/admin/courses",
    icon: Search,
  },
  {
    title: "إدارة الحسابات والصلاحيات",
    url: "/admin/users",
    icon: Settings,
  },
];

export function AppSidebar() {
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
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-36 gap-5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-lg">
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
