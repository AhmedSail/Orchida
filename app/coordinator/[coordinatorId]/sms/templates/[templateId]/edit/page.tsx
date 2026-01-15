"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Save } from "lucide-react";
import { Link } from "next-view-transitions";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

const EditSmsTemplatePage = () => {
  const { coordinatorId, templateId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, [templateId]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/sms/templates");
      if (res.ok) {
        const data = await res.json();
        const template = data.find((t: any) => t.id === templateId);
        if (template) {
          setFormData({
            title: template.title,
            content: template.content,
          });
        } else {
          Swal.fire("خطأ!", "القالب غير موجود.", "error");
          router.push(`/coordinator/${coordinatorId}/sms/templates`);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/sms/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          title: "تم التحديث!",
          text: "تم تعديل القالب بنجاح.",
          icon: "success",
          confirmButtonText: "حسناً",
          confirmButtonColor: "#675795",
        }).then(() => {
          router.push(`/coordinator/${coordinatorId}/sms/templates`);
        });
      } else {
        Swal.fire("خطأ!", "فشل في تحديث القالب.", "error");
      }
    } catch (error) {
      Swal.fire("خطأ!", "حدث خطأ أثناء الاتصال بالسيرفر.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6" dir="rtl">
      <div className="mb-8">
        <Link
          href={`/coordinator/${coordinatorId}/sms/templates`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-4 transition-colors font-bold"
        >
          <ArrowRight className="size-4" />
          رجوع للقائمة
        </Link>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">
          تعديل القالب
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          تعديل عنوان ونص الرسالة.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-8 rounded-[32px] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              عنوان القالب
            </label>
            <Input
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
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              className="min-h-[150px] rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 resize-none p-4"
            />
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
                  حفظ التعديلات
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSmsTemplatePage;
