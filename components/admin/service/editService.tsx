"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useRouter, useParams } from "next/navigation";
import { Service } from "./servicesPage";
import { useEdgeStore } from "@/lib/edgestore";
import { SingleImageDropzone } from "@/src/components/upload/single-image";
import { UploaderProvider } from "@/src/components/upload/uploader-provider";
import Image from "next/image";

const schema = z.object({
  name: z.string().min(2, "اسم الخدمة مطلوب"),
  description: z.string().min(5, "الوصف مطلوب"),
  icon: z.string().min(1, "يجب رفع صورة للخدمة"),
  isActive: z.boolean(),
});

export default function EditServiceForm({
  service,
  userId,
}: {
  service: Service;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const { edgestore } = useEdgeStore();

  const router = useRouter();
  const params = useParams();
  const serviceId = params.id;

  type ServiceFormType = z.infer<typeof schema>;

  const form = useForm<ServiceFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: service.name,
      description: service.description ?? "",
      icon: service.icon ?? "",
      isActive: service.isActive,
    },
  });

  // ✅ تعديل الخدمة
  const onSubmit = async (data: ServiceFormType) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        icon: "success",
        title: "تم التعديل",
        text: "تم تعديل الخدمة بنجاح",
        confirmButtonColor: "#2563eb",
      });

      router.push(`/admin/${userId}/services`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء تعديل الخدمة",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto bg-white p-6 rounded-lg">
      <h2 className="text-3xl text-primary font-bold mb-6">تعديل الخدمة</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* اسم الخدمة */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الخدمة</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: تصميم" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* وصف الخدمة */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وصف الخدمة</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="اكتب وصفًا مختصرًا عن الخدمة"
                    className="h-28"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* رفع صورة الخدمة */}
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>صورة الخدمة</FormLabel>

                {/* Image Uploader */}
                <FormControl>
                  <UploaderProvider
                    autoUpload={true}
                    uploadFn={async ({ file, onProgressChange }) => {
                      const res = await edgestore.publicFiles.upload({
                        file,
                        onProgressChange: (progress) => {
                          onProgressChange(progress);
                        },
                      });
                      return { url: res.url };
                    }}
                    onUploadCompleted={(completedFile) => {
                      if (completedFile.url) {
                        field.onChange(completedFile.url);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-4">
                      <SingleImageDropzone
                        width={200}
                        height={200}
                        dropzoneOptions={{
                          maxSize: 1024 * 1024 * 4,
                        }}
                      />
                    </div>
                  </UploaderProvider>
                </FormControl>
                <FormMessage />

                {/* Display Current Image Below Uploader */}
                {field.value && field.value.startsWith("http") && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      الصورة الحالية:
                    </p>
                    <div className="relative w-40 h-40 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                      <Image
                        src={field.value}
                        alt="Current Service Image"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {/* Fallback for legacy text icons */}
                {field.value && !field.value.startsWith("http") && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      الأيقونة الحالية (نص):
                    </p>
                    <span className="text-gray-600 font-mono text-sm">
                      {field.value}
                    </span>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* حالة الخدمة */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormLabel className="cursor-pointer">الخدمة فعّالة؟</FormLabel>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* زر الإرسال */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري التعديل..." : "تعديل الخدمة"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
