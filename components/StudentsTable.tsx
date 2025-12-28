"use client";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Student = {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  paymentStatus: "pending" | "paid" | "failed" | "refunded"; // 👈 أضف refunded
  confirmationStatus: "pending" | "confirmed" | "rejected"; // 👈 أضف rejected
  registeredAt: Date | string;
  paymentReceiptUrl?: string | null;
  isReceiptUploaded?: boolean;
  IBAN: string | null;
};

const StudentsTable = ({ students }: { students: Student[] }) => {
  // بيانات
  const [studentList, setStudentList] = useState<Student[]>(students);
  const [globalNote, setGlobalNote] = useState("");
  // فلترة وفرز
  const [filterPayment, setFilterPayment] = useState<
    "all" | "paid" | "pending" | "failed"
  >("all");
  const [sortBy, setSortBy] = useState<
    "name_asc" | "name_desc" | "date_asc" | "date_desc"
  >("name_asc");
  const [searchName, setSearchName] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showIBAN, setShowIBAN] = useState(false);
  // باجينيشن
  const [currentPage, setCurrentPage] = useState<number>(1);
  const studentsPerPage = 10;
  const [ibanValues, setIbanValues] = useState<{ [key: string]: string }>({});
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  // دوال API
  const handleUpdateEnrollment = async (
    id: string,
    updates: {
      paymentStatus?: Student["paymentStatus"];
      confirmationStatus?: Student["confirmationStatus"];
      IBAN?: string; // أضف هذا
      notes?: string;
    }
  ) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم تعديل بيانات الطالب!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، عدل",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/course-enrollments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        Swal.fire("تم التحديث!", "تم تعديل البيانات بنجاح.", "success");
        setStudentList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
      } else {
        Swal.fire("خطأ!", "فشل في تعديل البيانات.", "error");
      }
    } catch {
      Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف تسجيل الطالب نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/course-enrollments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        Swal.fire("تم الحذف!", "تم حذف تسجيل الطالب بنجاح.", "success");
        setStudentList((prev) => prev.filter((s) => s.id !== id));
      } else {
        Swal.fire("خطأ!", "فشل في حذف التسجيل.", "error");
      }
    } catch {
      Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
    }
  };

  // تطبيق الفلترة والفرز
  const filteredSorted = useMemo(() => {
    const normalizeDate = (d: Date | string) =>
      typeof d === "string" ? new Date(d) : d;

    let data = [...studentList];

    // فلترة الدفع
    if (filterPayment !== "all") {
      data = data.filter((s) => s.paymentStatus === filterPayment);
    }

    // بحث بالاسم
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase();
      data = data.filter((s) => s.studentName.toLowerCase().includes(q));
    }

    // فلترة التاريخ
    if (dateFrom) {
      const from = new Date(dateFrom);
      data = data.filter((s) => normalizeDate(s.registeredAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      // نهاية اليوم
      to.setHours(23, 59, 59, 999);
      data = data.filter((s) => normalizeDate(s.registeredAt) <= to);
    }

    // فرز
    data.sort((a, b) => {
      if (sortBy === "name_asc")
        return a.studentName.localeCompare(b.studentName, "ar");
      if (sortBy === "name_desc")
        return b.studentName.localeCompare(a.studentName, "ar");
      const da = normalizeDate(a.registeredAt).getTime();
      const db = normalizeDate(b.registeredAt).getTime();
      if (sortBy === "date_asc") return da - db;
      return db - da; // date_desc
    });

    return data;
  }, [studentList, filterPayment, searchName, dateFrom, dateTo, sortBy]);

  // حساب الصفحة الحالية
  const totalPages = Math.ceil(filteredSorted.length / studentsPerPage) || 1;
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredSorted.slice(indexOfFirst, indexOfLast);

  // لضمان بقاء currentPage ضمن الحدود عند تغيير الفلاتر
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setShowIBAN((prev) => !prev)}>
        {showIBAN ? "إخفاء الايبان" : "رفع الايبان"}
      </Button>
      {/* أدوات الفلترة والفرز */}
      <div
        className="flex lg:flex-wrap max-lg:flex-col gap-4 lg:items-end"
        dir="rtl"
      >
        <div className="flex flex-col">
          <Label>بحث بالاسم</Label>
          <Input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="ابحث عن طالب..."
            className="mt-1"
          />
        </div>

        <div className="flex flex-col">
          <Label>فلترة الدفع</Label>
          <Select
            value={filterPayment}
            onValueChange={(v: any) => setFilterPayment(v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="اختر حالة الدفع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="paid">مدفوع</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="failed">فشل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <Label>الفرز</Label>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="اختر طريقة الفرز" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">الاسم تصاعدي</SelectItem>
              <SelectItem value="name_desc">الاسم تنازلي</SelectItem>
              <SelectItem value="date_asc">التاريخ أقدم أولاً</SelectItem>
              <SelectItem value="date_desc">التاريخ أحدث أولاً</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <Label>من تاريخ</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex flex-col">
          <Label>إلى تاريخ</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* كاردز للموبايل والآيباد */}
      <div className="grid gap-4 lg:hidden">
        {currentStudents.map((s) => (
          <div key={s.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{s.studentName}</h3>
              <Badge
                variant={
                  s.paymentStatus === "paid"
                    ? "default"
                    : s.paymentStatus === "pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {s.paymentStatus}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{s.studentEmail}</p>
            <p className="text-sm text-gray-600">{s.studentPhone ?? "-"}</p>
            <p className="text-sm mt-2">
              تاريخ التسجيل:{" "}
              {new Date(s.registeredAt).toLocaleDateString("ar-EG")}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {s.isReceiptUploaded && s.paymentReceiptUrl ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      إشعار الدفع
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إشعار الدفع</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                      {/* إذا ما ضفت الدومين في next.config.js استخدم <img> بدل Image */}
                      <Image
                        src={s.paymentReceiptUrl}
                        alt="إشعار الدفع"
                        className="rounded-lg w-full h-auto"
                        width={600}
                        height={400}
                        unoptimized
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  لا يوجد إشعار
                </Button>
              )}

              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    خيارات
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      تغيير حالة الدفع
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateEnrollment(s.id, {
                            paymentStatus: "paid",
                          })
                        }
                      >
                        مدفوع
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateEnrollment(s.id, {
                            paymentStatus: "pending",
                          })
                        }
                      >
                        معلق
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateEnrollment(s.id, {
                            paymentStatus: "failed",
                          })
                        }
                      >
                        فشل
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      تغيير حالة التأكيد
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateEnrollment(s.id, {
                            confirmationStatus: "confirmed",
                          })
                        }
                      >
                        مؤكد
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateEnrollment(s.id, {
                            confirmationStatus: "pending",
                          })
                        }
                      >
                        بانتظار
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteEnrollment(s.id)}
                  >
                    حذف التسجيل
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* جدول للديسكتوب */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">إشعار الدفع</TableHead>
              <TableHead className="text-right">حالة الدفع</TableHead>
              <TableHead className="text-right">حالة التأكيد</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              {showIBAN && <TableHead className="text-right">IBAN</TableHead>}
              <TableHead className="text-right">خيارات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.length > 0 ? (
              currentStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.studentName}</TableCell>
                  <TableCell>{s.studentEmail}</TableCell>
                  <TableCell>{s.studentPhone ?? "-"}</TableCell>
                  <TableCell>
                    {s.isReceiptUploaded && s.paymentReceiptUrl ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            عرض إشعار الدفع
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>إشعار الدفع</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            <Image
                              src={s.paymentReceiptUrl}
                              alt="إشعار الدفع"
                              className="rounded-lg w-full h-auto"
                              width={600}
                              height={400}
                              unoptimized
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-gray-500">لم يتم رفع إشعار</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.paymentStatus === "paid"
                          ? "default"
                          : s.paymentStatus === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {s.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.confirmationStatus}</TableCell>

                  <TableCell>
                    {new Date(s.registeredAt).toLocaleDateString("ar-EG")}
                  </TableCell>
                  {showIBAN && (
                    <TableCell className="flex gap-2">
                      <input
                        type="text"
                        value={ibanValues[s.id] ?? s.IBAN ?? ""}
                        placeholder="أدخل IBAN"
                        className="border rounded px-2 py-1 w-full text-sm"
                        disabled={!!s.IBAN && !editMode[s.id]} // إذا فيه IBAN ومش في وضع تعديل → disabled
                        onChange={(e) =>
                          setIbanValues((prev) => ({
                            ...prev,
                            [s.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateEnrollment(s.id, {
                            IBAN: ibanValues[s.id],
                          })
                        }
                      >
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditMode((prev) => ({
                            ...prev,
                            [s.id]: !prev[s.id],
                          }))
                        }
                      >
                        {editMode[s.id] ? "إلغاء" : "تعديل"}
                      </Button>
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          خيارات
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            تغيير حالة الدفع
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateEnrollment(s.id, {
                                  paymentStatus: "paid",
                                })
                              }
                            >
                              مدفوع
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateEnrollment(s.id, {
                                  paymentStatus: "pending",
                                })
                              }
                            >
                              معلق
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateEnrollment(s.id, {
                                  paymentStatus: "failed",
                                })
                              }
                            >
                              فشل
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            تغيير حالة التأكيد
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateEnrollment(s.id, {
                                  confirmationStatus: "confirmed",
                                })
                              }
                            >
                              مؤكد
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateEnrollment(s.id, {
                                  confirmationStatus: "pending",
                                })
                              }
                            >
                              بانتظار
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteEnrollment(s.id)}
                        >
                          حذف التسجيل
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  لا يوجد طلاب مسجلين
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* باجينيشن */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          السابق
        </Button>
        <span className="text-sm">
          صفحة {currentPage} من {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default StudentsTable;
