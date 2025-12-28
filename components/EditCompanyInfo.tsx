"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// ✅ مخطط البيانات
const companySchema = z.object({
  name: z.string().min(3, "اسم الشركة مطلوب"),
  phone: z.string().min(5, "رقم الهاتف مطلوب"),
  accountNumber: z.string().optional(),
  ibanShekel: z.string().optional(),
  ibanDinar: z.string().optional(),
  ibanDollar: z.string().optional(),
  videoUrl: z.string().url("رابط فيديو غير صالح").optional(),
  managerMessage: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const EditCompanyInfo = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      phone: "",
      accountNumber: "",
      ibanShekel: "",
      ibanDinar: "",
      ibanDollar: "",
      videoUrl: "",
      managerMessage: "",
    },
  });

  // ✅ تحميل البيانات من الـ API عند فتح الصفحة
  useEffect(() => {
    const fetchCompany = async () => {
      const res = await fetch("/api/company");
      const data = await res.json();
      form.reset(data); // تحميل البيانات في الفورم
    };
    fetchCompany();
  }, [form]);

  const onSubmit = async (values: CompanyFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح ✅",
          text: data.message,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-primary">🏢 بيانات الشركة</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* اسم الشركة */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الشركة</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الشركة" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* رقم الهاتف */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم الهاتف" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* رقم الحساب */}
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الحساب</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم الحساب البنكي" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* IBAN شيكل */}
          <FormField
            control={form.control}
            name="ibanShekel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN (شيكل)</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم IBAN بالشيكل" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* IBAN دينار */}
          <FormField
            control={form.control}
            name="ibanDinar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN (دينار)</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم IBAN بالدينار" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* IBAN دولار */}
          <FormField
            control={form.control}
            name="ibanDollar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN (دولار)</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم IBAN بالدولار" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* فيديو تعريفي */}
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>🎥 فيديو تعريفي</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رابط الفيديو التعريفي" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* كلمة المدير */}
          <FormField
            control={form.control}
            name="managerMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>💬 كلمة المدير</FormLabel>
                <FormControl>
                  <Textarea placeholder="أدخل كلمة المدير" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* زر الحفظ */}
          <Button
            type="submit"
            className="bg-primary w-full text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> جاري الحفظ...
              </>
            ) : (
              "حفظ البيانات"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EditCompanyInfo;
