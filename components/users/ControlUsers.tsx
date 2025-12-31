"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
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

// ✅ دالة معرفة إذا المستخدم نشط الآن بناءً على الجلسة
const isOnline = (userId: string, sessions: any[]) => {
  const activeSession = sessions.find(
    (s) => s.userId === userId && new Date(s.expiresAt) > new Date()
  );
  return Boolean(activeSession);
};

const ControlUsers = ({
  allUsers,
  sessions,
}: {
  allUsers: User[];
  sessions: any[];
}) => {
  // ✅ فلترة
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Modal state
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

  // ✅ تطبيق الفلترة
  const filteredUsers = allUsers.filter((user) => {
    const online = isOnline(user.id, sessions);

    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "online" && online) ||
      (statusFilter === "offline" && !online);

    return roleMatch && statusMatch;
  });

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-primary">
        إدارة صلاحيات المستخدمين
      </h2>

      {/* ✅ فلاتر */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* فلترة حسب الدور */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="فلترة حسب الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأدوار</SelectItem>
            <SelectItem value="user">مستخدم</SelectItem>
            <SelectItem value="admin">مدير</SelectItem>
            <SelectItem value="attractor">مستقطب</SelectItem>
            <SelectItem value="coordinator">منسق تدريب</SelectItem>
            <SelectItem value="instructor">مدرب</SelectItem>
          </SelectContent>
        </Select>

        {/* فلترة حسب الحالة */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="فلترة حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="online">نشط الآن</SelectItem>
            <SelectItem value="offline">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ✅ TABLE FOR DESKTOP */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border">
        <Table className="min-w-[700px]">
          <TableCaption>قائمة المستخدمين</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedUsers.map((user) => {
              const online = isOnline(user.id, sessions);

              return (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>

                  <TableCell>
                    <span className="px-2 py-1 rounded bg-gray-100 text-sm">
                      {user.role}
                    </span>
                  </TableCell>

                  <TableCell>
                    {online ? (
                      <span className="text-green-600 font-semibold">
                        نشط الآن
                      </span>
                    ) : (
                      <span className="text-gray-500 font-semibold">
                        غير نشط
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRoleModal(user)}
                    >
                      تغيير الصلاحية
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ✅ CARDS FOR MOBILE */}
      <div className="lg:hidden space-y-4">
        {paginatedUsers.map((user) => {
          const online = isOnline(user.id, sessions);

          return (
            <div
              key={user.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">{user.phone || "-"}</p>

              <p className="mt-2">
                <span className="px-2 py-1 rounded bg-gray-100 text-sm">
                  {user.role}
                </span>
              </p>

              <p className="mt-2">
                {online ? (
                  <span className="text-green-600 font-semibold">نشط الآن</span>
                ) : (
                  <span className="text-gray-500 font-semibold">غير نشط</span>
                )}
              </p>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRoleModal(user)}
                >
                  تغيير الصلاحية
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ PAGINATION */}
      <div className="flex justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          السابق
        </Button>

        <span className="px-3 py-1 border rounded">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          التالي
        </Button>
      </div>

      {/* ✅ MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90%] sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center text-primary">
              تغيير صلاحية المستخدم
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              المستخدم: <strong>{selectedUser?.name}</strong>
            </p>

            <Select value={role} onValueChange={setRole} dir="rtl">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الصلاحية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">مستخدم</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="attractor">مستقطب</SelectItem>
                <SelectItem value="coordinator">منسق تدريب</SelectItem>
                <SelectItem value="instructor">مدرب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button onClick={saveRole} className="w-full">
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ControlUsers;
