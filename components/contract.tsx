"use client";

import React, { useRef } from "react";
import { ServiceRequest } from "./attractor/serviceTable";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./contract_font_override.css";

const Contract = ({ data }: { data: ServiceRequest }) => {
  const contractRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!contractRef.current) return;

    const canvas = await html2canvas(contractRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save(`contract_${data.id}.pdf`);
  };

  return (
    <div className="flex flex-col items-center" dir="rtl">
      <div
        ref={contractRef}
        className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-md leading-8 text-right font-medium contract-font-override"
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={100}
          height={100}
          className="mx-auto block mb-10"
        />
        <h1 className="text-2xl text-center  mb-6 text-primary ">
          اتفاق على تقديم خدمة
        </h1>

        <p className="mb-4 ">تحية طيبة وبعد،</p>

        <p className="mb-2">
          اسم الشركة: <span className="text-primary font-bold">أوركيدة</span>
        </p>
        <p className="mb-2">
          اسم العميل:{" "}
          <span className="text-primary font-bold">
            {data.clientName ?? "ـــــــ"}
          </span>
        </p>
        <p className="mb-4">
          الموضوع: تقديم خدمة{" "}
          <span className="text-primary font-bold">
            {data.name ?? "ـــــــ"}
          </span>
        </p>

        <h2 className="font-bold mt-4">المادة (1): موضوع العقد</h2>
        <p>
          تلتزم الشركة بتقديم الخدمة المذكورة أعلاه للعميل وفقًا لما يتم الاتفاق
          عليه بين الطرفين، وبجودة عالية ووفق المعايير المهنية.
        </p>

        <h2 className="font-bold mt-4">المادة (2): مدة العقد</h2>
        <p>
          يبدأ هذا العقد اعتبارًا من تاريخ توقيعه، ويستمر لمدة{" "}
          <span className="text-primary font-bold">
            {data.duration ?? "ـــــــ"}{" "}
          </span>
          قابلة للتجديد بموافقة خطية مشتركة.
        </p>

        <h2 className="font-bold mt-4">المادة (3): المقابل المالي</h2>
        <p>
          يلتزم العميل بسداد مبلغ{" "}
          <span className="text-primary font-bold">
            {data.budget ?? "ـــــــ"}$
          </span>{" "}
          للشركة نظير الخدمات المقدمة، وذلك وفقًا لشروط الدفع المحددة.
        </p>

        <h2 className="font-bold mt-4">المادة (4): التزامات الشركة</h2>
        <ul className="list-disc pr-6">
          <li>تقديم الخدمة بكفاءة وجودة عالية.</li>
          <li>الالتزام بالمواعيد المحددة للتسليم.</li>
          <li>الحفاظ على سرية المعلومات الخاصة بالعميل.</li>
        </ul>

        <h2 className="font-bold mt-4">المادة (5): التزامات العميل</h2>
        <ul className="list-disc pr-6">
          <li>تزويد الشركة بكافة المعلومات اللازمة لتنفيذ الخدمة.</li>
          <li>الالتزام بسداد المستحقات المالية في المواعيد المحددة.</li>
          <li>التعاون مع الشركة لتسهيل تنفيذ الخدمة.</li>
        </ul>

        <h2 className="font-bold mt-4">المادة (6): السرية</h2>
        <p>
          يتعهد الطرفان بالحفاظ على سرية المعلومات المتبادلة وعدم إفشائها لأي
          طرف ثالث إلا بموافقة خطية مسبقة.
        </p>

        <h2 className="font-bold mt-4">المادة (7): فسخ العقد</h2>
        <p>
          يجوز لأي من الطرفين فسخ العقد في حال إخلال الطرف الآخر بأي من
          التزاماته الجوهرية، وذلك بعد إنذاره خطيًا ومنحه مهلة مناسبة لتصحيح
          الوضع.
        </p>

        <div className="mt-12 flex justify-between">
          <div>
            <p>توقيع الشركة</p>
            <div className="flex items-center gap-2">
              <p>أوركيدة</p>
              <Image src="/logo.png" alt="Logo" width={20} height={20} />
            </div>
          </div>
          <div>
            <p>توقيع العميل</p>
            <p>{data.clientName ?? "ـــــــ"}</p>
          </div>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        className="mt-6 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg shadow-md transition"
      >
        تحميل العقد PDF
      </button>
    </div>
  );
};

export default Contract;
