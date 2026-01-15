"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Link } from "next-view-transitions";
import { Plus, Edit, Trash2, MessageSquareText } from "lucide-react";
import Swal from "sweetalert2";
import { useParams } from "next/navigation";

type SmsTemplate = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const SmsTemplatesPage = () => {
  const { coordinatorId } = useParams();
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/sms/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذا القالب نهائياً.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "نعم، حذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/sms/templates/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("تم الحذف!", "تم حذف القالب بنجاح.", "success");
          setTemplates((prev) => prev.filter((t) => t.id !== id));
        } else {
          Swal.fire("خطأ!", "فشل في حذف القالب.", "error");
        }
      } catch (error) {
        Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
      }
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
            قوالب الرسائل (SMS)
          </h1>
          <p className="text-slate-500 font-medium">
            إدارة الرسائل الجاهزة لاستخدامها في إرسال التنبيهات للطلاب.
          </p>
        </div>
        <Link href={`/coordinator/${coordinatorId}/sms/templates/new`}>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 font-bold">
            <Plus className="size-5" />
            إضافة قالب جديد
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-[32px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-zinc-900/50">
              <TableHead className="px-6 py-4 font-bold text-slate-500 text-start">
                عنوان القالب
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-slate-500 text-start">
                نص الرسالة
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-slate-500 text-center">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.id} className="group">
                  <TableCell className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquareText className="size-5" />
                      </div>
                      {template.title}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-md truncate">
                    {template.content}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/coordinator/${coordinatorId}/sms/templates/${template.id}/edit`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg hover:bg-blue-50 text-blue-600"
                        >
                          <Edit className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-red-50 text-red-600"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                    <MessageSquareText className="size-12 opacity-20" />
                    <p className="font-bold">لا توجد قوالب مضافة بعد.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SmsTemplatesPage;
