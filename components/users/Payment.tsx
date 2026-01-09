"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { useEdgeStore } from "@/lib/edgestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  UploadCloud,
  CheckCircle2,
  Info,
  Copy,
  Phone,
  User,
  DollarSign,
  BookOpen,
  Smartphone,
  ShieldCheck,
  ChevronLeft,
  Clock,
} from "lucide-react";
import Image from "next/image";

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
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { edgestore } = useEdgeStore();
  const router = useRouter();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `تم نسخ ${label} بنجاح`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receipt) {
      await Swal.fire({
        title: "تنبيه",
        text: "يجب رفع صورة إشعار الدفع أولاً لتأكيد العملية",
        icon: "warning",
        confirmButtonColor: "#675795",
      });
      return;
    }

    try {
      setLoading(true);

      const uploadRes = await edgestore.protectedFiles.upload({
        file: receipt,
      });
      const receiptUrl = uploadRes.url;

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

      await Swal.fire({
        title: "تم استلام الإشعار",
        text: "تم رفع إشعار الدفع بنجاح. سيقوم المسؤول بمراجعته وتأكيد تسجيلك قريباً.",
        icon: "success",
        confirmButtonText: "العودة إلى دوراتي",
        confirmButtonColor: "#675795",
      });
      router.push(`/${userId}/myCourses`);
    } catch (error: any) {
      await Swal.fire("خطأ", error.message || "فشل العملية", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl mt-20" dir="rtl">
      {/* Header section with breadcrumb action */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="rounded-full size-12"
            onClick={() => router.back()}
          >
            <ChevronLeft className="size-6 rotate-180" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              إتمام عملية الدفع
            </h1>
            <p className="text-slate-500">
              يرجى اتباع الخطوات أدناه لتأكيد حجزك في الدورة
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck className="size-5" />
          <span className="text-sm font-bold">دفع آمن ومحمي</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Right side: Detailed info and payment instructions */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Course summary card */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-xl">
                <BookOpen className="size-6 text-primary" />
                ملخص الدورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    اسم الدورة
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {myCourses.courseName}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-primary/10 text-primary border-none"
                  >
                    الشعبة رقم {myCourses.sectionNumber}#
                  </Badge>
                </div>
                <div className="text-left sm:text-right border-r sm:border-r-0 sm:border-l border-slate-200 pr-4 sm:pr-0 sm:pl-8">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    رسوم الدورة
                  </p>
                  <div className="flex items-baseline gap-1 text-primary">
                    <span className="text-4xl font-black">
                      {myCourses.price}
                    </span>
                    <span className="text-xl font-bold">$</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Bank Details Card */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <CreditCard className="size-6 text-primary" />
                بيانات التحويل البنكي
              </CardTitle>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                {(["شيكل", "دولار", "دينار"] as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      currency === cur
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <User className="size-5 text-slate-400" />
                    <button
                      onClick={() => name && copyToClipboard(name, "الاسم")}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg text-primary"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      صاحب الحساب
                    </p>
                    <p className="font-bold text-slate-700">{company.name}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <Smartphone className="size-5 text-slate-400" />
                    <button
                      onClick={() =>
                        phone && copyToClipboard(phone, "رقم الجوال")
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg text-primary"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      رقم الجوال (ارسال إشعار)
                    </p>
                    <p className="font-bold text-slate-700">{phone}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group md:col-span-2">
                  <div className="flex justify-between items-start">
                    <Info className="size-5 text-slate-400" />
                    <button
                      onClick={() =>
                        iban && copyToClipboard(iban, "رقم الآيبان")
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg text-primary"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      رقم الآيبان IBAN ({currency})
                    </p>
                    <p className="font-mono font-bold text-primary text-lg break-all">
                      {iban}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-sm">
                <Info className="size-5 shrink-0 mt-0.5" />
                <p>
                  يرجى إتمام عملية التحويل البنكي ثم تصوير الإشعار ورفعه في
                  النموذج الجانبي لتأكيد العملية.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Left side: Form for uploading the receipt */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-none shadow-2xl shadow-primary/10 rounded-3xl overflow-hidden sticky top-8">
              <CardHeader className="bg-primary text-white py-6">
                <CardTitle className="text-center text-xl font-bold flex flex-col items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <CheckCircle2 className="size-8" />
                  </div>
                  تأكيد الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-bold">
                      اسم الطالب
                    </Label>
                    <Input
                      value={name ?? ""}
                      disabled
                      className="bg-slate-50 border-slate-200 rounded-xl h-12 font-bold"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-600 font-bold">
                      إشعار الدفع
                    </Label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 size-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 ${
                          preview
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-slate-50 group-hover:border-primary group-hover:bg-primary/5"
                        }`}
                      >
                        {preview ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-emerald-100">
                            <Image
                              src={preview}
                              width={1000}
                              height={1000}
                              alt="Receipt preview"
                              className="size-full object-cover"
                            />
                            <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <UploadCloud className="size-10 text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                              <UploadCloud className="size-8 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-700">
                                اضغط لرفع الإشعار
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                PNG, JPG بحد أقصى 5MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all text-lg font-black gap-3"
                  >
                    {loading ? (
                      <Clock className="size-6 animate-spin" />
                    ) : (
                      <>
                        <DollarSign className="size-6" />
                        تأكيد وإرسال
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-4 flex items-center justify-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    معالجة فورية للملفات
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
