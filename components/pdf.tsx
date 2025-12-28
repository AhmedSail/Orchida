"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "./ui/button";

const AttendancePDF = ({ children }: { children: React.ReactNode }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!tableRef.current) return;

    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("attendance.pdf");
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={tableRef}
        className="w-full max-w-4xl bg-white shadow-md rounded-md p-6"
      >
        {children}
      </div>

      <Button
        onClick={downloadPDF}
        className="mt-6 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg shadow-md transition"
      >
        📄 تحميل جدول الحضور PDF
      </Button>
    </div>
  );
};

export default AttendancePDF;
