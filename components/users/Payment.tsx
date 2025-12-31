"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { useEdgeStore } from "@/lib/edgestore";
import { useRouter } from "next/navigation";

type MyCourse = {
  enrollmentId: string;
  courseName: string;
  sectionNumber: number;
  enrolledAt: Date;
  status: string;
  price: string | null;
  paymentStatus: string | null;
};

type Company = {
  id: string;
  name: string;
  phone: string | null;

  accountNumber: string | null;
  ibanShekel: string | null;
  ibanDinar: string | null;
  ibanDollar: string | null;

  videoUrl: string | null;
  managerMessage: string | null;

  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  whatsappUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
};

// 🟢 نوع خاص للعملة
type Currency = "شيكل" | "دولار" | "دينار";

const Payment = ({
  myCourses,
  name,
  userId,
  company,
}: {
  myCourses: MyCourse;
  name: string | null;
  userId: string | null;
  company: Company;
}) => {
  const [currency, setCurrency] = useState<Currency>("شيكل");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { edgestore } = useEdgeStore();
  const router = useRouter();

  // 🟢 اختيار معلومات الدفع حسب العملة
  const paymentInfo: Record<Currency, { iban: string; phone: string }> = {
    شيكل: {
      iban: company.ibanShekel ?? "غير متوفر",
      phone: company.phone ?? "غير متوفر",
    },
    دولار: {
      iban: company.ibanDollar ?? "غير متوفر",
      phone: company.phone ?? "غير متوفر",
    },
    دينار: {
      iban: company.ibanDinar ?? "غير متوفر",
      phone: company.phone ?? "غير متوفر",
    },
  };

  const { iban, phone } = paymentInfo[currency];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receipt) {
      await Swal.fire("تنبيه", "يجب رفع صورة إشعار الدفع أولاً", "warning");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ رفع الصورة على EdgeStore
      const uploadRes = await edgestore.publicFiles.upload({
        file: receipt,
      });
      const receiptUrl = uploadRes.url;

      // 2️⃣ إرسال الرابط إلى الـ API
      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: myCourses.enrollmentId,
          paymentReceiptUrl: receiptUrl,
          isReceiptUploaded: true,
          paymentStatus: "paid",
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok)
        throw new Error(paymentData.error || "فشل عملية الدفع");

      await Swal.fire("تم الدفع", paymentData.message, "success");
      router.push(`/${userId}/myCourses`);
    } catch (error: any) {
      await Swal.fire("خطأ", error.message || "فشل العملية", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 container mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold mb-4 text-primary">عملية دفع الدورة</h2>

      {/* معلومات الدورة */}
      <div className="mb-4 border p-4 rounded-md bg-gray-50">
        <p>
          <span className="font-bold">اسم الدورة: </span>
          {myCourses.courseName}
        </p>
        <p>
          <span className="font-bold">رسوم الدورة: </span>
          {myCourses.price}$
        </p>
      </div>

      {/* معلومات الشركة والدفع */}
      <div className="mb-4 border p-4 rounded-md bg-gray-100">
        <h3 className="font-semibold mb-2">معلومات الدفع:</h3>
        <p>👤 اسم صاحب الحساب: {company.name}</p>
        <p>📱 رقم الجوال: {phone}</p>
        <p>🏦 رقم الحساب: {company.accountNumber ?? "غير متوفر"}</p>
        <p>
          🔑 رقم IBAN ({currency}): {iban}
        </p>
      </div>

      {/* فورم الدفع */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
        <div>
          <label className="block mb-1 font-medium">اسم الطالب</label>
          <Input type="text" value={name ?? ""} required disabled />
        </div>

        <div>
          <label className="block mb-1 font-medium">نوع العملة</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full border rounded-md p-2"
          >
            <option value="شيكل">شيكل</option>
            <option value="دولار">دولار</option>
            <option value="دينار">دينار</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            📷 رفع صورة إشعار الدفع
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              جاري الدفع...
            </span>
          ) : (
            "تأكيد الدفع"
          )}
        </Button>
      </form>
    </div>
  );
};

export default Payment;
