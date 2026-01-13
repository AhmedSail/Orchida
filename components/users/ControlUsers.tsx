"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { User } from "../user/profile";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Shield,
  Activity,
  Mail,
  Phone,
  UserPlus,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  PenTool,
  UserCog,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ✅ دالة معرفة إذا المستخدم نشط الآن بناءً على الجلسة
const isOnline = (userId: string, sessions: any[]) => {
  const activeSession = sessions.find(
    (s) => s.userId === userId && new Date(s.expiresAt) > new Date()
  );
  return Boolean(activeSession);
};

const roleStyles: Record<
  string,
  { label: string; icon: any; className: string }
> = {
  admin: {
    label: "مدير النظام",
    icon: ShieldAlert,
    className:
      "bg-red-50 text-red-600 dark:bg-red-500/10 border-red-100 dark:border-red-900/30",
  },
  coordinator: {
    label: "منسق تدريب",
    icon: UserCog,
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/30",
  },
  instructor: {
    label: "مدرب معتمد",
    icon: GraduationCap,
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/30",
  },
  content_creator: {
    label: "صانع محتوى",
    icon: PenTool,
    className:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 border-purple-100 dark:border-purple-900/30",
  },
  attractor: {
    label: "مستقطب",
    icon: UserPlus,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/30",
  },
  user: {
    label: "مستخدم",
    icon: Users,
    className:
      "bg-slate-50 text-slate-600 dark:bg-slate-500/10 border-slate-100 dark:border-slate-800",
  },
  guest: {
    label: "زائر",
    icon: UserIcon,
    className:
      "bg-zinc-50 text-zinc-400 dark:bg-zinc-500/5 border-zinc-100 dark:border-zinc-900",
  },
};

