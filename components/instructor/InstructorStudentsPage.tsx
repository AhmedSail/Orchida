"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Mail,
  Phone,
  BookOpen,
  Download,
  Filter,
  GraduationCap,
  LayoutDashboard,
  ChevronLeft,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  sectionId: string;
  registrationNumber: string | null;
  paymentStatus: string;
  confirmationStatus: string;
  registeredAt: Date;
  courseTitle: string;
  sectionNumber: number;
}

const InstructorStudentsPage = ({
  students,
  instructorName,
}: {
  students: Student[];
  instructorName: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("الكل");

  const courses = [
    "الكل",
    ...Array.from(new Set(students.map((s) => s.courseTitle))),
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentPhone && student.studentPhone.includes(searchTerm));

    const matchesCourse =
      selectedCourse === "الكل" || student.courseTitle === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 sm:p-8 space-y-10 bg-[#fafafa]/50 min-h-screen"
    >
      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary/90 p-8 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 opacity-80">
              <GraduationCap className="size-5" />
              <span className="text-sm font-medium tracking-wider uppercase font-sans">
                بوابة المدرب
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">قائمة الطلاب</h1>
            <p className="text-primary-foreground/80 max-w-xl leading-relaxed">
              إدارة ومتابعة الطلاب المسجلين في دوراتك التدريبية. يمكنك البحث
              وتصفية البيانات بسهولة.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="size-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-bold uppercase tracking-tighter">
                إجمالي الطلاب
              </p>
              <p className="text-2xl font-black leading-none">
                {students.length}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-white/10 blur-3xl opacity-50" />
      </header>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="بحث باسم الطالب، الإيميل، أو رقم الهاتف..."
            className="pr-12 h-14 bg-white border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
          <select
            className="w-full h-14 pr-12 pl-4 bg-white border-none shadow-sm rounded-xl appearance-none focus-visible:ring-2 focus-visible:ring-primary/20 text-slate-600 font-medium"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" />
              سجل الطلاب ({filteredStudents.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200"
            >
              <Download className="size-4" />
              تصدير البيانات
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="px-6 py-4 text-right">
                    معلومات الطالب
                  </TableHead>
                  <TableHead className="text-right">الدورة والشعبة</TableHead>
                  <TableHead className="text-center">حالة الدفع</TableHead>
                  <TableHead className="text-center">تاريخ التسجيل</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <motion.tr
                        layout
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-primary/5 transition-colors border-b last:border-0"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {student.studentName.charAt(0)}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                {student.studentName}
                              </p>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Mail className="size-3" />
                                  {student.studentEmail}
                                </span>
                                {student.studentPhone && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                      <Phone className="size-3" />
                                      {student.studentPhone}
                                    </span>
                                    <a
                                      href={`https://wa.me/${(student.studentPhone.startsWith(
                                        "05"
                                      ) && student.studentPhone.length === 10
                                        ? "970" +
                                          student.studentPhone.substring(1)
                                        : student.studentPhone
                                      ).replace("+", "")}`}
                                      target="_blank"
                                      className="size-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                                      title="إرسال واتساب"
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="size-3.5 fill-current"
                                      >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.553 4.197 1.603 6.02L0 24l6.135-1.61a11.783 11.783 0 005.912 1.587h.005c6.632 0 12.05-5.419 12.05-12.054a11.772 11.772 0 00-3.41-8.483" />
                                      </svg>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-700">
                              {student.courseTitle}
                            </p>
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-500 border-none px-2 py-0 text-[10px] font-bold"
                            >
                              شعبة #{student.sectionNumber}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.paymentStatus === "paid" ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                              خالص
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50">
                              قيد الانتظار
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-slate-500 text-sm">
                          {new Date(student.registeredAt).toLocaleDateString(
                            "ar-EG"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10"
                            >
                              <ExternalLink className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-60 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                          <Search className="size-12 opacity-20" />
                          <p className="font-bold">
                            لم يتم العثور على طلاب تطابق بحثك
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCourse("الكل");
                            }}
                          >
                            إعادة ضبط البحث
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default InstructorStudentsPage;
