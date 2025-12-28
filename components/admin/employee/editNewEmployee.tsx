"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Employee } from "./employees";

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  specialty: z.string().min(2, "المجال مطلوب"),
  email: z.string().email("إيميل غير صالح").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export default function EditEmployee({
  initialEmployee,
  userId,
}: {
  initialEmployee: Employee;
  userId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialEmployee?.name || "",
      specialty: initialEmployee?.specialty || "",
      email: initialEmployee?.email || "",
      phone: initialEmployee?.phone || "",
    },
  });

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${initialEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("فشل التعديل");

      Swal.fire({
        icon: "success",
        title: "تم التعديل",
        text: "تم تعديل بيانات الموظف بنجاح",
      });
      router.push(`/admin/${userId}/employees`);
    } catch (error) {
      Swal.fire({ icon: "error", title: "خطأ", text: "حدث خطأ أثناء التعديل" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg mx-auto">
      <h2 className="text-3xl text-primary font-bold mb-6">
        تعديل بيانات الموظف
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* الاسم */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الموظف</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الموظف" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* المجال */}
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المجال</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: برمجة، تصميم..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* الإيميل */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الإيميل (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="example@mail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* الهاتف */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="0599xxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* زر التعديل */}
          <Button
            type="submit"
            className="w-full text-white font-bold flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {isSubmitting ? "جاري التعديل..." : "تعديل الموظف"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
