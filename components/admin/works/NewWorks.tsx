"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { 
  Loader2, 
  PlusCircle, 
  Info, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  DollarSign, 
  Clock, 
  Briefcase,
  Layers,
  ArrowLeft
} from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import type { Services } from "../service/servicesPage";
import { MultiUploader } from "@/components/MultiUploader";
import { SingleUploader } from "@/components/SingleUploader";

// ✅ Schema
const workSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().optional(),
  serviceId: z.string().min(1, "الخدمة مطلوبة"),
  category: z.string().min(2, "الفئة مطلوبة"),
  projectUrl: z.string().url("رابط غير صالح").or(z.literal("")).optional(),
  priceRange: z.string().optional(),
  duration: z.string().optional(),
  imageUrl: z.string().url().min(1, "الصورة الرئيسية مطلوبة"),
  mediaUrls: z.array(z.string().url()).optional(),
});

type WorkFormValues = z.infer<typeof workSchema>;

const NewWorks = ({
  allServices,
  userId,
  role,
}: {
  allServices: Services;
  userId: string;
  role: string;
}) => {
  const [loading, setLoading] = useState(false);
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
      imageUrl: "",
      mediaUrls: [],
    },
  });

  const buildMediaFileObject = (url: string) => {
    const filename = url.split("/").pop() || "";
    const ext = filename.split(".").pop()?.toLowerCase();

    let type = "file";
    let mimeType = "application/octet-stream";

    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      type = "image";
      mimeType = "image/" + ext;
    } else if (["mp4", "mov", "avi"].includes(ext || "")) {
      type = "video";
      mimeType = "video/" + ext;
    } else if (ext === "pdf") {
      type = "document";
      mimeType = "application/pdf";
    }

    return {
      url,
      type,
      filename,
      mimeType,
      size: 0,
    };
  };

  const getRawUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("proxy-file?url=")) {
      return decodeURIComponent(url.split("proxy-file?url=")[1])
        .trim()
        .replace(/\s/g, "");
    }
    return url.trim().replace(/\s/g, "");
  };

  const onSubmit = async (values: WorkFormValues) => {
    setLoading(true);
    try {
      if (!values.imageUrl || values.imageUrl.length === 0) {
        Swal.fire({
          icon: "error",
          title: "خطأ في الإدخال",
          text: "يجب إضافة صورة رئيسية قبل حفظ العمل.",
        });
        setLoading(false);
        return;
      }

      const mainUrl = values.imageUrl;
      const ext = mainUrl.split(".").pop()?.toLowerCase();

      let mainType = "file";
      if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
        mainType = "image";
      } else if (["mp4", "mov", "avi"].includes(ext || "")) {
        mainType = "video";
      }

      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          imageUrl: getRawUrl(mainUrl),
          type: mainType,
          mediaFiles: values.mediaUrls?.map((url) =>
            buildMediaFileObject(getRawUrl(url))
          ),
          uploaderId: userId,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح ✅",
          text: "تمت إضافة العمل إلى معرض أعمالك بنجاح.",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => {
          router.push(`/${role}/${userId}/works`);
        }, 2000);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل حفظ العمل");
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
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-primary mb-2"
          >
            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <PlusCircle size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">بوابة إدارة المحتوى</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-gray-900"
          >
            إضافة عمل <span className="text-primary">إبداعي</span> جديد
          </motion.h1>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold text-sm bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm"
        >
          <ArrowLeft size={16} />
          العودة للمقالات
        </motion.button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 📝 Main Info Section */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>
                
                <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <Info className="text-primary size-5" />
                  المعلومات الأساسية
                </h2>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           العنوان
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل عنواناً جذاباً لمشروعك..." 
                            className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-lg font-bold"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                          قصة المشروع ووصفه
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="اشرح الفكرة، التحديات، وكيف حققت النجاح..." 
                            className="rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 min-h-[200px] text-base leading-relaxed font-medium p-6"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* 📂 Additional Media Section */}
              <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-50">
                <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <Layers className="text-primary size-5" />
                  الوسائط الإضافية
                </h2>
                
                <FormField
                  control={form.control}
                  name="mediaUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">
                        قم برفع صور أو فيديوهات إضافية لتوثيق العمل
                      </FormLabel>
                      <FormControl>
                        <MultiUploader
                          bucket="publicFiles"
                          onChange={(files) => field.onChange(files)}
                          initialUrls={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            </div>

            {/* 🛠️ Sidebar Settings Section */}
            <div className="lg:col-span-1 space-y-8">
              {/* Main Media (The Poster/Hero) */}
              <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-50">
                <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                  <ImageIcon className="text-primary size-5" />
                  الصورة الرئيسية
                </h2>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SingleUploader
                          bucket="publicFiles"
                          onChange={(url) => field.onChange(url)}
                          initialUrl={field.value ?? ""}
                          required={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Details & Metadata */}
              <section className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                <h2 className="text-lg font-black mb-8 flex items-center gap-3">
                  <Briefcase className="text-primary size-5" />
                  تفاصيل المشروع
                </h2>
                
                <div className="space-y-6">
                  {/* Service Selection */}
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          نوع الخدمة
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              const selectedService = allServices.find((s) => s.id === val);
                              if (selectedService) form.setValue("category", selectedService.name);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10 text-white focus:ring-primary/40" dir="rtl">
                              <SelectValue placeholder="اختر الخدمة" />
                            </SelectTrigger>
                            <SelectContent dir="rtl" className="rounded-xl border-none shadow-2xl">
                              {allServices.map((service) => (
                                <SelectItem key={service.id} value={service.id} className="rounded-lg">
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

                  {/* Project URL */}
                  <FormField
                    control={form.control}
                    name="projectUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <LinkIcon size={12} className="text-primary" />
                          رابط المشروع المعاين
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://..." 
                            className="h-12 rounded-xl bg-white/5 border-white/10 text-white focus:ring-primary/40"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price & Duration Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="priceRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <DollarSign size={12} className="text-primary" />
                            نطاق السعر (اختياري)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="مثال: 500$ - 1000$" 
                              className="h-12 rounded-xl bg-white/5 border-white/10 text-white focus:ring-primary/40"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Clock size={12} className="text-primary" />
                            مدة التنفيذ
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="مثال: أسبوعين" 
                              className="h-12 rounded-xl bg-white/5 border-white/10 text-white focus:ring-primary/40"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                   <Button
                    type="submit"
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" /> جاري الحفظ...
                      </div>
                    ) : (
                      "نشر العمل الآن"
                    )}
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewWorks;
