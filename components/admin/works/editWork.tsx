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
import { Services } from "../service/servicesPage";

// ✅ مكونات Select من shadcn/ui
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { works } from "@/src/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Checkbox } from "@/components/ui/checkbox";

// ✅ مخطط التحقق باستخدام Zod
const workSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().optional(),
  serviceId: z.string().min(2, "الخدمة مطلوبة"),
  category: z.string().min(2, "الفئة مطلوبة"),
  projectUrl: z.string().url("رابط غير صالح").optional(),
  priceRange: z.string().optional(),
  duration: z.string().optional(),
  isActive: z.boolean().default(true),
});

type WorkFormValues = z.infer<typeof workSchema>;
export type Works = InferSelectModel<typeof works>;
const EditWork = ({
  allServices,
  foundWork,
}: {
  allServices: Services;
  foundWork: Works;
}) => {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const form = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema) as any,
    defaultValues: {
      title: foundWork.title,
      description: foundWork.description ?? "",
      serviceId: foundWork.serviceId,
      category: foundWork.category,
      projectUrl: foundWork.projectUrl ?? "",
      priceRange: foundWork.priceRange ?? "",
      duration: foundWork.duration ?? "",
      isActive: foundWork.isActive,
    },
  });

  const onSubmit = async (values: WorkFormValues) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/work/${foundWork.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setLoading(false);
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم التعديل بنجاح ✅",
          text: "تم تعديل العمل بنجاح، سيتم تحويلك لتعديل الوسائط",
          confirmButtonText: "موافق",
        });
        // ✅ تحويل لصفحة تعديل الوسائط
        router.push(`/admin/works/${foundWork.id}/media/edit`);
        form.reset();
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ ❌",
          text: "حدث خطأ أثناء تعديل العمل",
          confirmButtonText: "إعادة المحاولة",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تأكد من الاتصال بالخادم وحاول مرة أخرى",
      });
    }
  };

  return (
    <div className="mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-primary">
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
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>نشط</FormLabel>
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
                جاري التعديل...
              </div>
            ) : (
              "تعديل العمل"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditWork;
