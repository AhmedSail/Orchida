"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import { users } from "@/src/db/schema";
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Camera,
  ArrowRight,
  Save,
  MessageSquare,
  Mail,
  Loader2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "next-view-transitions";

const schema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  phone: z.string().min(6, "رقم الهاتف غير صالح"),
  whatsapp: z.string().optional(),
  age: z.string().optional(),
  major: z.string().optional(),
  location: z.string().optional(),
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
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
      age: "",
      major: "",
      location: "",
      image: "",
    },
  });

  // ✅ تعبئة البيانات عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
        whatsapp: user.whatsapp ?? "",
        age: user.age?.toString() ?? "",
        major: user.major ?? "",
        location: user.location ?? "",
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
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/upload/uploadPhotoProfile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.url) throw new Error("Upload failed");

      form.setValue("image", data.url);
      setPreview(data.url);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'تم رفع الصورة بنجاح',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      Swal.fire("خطأ", "فشل رفع الصورة", "error");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    form.setValue("image", "");
    setPreview(null);
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Update failed");

      Swal.fire({
        icon: 'success',
        title: 'تم التحديث بنجاح',
        text: 'تم حفظ تغييراتك في الملف الشخصي',
        confirmButtonText: 'رائع',
        confirmButtonColor: '#3b82f6',
        customClass: { popup: 'rounded-[32px]' }
      }).then(() => {
        router.push(`/${id}/profile`);
      });
    } catch (err) {
      Swal.fire("خطأ", "حدث خطأ أثناء تحديث البيانات", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 py-12 px-4 md:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-bold text-sm">
              <Link href={`/${id}/profile`} className="hover:text-primary transition-colors flex items-center gap-1">
                الملف الشخصي <ArrowRight className="size-3" />
              </Link>
              <span className="text-slate-900 dark:text-white">تعديل البيانات</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white italic">تحديث الملف الشخصي</h1>
          </div>
          
          <Link href={`/${id}/profile`} className="bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 self-start md:self-auto">
             إلغاء التعديل
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[48px] border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-12">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-6 pb-12 border-b border-slate-100 dark:border-zinc-800/50">
               <div className="relative group">
                 <div className="size-32 md:size-40 rounded-[40px] bg-slate-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden flex items-center justify-center relative">
                   <AnimatePresence mode="wait">
                    {uploading ? (
                      <motion.div 
                        key="loader"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10 flex items-center justify-center"
                      >
                        <Loader2 className="size-8 text-primary animate-spin" />
                      </motion.div>
                    ) : null}
                   </AnimatePresence>

                   {preview ? (
                     <Image src={preview} alt="Avatar" width={160} height={160} className="w-full h-full object-cover" unoptimized />
                   ) : (
                     <UserIcon className="size-16 text-slate-300 dark:text-zinc-600" />
                   )}
                 </div>
                 
                 <div className="absolute -bottom-2 -right-2 flex gap-2">
                   <label className="size-10 rounded-2xl bg-primary text-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                     <Camera className="size-5" />
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                   </label>
                   {preview && (
                     <button type="button" onClick={removeImage} className="size-10 rounded-2xl bg-red-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                       <Trash2 className="size-5" />
                     </button>
                   )}
                 </div>
               </div>
               <div className="text-center">
                 <h3 className="font-bold text-slate-800 dark:text-white">الصورة الشخصية</h3>
                 <p className="text-sm text-slate-400 font-medium">يفضل استخدام صورة مربعة بجودة عالية</p>
               </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Name */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                   <UserIcon className="size-4 text-blue-500" /> الاسم الكامل
                 </Label>
                 <Input {...form.register("name")} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all" />
                 {form.formState.errors.name && <p className="text-red-500 text-xs font-bold mt-1 pr-2">{form.formState.errors.name.message}</p>}
               </div>

               {/* Email (Readonly for reference) */}
               <div className="space-y-2 opacity-60">
                 <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                   <Mail className="size-4 text-purple-500" /> البريد الإلكتروني (لا يمكن تعديله)
                 </Label>
                 <Input value={user.email ?? ""} readOnly className="h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-bold cursor-not-allowed" />
               </div>

               {/* Phone */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                   <Phone className="size-4 text-green-500" /> رقم الهاتف
                 </Label>
                 <Input {...form.register("phone")} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all text-left" dir="ltr" />
                 {form.formState.errors.phone && <p className="text-red-500 text-xs font-bold mt-1 pr-2">{form.formState.errors.phone.message}</p>}
               </div>

               {/* WhatsApp */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                   <MessageSquare className="size-4 text-emerald-500" /> رقم الواتساب
                 </Label>
                 <Input {...form.register("whatsapp")} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all text-left" dir="ltr" />
               </div>

               {/* Age */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                   <Calendar className="size-4 text-indigo-500" /> العمر
                 </Label>
                 <Input {...form.register("age")} type="number" className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all" />
               </div>

               {/* Major */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                   <GraduationCap className="size-4 text-amber-500" /> التخصص الدراسي
                 </Label>
                 <Input {...form.register("major")} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all" />
               </div>

               {/* Location */}
               <div className="col-span-1 md:col-span-2 space-y-2">
                 <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 pr-2">
                   <MapPin className="size-4 text-red-500" /> الدولة والمدينة
                 </Label>
                 <Input {...form.register("location")} placeholder="مثال: فلسطين - غزة" className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-primary focus:border-primary font-bold transition-all" />
               </div>

            </div>

            {/* Submit Button */}
            <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4 border-t border-slate-100 dark:border-zinc-800/50">
               <Button 
                 type="submit" 
                 disabled={uploading || saving}
                 className="h-16 px-12 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black shadow-2xl shadow-primary/30 gap-3 min-w-[240px] text-lg transition-all hover:-translate-y-1"
               >
                 {saving ? <Loader2 className="size-6 animate-spin" /> : <Save className="size-6" />}
                 {saving ? "جاري الحفظ..." : "حفظ التغييرات النهائية"}
               </Button>
               <p className="text-slate-400 font-bold text-sm italic">سيتم تحديث بياناتك فور النقر على حفظ</p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
