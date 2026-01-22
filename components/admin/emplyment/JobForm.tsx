"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createJob, updateJob } from "@/app/actions/jobs";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, FileText, PlusCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Swal from "sweetalert2";

interface JobFormProps {
  adminId: string;
  jobId?: string; // If present, it's edit mode
  initialData?: {
    title: string;
    department: string | null;
    description: string | null;
    isActive: boolean;
  };
}

export default function JobForm({ adminId, jobId, initialData }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    department: initialData?.department || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (jobId) {
        await updateJob(jobId, formData);
        Swal.fire({
          title: "تم التحديث!",
          text: "تم تحديث بيانات الوظيفة بنجاح.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createJob(formData);
        Swal.fire({
          title: "تم الإضافة!",
          text: "تم إضافة الوظيفة الجديدة بنجاح.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      router.push(`/admin/${adminId}/employment`);
      router.refresh();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "خطأ!",
        text: jobId
          ? "حدث خطأ أثناء تحديث الوظيفة"
          : "حدث خطأ أثناء إضافة الوظيفة",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl border-gray-100/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase size={20} />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {jobId ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-base font-medium text-gray-700 flex items-center gap-2"
              >
                <FileText size={16} className="text-gray-400" />
                عنوان الوظيفة
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="مثال: مطور واجهات أمامية"
                className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="department"
                className="text-base font-medium text-gray-700 flex items-center gap-2"
              >
                <Building2 size={16} className="text-gray-400" />
                القسم
              </Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="مثال: قسم التكنولوجيا"
                className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-base font-medium text-gray-700"
              >
                وصف الوظيفة
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="اكتب تفاصيل الوظيفة هنا..."
                className="bg-white border-gray-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <Label
                htmlFor="isActive"
                className="text-base font-medium text-gray-700"
              >
                حالة الوظيفة (نشط)
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={loading}
              >
                {loading ? (
                  "جاري الحفظ..."
                ) : (
                  <span className="flex items-center gap-2">
                    {jobId ? <Save size={18} /> : <PlusCircle size={18} />}
                    {jobId ? "حفظ التعديلات" : "إضافة الوظيفة"}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
