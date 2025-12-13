"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Swal from "sweetalert2";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AddMedia from "./addMedia";

import type { Services } from "../service/servicesPage";

const workSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().optional(),
  serviceId: z.string().min(1, "الخدمة مطلوبة"), // ✅ ربط بالخدمة

  category: z.string().min(2, "الفئة مطلوبة"),
  projectUrl: z.string().url("رابط غير صالح").optional(),
  priceRange: z.string().optional(),
  duration: z.string().optional(),
});

type WorkFormValues = z.infer<typeof workSchema>;

const NewWork = ({ allServices }: { allServices: Services }) => {
  const [loading, setLoading] = React.useState(false);
  const [createdWorkId, setCreatedWorkId] = React.useState<string | null>(null);
  const router = useRouter();

  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      projectUrl: "",
      priceRange: "",
      duration: "",
    },
  });

  const onSubmit = async (values: WorkFormValues) => {
    try {
      setLoading(true);
      const res = await fetch("/api/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setLoading(false);

      if (res.ok) {
        const data = await res.json(); // ✅ الحصول على id
        setCreatedWorkId(data.id);

        Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح ✅",
          text: "تم إنشاء العمل. يمكنك الآن رفع الوسائط.",
          confirmButtonText: "موافق",
        });

        // لا تعمل push مباشرة عشان تقدر ترفع وسائط في نفس الصفحة
        // لو بدك تنقل لصفحة أخرى: router.push(`/admin/works/${data.id}/edit`);
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ ❌",
          text: "حدث خطأ أثناء إضافة العمل",
          confirmButtonText: "إعادة المحاولة",
        });
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تأكد من الاتصال بالخادم وحاول مرة أخرى",
      });
    }
  };

  return (
    <div className="mx-auto mt-10 space-y-8">
      <h2 className="text-2xl font-bold mb-2 text-primary">
        ➕ إضافة عمل جديد
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* العنوان */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل عنوان العمل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* الوصف */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف</FormLabel>
                <FormControl>
                  <Textarea placeholder="أدخل وصف العمل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الخدمة</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val); // ✅ يخزن الـ serviceId
                      const selectedService = allServices.find(
                        (s) => s.id === val
                      );
                      if (selectedService) {
                        form.setValue("category", selectedService.name); // ✅ يخزن الاسم كـ category
                      }
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full" dir="rtl">
                      <SelectValue placeholder="اختر الخدمة" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {allServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* رابط المشروع */}
          <FormField
            control={form.control}
            name="projectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رابط المشروع</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* نطاق السعر */}
          <FormField
            control={form.control}
            name="priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نطاق السعر</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: 500$ - 1000$" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* المدة */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المدة</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: أسبوعين" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* زر الإرسال */}
          <Button
            type="submit"
            className="bg-primary w-full text-center text-white hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
                جاري الحفظ...
              </div>
            ) : (
              "حفظ العمل"
            )}
          </Button>
        </form>
      </Form>

      {/* رفع الوسائط بعد إنشاء العمل */}
      {createdWorkId && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">📷 رفع الوسائط</h3>
          <AddMedia
            workId={createdWorkId}
            onUploaded={() => {
              Swal.fire({
                icon: "success",
                title: "تم رفع الوسائط ✅",
                text: "يمكنك إضافة المزيد أو الانتقال لإدارة الأعمال.",
                confirmButtonText: "موافق",
              });
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/works")}
            >
              إنهاء والعودة للقائمة
            </Button>
            <Button
              onClick={() => router.push(`/admin/works/${createdWorkId}/edit`)}
            >
              الذهاب لتعديل العمل
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewWork;
