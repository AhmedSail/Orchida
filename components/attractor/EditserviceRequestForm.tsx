"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ServiceRequests } from "@/src/modules/home/ui/view/home-view";
import { Services } from "@/components/admin/service/servicesPage";
import { useRouter } from "next/navigation";

export default function EditServiceRequestForm({
  service,
  services,
}: {
  service: ServiceRequests;
  services: Services;
}) {
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // ✅ تهيئة البيانات من الطلب الحالي
  const [formData, setFormData] = useState({
    serviceId: service.serviceId || "",
    clientName: service.clientName || session?.user?.name || "",
    clientEmail: service.clientEmail || session?.user?.email || "",
    clientPhone: service.clientPhone || "",
    description: service.description || "",
    budget: service.budget?.toString() || "",
    status: service.status || "pending", // ✅ إضافة الحالة
    duration: service.duration || "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.clientName.trim()) return "اسم العميل مطلوب";
    if (!formData.clientEmail.includes("@"))
      return "البريد الإلكتروني غير صالح";
    if (!formData.serviceId) return "يجب اختيار خدمة";
    if (!formData.description.trim()) return "الوصف مطلوب";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه ⚠️",
        text: "يجب تسجيل الدخول قبل تعديل الطلب",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setIsSubmitting(true);

    const errorMsg = validateForm();
    if (errorMsg) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه ⚠️",
        text: errorMsg,
        confirmButtonColor: "#f59e0b",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/serviceRequset/attractor/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientId: session.user.id,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم تعديل الطلب بنجاح ✅",
          text: "تم تحديث بيانات الخدمة",
          confirmButtonColor: "#0f172a",
        });
        router.push(`/attractor/allServices`);
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ ❌",
          text: "حدث خطأ أثناء تعديل الطلب",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال بالسيرفر ❌",
        text: "تأكد من الاتصال بالإنترنت وحاول مرة أخرى",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="mx-auto mt-10 p-6 bg-white shadow rounded-lg container"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold text-primary mb-6">تعديل الخدمة</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* اسم العميل */}
        <div>
          <Label className="text-lg font-semibold mb-2">اسم العميل</Label>
          <Input
            name="clientName"
            disabled
            value={formData.clientName}
            required
          />
        </div>

        {/* البريد الإلكتروني */}
        <div>
          <Label className="text-lg font-semibold mb-2">
            البريد الإلكتروني
          </Label>
          <Input
            type="email"
            name="clientEmail"
            disabled
            value={formData.clientEmail}
            required
          />
        </div>

        {/* رقم الجوال */}
        <div>
          <Label className="text-lg font-semibold mb-2">رقم الواتس</Label>
          <Input
            type="tel"
            disabled
            name="clientPhone"
            value={formData.clientPhone}
            onChange={(e) => handleChange("clientPhone", e.target.value)}
            dir="rtl"
          />
        </div>

        {/* اختيار الخدمة */}
        <div>
          <Label className="text-lg font-semibold mb-2">اختر الخدمة</Label>
          <Select
            value={formData.serviceId}
            onValueChange={(val) => handleChange("serviceId", val)}
          >
            <SelectTrigger className="w-full" dir="rtl">
              <SelectValue placeholder="-- اختر الخدمة --" />
            </SelectTrigger>
            <SelectContent className="w-full" dir="rtl">
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* الوصف */}
        <div>
          <Label className="text-lg font-semibold mb-2">الوصف</Label>
          <Textarea
            name="description"
            disabled
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* الميزانية */}
        <div>
          <Label className="text-lg font-semibold mb-2">
            الميزانية بالدولار
          </Label>
          <Input
            type="number"
            step="0.01"
            name="budget"
            value={formData.budget}
            onChange={(e) => handleChange("budget", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-lg font-semibold mb-2">المدة المطلوبة</Label>
          <Input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>

        {/* ✅ تغيير حالة الطلب */}
        <div>
          <Label className="text-lg font-semibold mb-2">حالة الطلب</Label>
          <Select
            value={formData.status}
            onValueChange={(val) => handleChange("status", val)}
          >
            <SelectTrigger className="w-full" dir="rtl">
              <SelectValue placeholder="-- اختر الحالة --" />
            </SelectTrigger>
            <SelectContent className="w-full" dir="rtl">
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="assigned">تم التعيين</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* زر التعديل */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري التعديل...
            </div>
          ) : (
            "تعديل الخدمة"
          )}
        </Button>
      </form>
    </div>
  );
}
