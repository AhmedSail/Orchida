"use client";
import { users } from "@/src/db/schema";
import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Edit3,
  Lock,
  Camera,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

export type User = InferSelectModel<typeof users>;

const Profile = ({ user }: { user: User }) => {
  const infoItems = [
    {
      label: "الاسم الكامل",
      value: user.name,
      icon: UserIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "البريد الإلكتروني",
      value: user.email,
      icon: Mail,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "رقم الهاتف",
      value: user.phone || "غير محدد",
      icon: Phone,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "التخصص الدراسي",
      value: user.major || "غير محدد",
      icon: GraduationCap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "الدولة والمدينة",
      value: user.location || "غير محدد",
      icon: MapPin,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "العمر",
      value: user.age ? `${user.age} عام` : "غير محدد",
      icon: Calendar,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 py-12 px-4 md:px-8"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header / Breadcrumb */}
        <div className="flex items-center justify-between px-4 mb-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-bold text-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ArrowRight className="size-4" />
            <span className="text-slate-900 dark:text-white">الملف الشخصي</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[48px] border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          {/* Cover Area */}
          <div className="h-48 md:h-64 bg-slate-900 relative">
            <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-indigo-600/30 backdrop-blur-3xl" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />

            <div className="absolute -bottom-20 right-8 md:right-16 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full md:w-auto left-0 md:left-auto">
              <div className="relative group shrink-0">
                <div className="size-32 md:size-40 rounded-[40px] bg-white dark:bg-zinc-800 border-8 border-white dark:border-zinc-900 shadow-2xl overflow-hidden flex items-center justify-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? "User"}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="size-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                      <UserIcon className="size-16 text-slate-300 dark:text-zinc-600" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-2 left-2 size-10 rounded-2xl bg-primary text-white shadow-xl flex items-center justify-center border-4 border-white dark:border-zinc-900 hover:scale-110 transition-transform">
                  <Camera className="size-5" />
                </button>
              </div>

              <div className="pb-0 md:pb-6 text-center md:text-right">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-black md:text-primary drop-shadow-sm">
                    {user.name}
                  </h1>
                  <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                    حساب نشط
                  </Badge>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 md:text-white/70 font-medium mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-32 md:pt-24 pb-12 px-8 md:px-16 space-y-12">
            {/* Mobile Title View - Hidden as it is integrated in header now */}
            <div className="md:hidden hidden text-center space-y-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-none font-bold">
                  نشط
                </Badge>
                <span className="text-slate-400 text-sm font-medium">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <ShieldCheck className="size-6 text-primary" />
                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                  البيانات الشخصية
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {infoItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 rounded-[32px] bg-slate-50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/50 group hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`size-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                      >
                        <item.icon className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <p className="font-bold text-slate-700 dark:text-zinc-200">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions Area */}
            <div className="bg-slate-900 dark:bg-zinc-800 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-right space-y-2">
                  <h3 className="text-2xl font-black italic">
                    تحكم في خصوصيتك وأمان حسابك
                  </h3>
                  <p className="text-slate-400 font-medium">
                    يمكنك تحديث بياناتك الشخصية أو تغيير كلمة المرور في أي وقت.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <Link
                    href={`/${user.id}/edit-profile`}
                    className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 w-full"
                  >
                    <Edit3 className="size-5" /> تعديل البيانات
                  </Link>

                  <Link
                    href={`/${user.id}/change-password`}
                    className="h-14 px-8 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black flex items-center justify-center gap-2 transition-all hover:-translate-y-1 w-full"
                  >
                    <Lock className="size-5" /> كلمة المرور
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
