"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import { users } from "@/src/db/schema";

const schema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  phone: z.string().min(6, "رقم الهاتف غير صالح"),
  image: z.string().optional(),
});

export type User = InferSelectModel<typeof users>;

export default function EditProfilePage({
  id,
  user,
}: {
  id: string;
  user: User;
}) {
  const [uploading, setUploading] = useState(false);

  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      image: "",
    },
  });

  // ✅ تعبئة البيانات عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
        image: user.image ?? "",
      });

      setPreview(user.image ?? null);
    }
  }, [user, form]);

  // ✅ رفع الصورة
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob!], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.7 // جودة 70%
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: any) => {
    setUploading(true);

    let file = e.target.files?.[0];
    if (!file) return;

    file = await compressImage(file);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/uploadPhotoProfile", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setUploading(false);

    if (!data.url) {
      Swal.fire("خطأ", "فشل رفع الصورة", "error");
      return;
    }

    form.setValue("image", data.url);
    setPreview(data.url);
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    console.log("VALUES BEFORE SEND:", values);

    const res = await fetch(`/api/user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      Swal.fire("خطأ", "حدث خطأ أثناء تحديث البيانات", "error");
      return;
    }

    Swal.fire("تم التحديث", "تم تحديث بياناتك بنجاح", "success").then(() => {
      router.push("/");
    });
  };

  return (
    <div className="container mx-auto mt-10" dir="rtl">
      <h2 className="text-3xl text-primary font-semibold mb-6 text-right">
        تعديل البيانات الشخصية
      </h2>

      <Card className="max-w-md mx-auto p-6">
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* صورة البروفايل */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                {preview ? (
                  <Image src={preview} alt="preview" width={96} height={96} />
                ) : (
                  <span className="text-gray-500 text-sm flex items-center justify-center h-full">
                    No Image
                  </span>
                )}
              </div>
            </div>

            <Input type="file" accept="image/*" onChange={handleImageUpload} />

            {/* الاسم */}
            <div>
              <Label className="mb-2">الاسم</Label>
              <Input {...form.register("name")} />
            </div>

            {/* رقم الهاتف */}
            <div>
              <Label className="mb-2">رقم الهاتف</Label>
              <Input {...form.register("phone")} />
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "جاري رفع الصورة..." : "حفظ التعديلات"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
