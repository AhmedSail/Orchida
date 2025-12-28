"use client";

import React, { useState } from "react";
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
import { MultiUploader } from "./MultiUploader";

type CompanyFormValues = {
  name: string;
  phone: string;
  accountNumber?: string;
  ibanShekel?: string;
  ibanDinar?: string;
  ibanDollar?: string;
  videoUrl?: string;
  managerMessage?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
};

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
  facebookUrl: z.string().url("رابط فيسبوك غير صالح").optional(),
  instagramUrl: z.string().url("رابط إنستغرام غير صالح").optional(),
  twitterUrl: z.string().url("رابط تويتر غير صالح").optional(),
  whatsappUrl: z.string().url("رابط واتساب غير صالح").optional(),
  linkedinUrl: z.string().url("رابط لينكدإن غير صالح").optional(),
  tiktokUrl: z.string().url("رابط تيك توك غير صالح").optional(),
});

const EditCompanyInfo = ({
  company,
}: {
  company: Partial<CompanyFormValues>;
}) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name ?? "",
      phone: company.phone ?? "",
      accountNumber: company.accountNumber ?? "",
      ibanShekel: company.ibanShekel ?? "",
      ibanDinar: company.ibanDinar ?? "",
      ibanDollar: company.ibanDollar ?? "",
      videoUrl: company.videoUrl ?? "",
      managerMessage: company.managerMessage ?? "",
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
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
        setIsEditing(false);
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
                  <Input
                    placeholder="أدخل اسم الشركة"
                    {...field}
                    disabled={!isEditing}
                  />
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
                  <Input
                    placeholder="أدخل رقم الهاتف"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* باقي الحقول بنفس النمط */}
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الحساب</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رقم الحساب البنكي"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ibanShekel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN (شيكل)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رقم IBAN بالشيكل"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ibanDinar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN (دينار)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رقم IBAN بالدينار"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ibanDollar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN (دولار)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رقم IBAN بالدولار"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الصورة / الفيديو الرئيسي</FormLabel>
                <FormControl>
                  <MultiUploader
                    bucket="publicFiles"
                    onChange={(urls) => field.onChange(urls[0] ?? "")} // نخزن رابط واحد فقط
                    initialUrls={field.value ? [field.value] : []} // نحول string إلى array
                    maxFiles={1}
                    required={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="managerMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>💬 كلمة المدير</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="أدخل كلمة المدير"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="facebookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>🌐 رابط فيسبوك</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رابط صفحة الفيسبوك"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagramUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>📸 رابط إنستغرام</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رابط حساب إنستغرام"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>🐦 رابط تويتر</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رابط حساب تويتر"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsappUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>📱 رابط واتساب</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رابط واتساب"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>💼 رابط لينكدإن</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رابط لينكدإن"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tiktokUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>🎵 رابط تيك توك</FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل رابط تيك توك"
                    {...field}
                    disabled={!isEditing}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* أزرار */}
          {!isEditing ? (
            <Button
              type="button" // ✅ زر عادي مش submit
              className="w-full"
              onClick={() => setIsEditing(true)}
            >
              تعديل البيانات
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="submit" // ✅ هذا فقط اللي يحفظ
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

              {/* زر إلغاء التعديل */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(false)}
              >
                إلغاء
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default EditCompanyInfo;
