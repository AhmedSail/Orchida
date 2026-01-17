"use client";
import React, { useState, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Courses } from "@/app/admin/[adminId]/courses/page";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export type FlatMeeting = {
  id: string;
  meetingNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  location: string | null;
  studentsCount: number;
  notes: string | null;
  courseTitle: string | null;
  sectionNumber: number | null;
};

interface MeetingsTableProps {
  meetings: FlatMeeting[];
  courses: Courses[];
}

const formatTimeTo12h = (timeStr: string): string => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "م" : "ص";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const MeetingsTable = ({ meetings, courses }: MeetingsTableProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // استخراج أرقام الشعب المتاحة
  const sectionOptions = Array.from(
    new Set(meetings.map((m) => m.sectionNumber).filter(Boolean))
  );

  // ✅ فلترة البيانات
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchCourse =
        selectedCourse === "all" || m.courseTitle === selectedCourse;

      const matchSection =
        selectedSection === "all" ||
        m.sectionNumber?.toString() === selectedSection;

      const meetingDate = new Date(m.date);
      const matchDay =
        selectedDay === "all" ||
        meetingDate.getDay().toString() === selectedDay;

      let matchWeek = true;
      if (selectedWeek) {
        const weekStart = new Date(selectedWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        matchWeek = meetingDate >= weekStart && meetingDate <= weekEnd;
      }

      return matchCourse && matchSection && matchDay && matchWeek;
    });
  }, [selectedCourse, selectedSection, selectedDay, selectedWeek, meetings]);

  // حساب الصفحات
  const totalPages = Math.ceil(filteredMeetings.length / pageSize);

  // البيانات المعروضة
  const paginatedMeetings = filteredMeetings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ✅ دالة إعادة التعيين
  const resetFilters = () => {
    setSelectedCourse("all");
    setSelectedSection("all");
    setSelectedDay("all");
    setSelectedWeek("");
    setCurrentPage(1);
  };
  const contractRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!contractRef.current) return;

    const canvas = await html2canvas(contractRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // أبعاد الصورة
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // الصفحة الأولى
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // لو المحتوى أطول من صفحة واحدة
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("meetings.pdf");
  };

  return (
    <div className="p-6">
      <div className="lg:flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📋 جدول اللقاءات</h1>
        <Button onClick={downloadPDF} variant="outline">
          تنزيل PDF
        </Button>
      </div>

      {/* ✅ الفلاتر */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* اختيار عدد العناصر */}
        <Select
          value={pageSize.toString()}
          onValueChange={(val) => {
            setPageSize(Number(val));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="عدد العناصر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>

        {/* فلترة بالدورة */}
        <Select
          onValueChange={(val) => {
            setSelectedCourse(val);
            setCurrentPage(1);
          }}
          value={selectedCourse}
        >
          <SelectTrigger className="w-full md:w-1/5">
            <SelectValue placeholder="اختر الدورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الدورات</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.title}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* فلترة بالشعبة */}
        <Select
          onValueChange={(val) => {
            setSelectedSection(val);
            setCurrentPage(1);
          }}
          value={selectedSection}
        >
          <SelectTrigger className="w-full md:w-1/5">
            <SelectValue placeholder="اختر الشعبة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الشعب</SelectItem>
            {sectionOptions.map((sec) => (
              <SelectItem key={sec!.toString()} value={sec!.toString()}>
                شعبة {sec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* فلترة باليوم */}
        <Select
          onValueChange={(val) => {
            setSelectedDay(val);
            setCurrentPage(1);
          }}
          value={selectedDay}
        >
          <SelectTrigger className="w-full md:w-1/5">
            <SelectValue placeholder="اختر اليوم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأيام</SelectItem>
            <SelectItem value="0">الأحد</SelectItem>
            <SelectItem value="1">الإثنين</SelectItem>
            <SelectItem value="2">الثلاثاء</SelectItem>
            <SelectItem value="3">الأربعاء</SelectItem>
            <SelectItem value="4">الخميس</SelectItem>
            <SelectItem value="5">الجمعة</SelectItem>
            <SelectItem value="6">السبت</SelectItem>
          </SelectContent>
        </Select>

        {/* فلترة بالأسبوع */}
        <Input
          type="date"
          value={selectedWeek}
          onChange={(e) => {
            setSelectedWeek(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/5"
        />

        {/* زر إعادة التعيين */}
        <Button variant="secondary" onClick={resetFilters}>
          إعادة تعيين
        </Button>
      </div>

      {/* ✅ جدول للشاشات الكبيرة */}
      <div className="hidden md:block overflow-x-auto" ref={contractRef}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم اللقاء</TableHead>
              <TableHead className="text-right">الدورة</TableHead>
              <TableHead className="text-right">الشعبة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">وقت البداية</TableHead>
              <TableHead className="text-right">وقت النهاية</TableHead>
              <TableHead className="text-right">المكان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMeetings.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-center">{m.meetingNumber}</TableCell>
                <TableCell>{m.courseTitle}</TableCell>
                <TableCell>{m.sectionNumber}</TableCell>
                <TableCell>
                  {new Date(m.date).toLocaleDateString("ar-EG")}
                </TableCell>
                <TableCell>{formatTimeTo12h(m.startTime)}</TableCell>
                <TableCell>{formatTimeTo12h(m.endTime)}</TableCell>
                <TableCell>{m.location || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ كروت للشاشات الصغيرة */}
      <div className="grid gap-4 md:hidden">
        {paginatedMeetings.map((m) => (
          <Card key={m.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>
                لقاء رقم {m.meetingNumber} - {m.courseTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>الشعبة:</strong> {m.sectionNumber}
              </p>
              <p>
                <strong>التاريخ:</strong>{" "}
                {new Date(m.date).toLocaleDateString("ar-EG")}
              </p>
              <p>
                <strong>الوقت:</strong> {formatTimeTo12h(m.startTime)} -{" "}
                {formatTimeTo12h(m.endTime)}
              </p>
              <p>
                <strong>المكان:</strong> {m.location || "-"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          السابق
        </Button>
        <span>
          صفحة {currentPage} من {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          التالي
        </Button>
      </div>
    </div>
  );
};
export default MeetingsTable;
