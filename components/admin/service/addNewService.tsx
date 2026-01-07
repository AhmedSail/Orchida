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
import { useRouter } from "next/navigation";
import { useEdgeStore } from "@/lib/edgestore";
import { SingleImageDropzone } from "@/src/components/upload/single-image";
import { UploaderProvider } from "@/src/components/upload/uploader-provider";

const schema = z.object({
  name: z.string().min(2, "اسم الخدمة مطلوب"),
  description: z.string().min(5, "الوصف مطلوب"),
  icon: z.string().min(1, "يجب رفع صورة للخدمة"),
  isActive: z.boolean(),
});

export default function AddServiceForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  type ServiceFormType = z.infer<typeof schema>;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: ServiceFormType) => {
    setLoading(true);

    try {
      // The icon field should already contain the URL from the uploader
      const res = await fetch("/api/services", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        icon: "success",
        title: "تمت الإضافة",
        text: "تم إضافة الخدمة بنجاح",
        confirmButtonColor: "#2563eb",
      });
      router.push(`/admin/${userId}/services`);
      form.reset();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء إضافة الخدمة",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" mx-auto bg-white p-6 rounded-lg ">
      <h2 className="text-3xl text-primary font-bold mb-6">إضافة خدمة جديدة</h2>

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
                <FormControl>
                  {/* Wrap the Dropzone with UploaderProvider */}
                  <UploaderProvider
                    autoUpload={true}
                    uploadFn={async ({ file, onProgressChange }) => {
                      // Upload using EdgeStore
                      const res = await edgestore.publicFiles.upload({
                        file,
                        onProgressChange: (progress) => {
                          onProgressChange(progress);
                        },
                      });
                      return { url: res.url };
                    }}
                    onUploadCompleted={(completedFile) => {
                      // Once upload is complete, set the URL to the form field
                      if (completedFile.url) {
                        field.onChange(completedFile.url);
                      }
                    }}
                  >
                    <SingleImageDropzone
                      width={200}
                      height={200}
                      dropzoneOptions={{
                        maxSize: 1024 * 1024 * 4, // 4MB max
                      }}
                    />
                  </UploaderProvider>
                </FormControl>
                <FormMessage />
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
            {loading ? "جاري الإضافة..." : "إضافة الخدمة"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
