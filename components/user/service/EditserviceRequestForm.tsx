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

const servicesMap: Record<string, string> = {
  design: "تصميم",
  development: "تطوير",
  marketing: "تسويق",
};

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
    duration: service.duration || "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.clientName.trim()) return "اسم العميل مطلوب";
    if (!formData.clientEmail.includes("@"))
      return "البريد الإلكتروني غير صالح";
    if (!formData.clientPhone.trim()) return "رقم الهاتف مطلوب";
    if (!formData.serviceId) return "يجب اختيار خدمة";
    if (!formData.description.trim()) return "الوصف مطلوب";
    if (!formData.budget.trim()) return "الميزانية مطلوبة";
    if (!formData.duration.trim()) return "المدة مطلوبة";
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
      // ✅ تعديل الطلب باستخدام PUT
      const res = await fetch(`/api/serviceRequset/${service.id}`, {
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
        router.push(`/${session?.user?.id}/services`);
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
      className="mx-auto  mt-10 p-6 bg-white shadow rounded-lg container"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold text-primary mb-6">تعديل الخدمة</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* اسم العميل */}
        <div>
          <Label className="text-lg font-semibold mb-2">اسم العميل</Label>
          <Input name="clientName" disabled value={formData.clientName} />
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
          />
        </div>

        {/* رقم الجوال */}
        <div>
          <Label className="text-lg font-semibold mb-2">رقم الواتس</Label>
          <Input
            type="tel"
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
              {/* ✅ عرض القائمة الثابتة */}
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
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
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

        {/* زر التعديل */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              جاري التعديل...
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </div>
          ) : (
            "تعديل الخدمة"
          )}
        </Button>
      </form>
    </div>
  );
}
