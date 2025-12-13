"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";

const formSchema = z.object({
  currentPassword: z.string().min(1, "أدخل كلمة المرور الحالية"),
  newPassword: z
    .string()
    .min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
});

export default function ChangePasswordPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setPending(true);

    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    setPending(false);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.message ?? "حدث خطأ غير متوقع",
        confirmButtonText: "حسناً",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "تم تغيير كلمة المرور",
      text: "تم تغيير كلمة المرور بنجاح",
      confirmButtonText: "حسناً",
    }).then(() => {
      router.push("/");
    });
  };

  return (
    <div className="container mx-auto mt-10" dir="rtl">
      <h2 className="text-3xl text-primary font-semibold mb-6 text-right">
        تغيير كلمة المرور
      </h2>

      <Card className="max-w-md mx-auto p-6">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>كلمة المرور الحالية</Label>
              <Input
                type="password"
                {...form.register("currentPassword")}
                placeholder="********"
              />
            </div>

            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <Input
                type="password"
                {...form.register("newPassword")}
                placeholder="********"
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