const ControlUsers = ({
  allUsers,
  sessions,
}: {
  allUsers: User[];
  sessions: any[];
}) => {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("user");

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setRole(user.role || "user");
    setOpen(true);
  };

  const saveRole = async () => {
    if (!selectedUser) return;
    await fetch(`/api/user/${selectedUser.id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setOpen(false);
    window.location.reload();
  };

  const filteredUsers = allUsers.filter((user) => {
    const online = isOnline(user.id, sessions);
    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "online" && online) ||
      (statusFilter === "offline" && !online);
    const searchMatch =
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return roleMatch && statusMatch && searchMatch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Shield className="size-6" />
            <span className="text-sm font-black uppercase tracking-widest opacity-70">
              إدارة النظام والتحكم
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">
            صلاحيات المستخدمين
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            تحكم في صلاحيات الوصول للموظفين والمديرين وتابع حالة اتصالهم بالنظام
            بشكل مباشر.
          </p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="البحث بالاسم أو الإيميل..."
            className="pr-12 h-13 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm focus:ring-primary focus:border-primary transition-all px-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm items-center">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter className="size-5" />
          <span className="text-sm font-bold">تصفية حسب:</span>
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48 h-12 rounded-2xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
            <SelectValue placeholder="الدور الوظيفي" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-2xl">
            <SelectItem value="all">كل الأدوار</SelectItem>
            <SelectItem value="admin">مدير</SelectItem>
            <SelectItem value="coordinator">منسق تدريب</SelectItem>
            <SelectItem value="instructor">مدرب</SelectItem>
            <SelectItem value="content_creator">صانع محتوى</SelectItem>
            <SelectItem value="attractor">مستقطب</SelectItem>
            <SelectItem value="user">مستخدم عادي</SelectItem>
            <SelectItem value="guest">زائر</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 h-12 rounded-2xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-2xl">
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="online">نشط الآن</SelectItem>
            <SelectItem value="offline">غير متصل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Desktop View */}
      <div className="hidden lg:block bg-white dark:bg-zinc-950 rounded-[40px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/50">
              <TableHead className="px-6 py-5 font-bold text-slate-500">
                المستخدم
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-slate-500 text-center">
                التواصل
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-slate-500 text-center">
                الحالة
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-slate-500 text-center">
                الدور الحالي
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-slate-500 text-center">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {paginatedUsers.map((user, index) => {
                const online = isOnline(user.id, sessions);
                const role = roleStyles[user.role || "user"] || roleStyles.user;

                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border-b border-slate-50 dark:border-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <Users className="size-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            ID: {user.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                          <Mail className="size-3.5 text-primary/60" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                            <Phone className="size-3.5 text-emerald-500/60" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      {online ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/30">
                          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-black">متصل الآن</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-400 dark:bg-slate-500/10 border border-slate-100 dark:border-slate-800">
                          <div className="size-2 rounded-full bg-slate-300" />
                          <span className="text-xs font-black">غائب</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <Badge
                        variant="outline"
                        className={`rounded-xl px-4 py-1.5 gap-2 font-black border-2 transition-transform group-hover:scale-105 ${role.className}`}
                      >
                        <role.icon className="size-4" />
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openRoleModal(user)}
                        className="rounded-xl font-bold h-10 px-4 group-hover:bg-primary group-hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        تغيير الصلاحية
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Users Mobile View */}
      <div className="lg:hidden space-y-6">
        {paginatedUsers.map((user, index) => {
          const online = isOnline(user.id, sessions);
          const role = roleStyles[user.role || "user"] || roleStyles.user;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] z-0 transition-all group-hover:bg-primary/20" />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="size-14 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                      <Users className="size-7" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {online ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <div className="size-1.5 rounded-full bg-slate-300" />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl text-slate-400"
                  >
                    <MoreVertical className="size-5" />
                  </Button>
                </div>

                <div className="space-y-3 py-4 border-y border-slate-50 dark:border-zinc-800">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="size-8 rounded-xl bg-slate-50/50 dark:bg-zinc-800 flex items-center justify-center">
                      <Mail className="size-4 text-primary" />
                    </div>
                    <span className="font-bold truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="size-8 rounded-xl bg-slate-50/50 dark:bg-zinc-800 flex items-center justify-center">
                        <Phone className="size-4 text-emerald-500" />
                      </div>
                      <span className="font-bold">{user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Badge
                    className={`rounded-2xl px-4 py-1.5 gap-2 font-black border-2 ${role.className}`}
                  >
                    <role.icon className="size-4" />
                    {role.label}
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openRoleModal(user)}
                    className="flex-1 rounded-2xl font-bold h-11 bg-zinc-900 hover:bg-black text-white"
                  >
                    تغيير الصلاحية
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-10">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-2xl size-12 p-0 border-slate-200"
          >
            <ChevronRight className="size-5" />
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "ghost"}
                onClick={() => setCurrentPage(i + 1)}
                className={`size-12 rounded-2xl font-black text-lg transition-all ${
                  currentPage === i + 1
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                    : "text-slate-400 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-2xl size-12 p-0 border-slate-200"
          >
            <ChevronLeft className="size-5" />
          </Button>
        </div>
      )}

      {/* Modal Section */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[90%] sm:max-w-md rounded-[32px] p-8 border-none shadow-2xl overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-l from-primary to-primary/30" />

          <DialogHeader className="pt-4 space-y-4">
            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <ShieldAlert className="size-8" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-800 dark:text-white">
              تعديل صلاحيات الوصول
            </DialogTitle>
            <p className="text-sm text-slate-500 text-center font-medium">
              أنت الآن تقوم بتغيير المستوى الأمني للمستخدم
              <br />
              <strong className="text-slate-800 dark:text-zinc-200 block mt-1">
                {selectedUser?.name}
              </strong>
            </p>
          </DialogHeader>

          <div className="py-8">
            <Select value={role} onValueChange={setRole} dir="rtl">
              <SelectTrigger className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 px-6 font-bold text-lg">
                <SelectValue placeholder="اختيار مستوى الصلاحية" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-2 border-slate-100 shadow-2xl">
                {Object.entries(roleStyles).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="rounded-xl py-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center ${value.className} group-hover:scale-110 transition-transform`}
                      >
                        <value.icon className="size-4" />
                      </div>
                      <span className="font-bold">{value.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex gap-3">
              <Activity className="size-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                تغيير الصلاحية سيؤثر بشكل فوري على الأقسام واللوحات التي يمكن
                للمستخدم الوصول إليها.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex flex-col w-full gap-2">
              <Button
                onClick={saveRole}
                className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                تأكيد وحفظ التغييرات
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="w-full h-14 rounded-2xl font-bold text-slate-500"
              >
                إلغاء
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ControlUsers;
