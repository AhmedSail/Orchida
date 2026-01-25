"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Phone,
  Mail,
  User,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ApplicationActions from "./ApplicationActions";
import { cn } from "@/lib/utils";

const MySwal = withReactContent(Swal);

interface Application {
  id: string;
  jobId: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantWhatsapp: string | null;
  applicantMajor: string | null;
  applicantEducation: string | null;
  applicantExperienceYears: number | null;
  applicantGender: string | null;
  applicantLocation: string | null;
  applicantAge: number | null;
  applicantCV: string | null;
  status: string | null;
  createdAt: Date;
}

export default function ApplicationsTableClient({
  applications,
}: {
  applications: Application[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [smsMessage, setSmsMessage] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [templates, setTemplates] = useState<
    { id: string; title: string; content: string }[]
  >([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/sms/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch (e) {
        console.error("Failed to fetch templates", e);
      }
    };
    fetchTemplates();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === applications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applications.map((app) => app.id));
    }
  };

  const toggleSelectApp = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSendBulkSMS = async () => {
    if (selectedIds.length === 0) {
      MySwal.fire("تنبيه", "يرجى اختيار متقدم واحد على الأقل", "warning");
      return;
    }
    if (!smsMessage.trim()) {
      MySwal.fire("تنبيه", "يرجى كتابة نص الرسالة", "warning");
      return;
    }

    const result = await MySwal.fire({
      title: "إرسال رسائل جماعية؟",
      text: `سيتم إرسال الرسالة إلى ${selectedIds.length} متقدم.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، أرسل الآن",
      cancelButtonText: "إلغاء",
    });

    if (!result.isConfirmed) return;

    setIsSendingSms(true);
    try {
      const selectedMobiles = applications
        .filter((app) => selectedIds.includes(app.id) && app.applicantPhone)
        .map((app) => app.applicantPhone);

      const res = await fetch("/api/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobiles: selectedMobiles,
          text: smsMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        MySwal.fire("تم بنجاح!", data.message, "success");
        setSmsMessage("");
        setSelectedIds([]);
      } else {
        const error = await res.json();
        MySwal.fire("فشل!", error.message, "error");
      }
    } catch (error) {
      MySwal.fire("خطأ", "فشل في الاتصال بالسيرفر", "error");
    } finally {
      setIsSendingSms(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMS Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[24px] border border-emerald-100 dark:border-emerald-900/30 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-5 h-5" />
            <h2 className="font-bold">إرسال رسائل SMS جماعية للمتقدمين</h2>
          </div>

          <select
            className="h-9 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-100 dark:border-emerald-900/30 outline-none text-xs w-48"
            onChange={(e) => {
              const tmpl = templates.find((t) => t.id === e.target.value);
              if (tmpl) setSmsMessage(tmpl.content);
            }}
            defaultValue=""
          >
            <option value="" disabled>
              اختر رسالة جاهزة...
            </option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Textarea
              placeholder="اكتب نص الرسالة هنا..."
              className="rounded-2xl border-zinc-200 dark:border-zinc-800 min-h-[80px] bg-white dark:bg-zinc-950 resize-none focus:ring-emerald-500"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <div className="text-xs text-zinc-500">
              المختارون:{" "}
              <span className="font-bold text-emerald-600">
                {selectedIds.length}
              </span>{" "}
              متقدم
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg shadow-emerald-100 dark:shadow-none"
              disabled={isSendingSms || selectedIds.length === 0}
              onClick={handleSendBulkSMS}
            >
              {isSendingSms ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              إرسال الرسالة
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    applications.length > 0 &&
                    selectedIds.length === applications.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-right">المتقدم</TableHead>
              <TableHead className="text-right">معلومات الاتصال</TableHead>
              <TableHead className="text-right">المؤهل / التخصص</TableHead>
              <TableHead className="text-right">الخبرة</TableHead>
              <TableHead className="text-right">تاريخ التقديم</TableHead>
              <TableHead className="text-center">السيرة الذاتية</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  لا يوجد طلبات تقديم حتى الآن
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow
                  key={app.id}
                  className={cn(
                    "transition-colors",
                    selectedIds.includes(app.id) &&
                      "bg-emerald-50/30 dark:bg-emerald-900/10",
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(app.id)}
                      onCheckedChange={() => toggleSelectApp(app.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-2">
                        <User size={14} className="text-gray-400" />{" "}
                        {app.applicantName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {app.applicantAge ? `${app.applicantAge} سنة` : "-"} |{" "}
                        {app.applicantGender === "male"
                          ? "ذكر"
                          : app.applicantGender === "female"
                            ? "أنثى"
                            : "-"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {app.applicantLocation}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <a
                        href={`mailto:${app.applicantEmail}`}
                        className="text-xs flex items-center gap-2 hover:text-primary"
                      >
                        <Mail size={12} className="text-gray-400" />{" "}
                        {app.applicantEmail}
                      </a>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${app.applicantPhone}`}
                          className="text-xs flex items-center gap-2 hover:text-primary"
                        >
                          <Phone size={12} className="text-gray-400" />{" "}
                          {app.applicantPhone}
                        </a>

                        {/* WhatsApp Link */}
                        <a
                          href={`https://wa.me/${(app.applicantPhone.startsWith(
                            "05",
                          ) && app.applicantPhone.length === 10
                            ? "970" + app.applicantPhone.substring(1)
                            : app.applicantPhone
                          ).replace(
                            "+",
                            "",
                          )}${smsMessage ? `?text=${encodeURIComponent(smsMessage)}` : ""}`}
                          target="_blank"
                          className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="إرسال واتساب"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 fill-current"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.553 4.197 1.603 6.02L0 24l6.135-1.61a11.783 11.783 0 005.912 1.587h.005c6.632 0 12.05-5.419 12.05-12.054a11.772 11.772 0 00-3.41-8.483" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">
                        {app.applicantEducation}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {app.applicantMajor}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {app.applicantExperienceYears
                      ? `${app.applicantExperienceYears} سنوات`
                      : "لا يوجد"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(app.createdAt).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell className="text-center">
                    {app.applicantCV ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        <a
                          href={app.applicantCV}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText size={14} className="ml-1" />
                          عرض CV
                        </a>
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-xs">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <ApplicationActions applicationId={app.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
