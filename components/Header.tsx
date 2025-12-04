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
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  SquaresPlusIcon,
  UserGroupIcon,
  Bars4Icon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { Button } from "./ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
// @ts-ignore

// --- عناصر قائمة الدورات ---
const navListMenuItems = [
  {
    title: "المنتج الأول",
    description: "وصف للمنتج الأول",
    icon: SquaresPlusIcon,
  },
  {
    title: "المنتج الثاني",
    description: "وصف للمنتج الثاني",
    icon: UserGroupIcon,
  },
  { title: "المنتج الثالث", description: "وصف للمنتج الثالث", icon: Bars4Icon },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderItems = navListMenuItems.map(
    ({ icon, title, description }, key) => (
      <Link href="#" key={key}>
        {/* @ts-ignore */}
        <MenuItem className="flex items-center gap-3 hover:bg-gray-100 text-right">
          <div className="flex items-center justify-center p-2">
            {React.createElement(icon, { className: "h-6 w-6 text-gray-900" })}
          </div>
          <div>
            {/* @ts-ignore */}
            <Typography as="h6" className="font-bold">
              {title}
            </Typography>
            {/* @ts-ignore */}
            <Typography as="p" className="text-xs text-blue-gray-500">
              {description}
            </Typography>
          </div>
        </MenuItem>
      </Link>
    )
  );

  return (
    <>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover
      >
        <MenuHandler>
          {/* @ts-ignore */}
          <Typography as="div" className="font-bold text-md">
            {/* @ts-ignore */}
            <ListItem
              className="flex items-center gap-2 py-2 pl-4"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              الدورات
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        {/* @ts-ignore */}
        <MenuList className="hidden lg:grid grid-cols-3 gap-y-2">
          {renderItems}
        </MenuList>
      </Menu>

      {/* نسخة الموبايل */}
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </>
  );
}

function NavList({ isScrolled }: { isScrolled: boolean }) {
  const navListItemsData = [
    { id: 1, title: "الرئيسية", href: "/" },
    { id: 2, title: "اخر المستجدات", href: "/latest" },
    { id: 4, title: "الخدمات الرقمية", href: "/digital-services" },
    { id: 5, title: "اتصل بنا", href: "/contact" },
    { id: 6, title: "من نحن", href: "/about" },
  ];

  return (
    <div>
      {/* @ts-ignore */}
      <List className="mt-4 mb-6 font-semibold p-0 lg:mt-0 lg:mb-0 lg:flex-row lg:p-1 lg:items-center relative">
        {navListItemsData.map(({ id, title, href }) => (
          <Link key={id} href={href}>
            {/* @ts-ignore */}
            <Typography as="span" className="font-bold text-md relative group">
              {/* @ts-ignore */}
              <ListItem className="flex items-center gap-2 py-2 pl-4 group">
                {title}
              </ListItem>
              <span
                className={`absolute w-0 top-1/2 translate-y-4 h-0.5 ${
                  isScrolled ? "bg-white" : "bg-gray-800"
                } opacity-0 left-1/4 group-hover:opacity-100 group-hover:w-1/2 transition-all duration-700`}
              ></span>
            </Typography>
          </Link>
        ))}
        <NavListMenu />
      </List>
    </div>
  );
}

const CollapseContent = ({ open }: { open: boolean }) => {
  return (
    <Collapse open={open} className="lg:hidden">
      <div className="bg-white rounded-lg shadow-xl mx-4 my-2 text-blue-gray-900">
        <NavList isScrolled={false} />
        <div className="flex w-full flex-nowrap items-center gap-2 p-4 pt-0">
          <Button size="sm" variant="secondary" className="w-full">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    </Collapse>
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

  const commonClasses =
    "w-full border-0 rounded-t-none max-w-full px-4 py-0 z-50";
  const fixedHeaderClasses = `fixed top-0 bg-primary/80 backdrop-blur-sm shadow-lg text-white transition duration-500 ${
    isScrolled
      ? "opacity-100 translate-y-0"
      : "opacity-0 -translate-y-full pointer-events-none"
  }`;
  const staticHeaderClasses = `relative bg-gray-200 text-gray-800 transition-opacity duration-300 ${
    isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
  }`;

  const HeaderContent = ({ isFixed }: { isFixed: boolean }) => (
    <div className="container mx-auto flex items-center justify-between h-[86px]">
      <Link href="/">
        <Image
          src={isScrolled ? "/logoWhite.svg" : "/logoNav.svg"}
          alt="logo"
          width={isScrolled ? 60 : 70}
          height={isScrolled ? 60 : 70}
        />
      </Link>
      <div className="hidden lg:flex">
        <NavList isScrolled={isScrolled} />
      </div>
      <div className="hidden lg:inline-block">
        <Button
          variant="outline"
          size="sm"
          className={
            isFixed
              ? "text-primary border-white"
              : "text-primary border-primary"
          }
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
      {/* @ts-ignore */}
      <IconButton
        variant="text"
        className={`lg:hidden ${isFixed ? "text-white" : "text-blue-gray-900"}`}
        onClick={() => setOpenNav(!openNav)}
      >
        {openNav ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </IconButton>
    </div>
  );

  return (
    <div dir="rtl">
      {/* @ts-ignore */}
      <Navbar className={`${commonClasses} ${staticHeaderClasses}`}>
        <HeaderContent isFixed={false} />
        <CollapseContent open={openNav} />
      </Navbar>
      {/* @ts-ignore */}
      <Navbar className={`${commonClasses} ${fixedHeaderClasses}`}>
        <HeaderContent isFixed={true} />
        <CollapseContent open={openNav} />
      </Navbar>
    </div>
  );
}
