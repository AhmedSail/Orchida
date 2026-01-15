"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Save } from "lucide-react";
import { Link } from "next-view-transitions";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

const NewSmsTemplatePage = () => {
  const { adminId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/sms/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          title: "تم الحفظ!",
          text: "تم إضافة القالب الجديد بنجاح.",
          icon: "success",
          confirmButtonText: "حسناً",
          confirmButtonColor: "#675795",
        }).then(() => {
          router.push(`/admin/${adminId}/sms/templates`);
        });
      } else {
        Swal.fire("خطأ!", "فشل في حفظ القالب.", "error");
      }
    } catch (error) {
      Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6" dir="rtl">
      <div className="mb-8">
        <Link
          href={`/admin/${adminId}/sms/templates`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-4 transition-colors font-bold"
        >
          <ArrowRight className="size-4" />
          رجوع للقائمة
        </Link>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">
          إضافة قالب جديد
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          قم بإدخال عنوان ووصف الرسالة لاستخدامها لاحقاً.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-8 rounded-[32px] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              عنوان القالب (للاستخدام الداخلي)
            </label>
            <Input
              placeholder="مثال: رسالة تذكير بالدفع"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              نص الرسالة
            </label>
            <Textarea
              placeholder="أكتب نص الرسالة هنا..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              className="min-h-[150px] rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 resize-none p-4"
            />
            <p className="text-xs text-slate-400 font-medium">
              عدد الأحرف: {formData.content.length}
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-bold gap-2"
            >
              {loading ? (
                "جاري الحفظ..."
              ) : (
                <>
                  <Save className="size-5" />
                  حفظ القالب
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSmsTemplatePage;
