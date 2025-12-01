"use client";

import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { SquaresPlusIcon, UserGroupIcon, Bars4Icon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Button } from "./ui/button";
import { User } from "lucide-react";
import Link from "next/link";

import React, { useState, useEffect } from "react";


// --- المكونات الفرعية المشتركة (تبقى كما هي) ---

const navListMenuItems = [
  { title: "المنتج الأول", description: "وصف للمنتج الأول", icon: SquaresPlusIcon },
  { title: "المنتج الثاني", description: "وصف للمنتج الثاني", icon: UserGroupIcon },
  { title: "المنتج الثالث", description: "وصف للمنتج الثالث", icon: Bars4Icon },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderItems = navListMenuItems.map(({ icon, title, description }, key) => (
    <a href="#" key={key}>
      <MenuItem className="flex items-center gap-3 hover:bg-gray-100 text-right">
        <div className="flex items-center justify-center p-2">
          {React.createElement(icon, { strokeWidth: 2, className: "h-6 text-gray-900 w-6" })}
        </div>
        <div>
          <Typography variant="h6" color="blue-gray" className="font-bold">{title}</Typography>
          <Typography variant="paragraph" className="text-xs text-blue-gray-500">{description}</Typography>
        </div>
      </MenuItem>
    </a>
  ));

  return (
    <>
      <Menu open={isMenuOpen} handler={setIsMenuOpen} offset={{ mainAxis: 20 }} placement="bottom" allowHover={true}>
        <MenuHandler>
          <Typography as="div" variant="small" className="font-bold text-md">
            <ListItem
              className="flex items-center gap-2 py-2 pl-4"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              الدورات
              <ChevronDownIcon strokeWidth={2.5} className={`hidden h-3 w-3 transition-transform lg:block ${isMenuOpen ? "rotate-180" : ""}`} />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden lg:block"><ul className="grid grid-cols-3 gap-y-2 outline-none outline-0">{renderItems}</ul></MenuList>
      </Menu>
      <div className="block lg:hidden"><Collapse open={isMobileMenuOpen}>{renderItems}</Collapse></div>
    </>
  );
}

function NavList() {
  const navListItemsData = [
    { id: 1, title: "الرئيسية", href: "/" },
    { id: 2, title: "اخر المستجدات", href: "/latest" },
    { id: 4, title: "الخدمات الرقمية", href: "/digital-services" },
    { id: 5, title: "اتصل بنا", href: "/contact" },
    { id: 6, title: "من نحن", href: "/about" },
  ];
const [isScrolled, setIsScrolled] = useState(false);
useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 90);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <List className="mt-4 mb-6 font-semibold p-0 lg:mt-0 lg:mb-0 lg:flex-row lg:p-1 lg:items-center relative">
      {navListItemsData.map(({ id, title, href }) => (
        <Typography key={id} as="a" href={href} variant="small" className="font-bold text-md relative group">
          <ListItem className="flex items-center gap-2 py-2 pl-4 group">{title}</ListItem>
          <span className={`absolute  w-0 top-1/2 translate-y-4  h-0.5  bg-gray-300 ${isScrolled ? "bg-white" : "bg-gray-800"} opacity-0 left-1/4 group-hover:opacity-100  group-hover:w-1/2 transition-all duration-700 ease-in-out `}></span>
        </Typography>
      ))}
      <NavListMenu />
    </List>
  );
}

// 1. تم إنشاء هذا المكون الجديد للتحكم في قائمة الموبايل
const CollapseContent = ({ open }: { open: boolean }) => {
  const collapseClasses = `
    lg:hidden absolute top-full left-0 w-full overflow-hidden
    transition-all duration-500 ease-in-out text-gray-800 font-bold
    ${open ? 'opacity-100 translate-y-0 ' : 'opacity-0 -translate-y-4 pointer-events-none'}
  `;

  return (
    <div className={collapseClasses}>
      <div className="bg-white rounded-lg shadow-xl mx-4 my-2 text-blue-gray-900">
        <NavList />
        <div className="flex w-full flex-nowrap items-center gap-2 p-4 pt-0">
          <Button size="sm" variant="secondary" className="w-full">تسجيل الدخول</Button>
        </div>
      </div>
    </div>
  );
};


// --- المكون الرئيسي Header ---

export function Header() {
  const [openNav, setOpenNav] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false);
    const handleScroll = () => setIsScrolled(window.scrollY > 90);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const commonClasses = "w-full border-0 rounded-t-none max-w-full px-4 py-0 z-50";
  const fixedHeaderClasses = `fixed top-0 bg-primary/80 backdrop-blur-sm shadow-lg text-white transform transition-all duration-500 ease-in-out ${isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`;
  const staticHeaderClasses = `relative bg-gray-200 text-gray-800 transition-opacity duration-300 ${isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`;

  const HeaderContent = ({ isFixed }: { isFixed: boolean }) => (
    <div className="container mx-auto flex items-center justify-between h-[86px]">
      <Link href="/"><Image src={`${isScrolled ? "/logoWhite.svg" : "/logoNav.svg"}`} alt="logo" width={isScrolled ? 60 : 70} height={isScrolled ? 60 : 70} /></Link>
      <div className="hidden lg:flex"><NavList /></div>
      <div className="hidden lg:inline-block">
        <Button variant="outline" size="sm" className={isFixed ? "text-primary border-white" : "text-primary border-primary"}>
          <User className="h-5 w-5" />
        </Button>
      </div>
      <IconButton variant="text" className={`lg:hidden ${isFixed ? "text-white" : "text-blue-gray-900"}`} onClick={() => setOpenNav(!openNav)}>
        {openNav ? <XMarkIcon className="h-6 w-6" strokeWidth={2} /> : <Bars3Icon className="h-6 w-6" strokeWidth={2} />}
      </IconButton>
    </div>
  );

  return (
    <>
      <Navbar dir="rtl" className={`${commonClasses} ${staticHeaderClasses}`}>
        <HeaderContent isFixed={false} />
        {/* 2. تم نقل قائمة الموبايل هنا لتكون تابعة للشريط الأساسي */}
        <CollapseContent open={openNav} />
      </Navbar>

      <Navbar dir="rtl" className={`${commonClasses} ${fixedHeaderClasses}`}>
        <HeaderContent isFixed={true} />
        {/* وأيضاً هنا لتكون تابعة للشريط اللاصق */}
        <CollapseContent open={openNav} />
      </Navbar>
    </>
  );
}
