"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import {
  User,
  Globe,
  Landmark,
  Share2,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  ExternalLink,
  Settings2,
  Video,
} from "lucide-react";

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
import { MultiUploader } from "./MultiUploader";
import { Switch } from "./ui/switch";

// ✅ مخطط البيانات
const companySchema = z.object({
  name: z.string().min(3, "اسم الشركة مطلوب"),
  phoneToCall: z.string().min(5, "رقم الهاتف مطلوب"),
  phoneToBank: z.string().optional(),
  email: z
    .string()
    .email("بريد إلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  workingHours: z.string().optional(),
  accountNumber: z.string().optional(),
  ibanShekel: z.string().optional(),
  ibanDinar: z.string().optional(),
  ibanDollar: z.string().optional(),
  videoUrl: z.string().url("رابط فيديو غير صالح").optional().or(z.literal("")),
  managerMessage: z.string().optional(),
  facebookUrl: z
    .string()
    .url("رابط فيسبوك غير صالح")
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .url("رابط إنستغرام غير صالح")
    .optional()
    .or(z.literal("")),
  twitterUrl: z
    .string()
    .url("رابط تويتر غير صالح")
    .optional()
    .or(z.literal("")),
  whatsappUrl: z
    .string()
    .url("رابط واتساب غير صالح")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("رابط لينكدإن غير صالح")
    .optional()
    .or(z.literal("")),
  tiktokUrl: z
    .string()
    .url("رابط تيك توك غير صالح")
    .optional()
    .or(z.literal("")),
  geminiGenApiKey: z.string().optional(),
  useQueueSystem: z.boolean().default(false),
});

type CompanyFormValues = z.infer<typeof companySchema>;


const EditCompanyInfo = ({
  company,
}: {
  company: Partial<CompanyFormValues>;
}) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name ?? "",
      phoneToCall: company.phoneToCall ?? "",
      phoneToBank: company.phoneToBank ?? "",
      email: company.email ?? "",
      address: company.address ?? "",
      workingHours: company.workingHours ?? "",
      accountNumber: company.accountNumber ?? "",
      ibanShekel: company.ibanShekel ?? "",
      ibanDinar: company.ibanDinar ?? "",
      ibanDollar: company.ibanDollar ?? "",
      videoUrl: company.videoUrl ?? "",
      managerMessage: company.managerMessage ?? "",
      facebookUrl: company.facebookUrl ?? "",
      instagramUrl: company.instagramUrl ?? "",
      twitterUrl: company.twitterUrl ?? "",
      whatsappUrl: company.whatsappUrl ?? "",
      linkedinUrl: company.linkedinUrl ?? "",
      tiktokUrl: company.tiktokUrl ?? "",
      geminiGenApiKey: company.geminiGenApiKey ?? "",
      useQueueSystem: company.useQueueSystem ?? false,
    },
  });

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
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
          customClass: {
            popup: "rounded-3xl border-none shadow-2xl",
            confirmButton: "bg-primary rounded-xl px-8",
          },
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
        customClass: {
          popup: "rounded-3xl border-none shadow-2xl",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({
    icon: Icon,
    title,
    desc,
  }: {
    icon: any;
    title: string;
    desc: string;
  }) => (
    <div className="mb-6 flex items-start gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
      <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-primary">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-5xl mx-auto" dir="rtl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <SectionHeader
              icon={User}
              title="المعلومات الأساسية"
              desc="المعلومات التي تظهر في ترويثة الموقع وقسم اتصل بنا."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <Globe size={14} className="text-slate-400" />
                      اسم الشركة
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أروكيدة للتقنية"
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneToCall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      رقم الهاتف (للاتصال)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+970 ..."
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <Mail size={14} className="text-slate-400" />
                      البريد الإلكتروني
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@orchida.com"
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <MapPin size={14} className="text-slate-400" />
                      العنوان بالتفصيل
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="فلسطين، غزة، مول الرحاب"
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workingHours"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <Clock size={14} className="text-slate-400" />
                      ساعات العمل الرسمية
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="السبت - الخميس: 9:00 ص - 5:00 م"
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 2: Bank Details */}
          <div className="space-y-6">
            <SectionHeader
              icon={Landmark}
              title="بيانات التحويل البنكي"
              desc="المعلومات البنكية اللازمة لاستقبال رسوم الدورات والخدمات."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <CreditCard size={14} className="text-slate-400" />
                      رقم الحساب
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل رقم الحساب"
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneToBank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      هاتف تأكيد التحويل (واتساب)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+970 ..."
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                        dir="ltr"
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
                    <FormLabel className="text-xs font-bold text-slate-400 uppercase">
                      IBAN (ILS - شيكل)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                        dir="ltr"
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
                    <FormLabel className="text-xs font-bold text-slate-400 uppercase">
                      IBAN (USD - دولار)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                        dir="ltr"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ibanDinar"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold text-slate-400 uppercase">
                      IBAN (JOD - دينار)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                        dir="ltr"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 3: Social Media */}
          <div className="space-y-6">
            <SectionHeader
              icon={Share2}
              title="وسائل التواصل الاجتماعي"
              desc="روابط الحسابات الرسمية للشركة على المنصات المختلفة."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                {
                  name: "facebookUrl",
                  label: "فيسبوك",
                  placeholder: "https://facebook.com/...",
                },
                {
                  name: "instagramUrl",
                  label: "إنستغرام",
                  placeholder: "https://instagram.com/...",
                },
                {
                  name: "twitterUrl",
                  label: "تويتر / X",
                  placeholder: "https://x.com/...",
                },
                {
                  name: "whatsappUrl",
                  label: "واتساب",
                  placeholder: "https://wa.me/...",
                },
                {
                  name: "linkedinUrl",
                  label: "لينكدإن",
                  placeholder: "https://linkedin.com/...",
                },
                {
                  name: "tiktokUrl",
                  label: "تيك توك",
                  placeholder: "https://tiktok.com/...",
                },
              ].map((social) => (
                <FormField
                  key={social.name}
                  control={form.control}
                  name={social.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                        <ExternalLink size={14} className="text-slate-400" />
                        {social.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={social.placeholder}
                          {...field}
                          disabled={!isEditing}
                          className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                          dir="ltr"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Section 4: AI Settings */}
          <div className="space-y-6">
            <SectionHeader
              icon={Settings2}
              title="إعدادات الذكاء الاصطناعي"
              desc="إعدادات الربط مع خدمات توليد الفيديو والصور."
            />
            <div className="grid grid-cols-1 gap-y-6">
              <FormField
                control={form.control}
                name="geminiGenApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <CreditCard size={14} className="text-slate-400" />
                      GeminiGen API Key
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل مفتاح الـ API الخاص بـ GeminiGen"
                        {...field}
                        disabled={!isEditing}
                        className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                        dir="ltr"
                        type="password"
                      />
                    </FormControl>
                    <p className="text-[10px] text-slate-400 mt-1">
                      سيتم استخدامه لعمليات توليد الفيديو والصور وفحص الرصيد.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 5: Media Content */}
          <div className="space-y-6">
            <SectionHeader
              icon={MessageSquare}
              title="المحتوى والمدير"
              desc="كلمة المدير العام والصورة/الفيديو التعريفي للشركة."
            />
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="managerMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      💬 كلمة المدير
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل نص كلمة المدير العام..."
                        {...field}
                        disabled={!isEditing}
                        className="rounded-2xl border-slate-200 focus:ring-primary/20 min-h-[150px] resize-none"
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
                    <FormLabel className="flex items-center gap-2 font-bold text-slate-700">
                      <Video size={14} className="text-slate-400" />
                      الصورة / الفيديو التعريفي (سيظهر في قسم 'من نحن')
                    </FormLabel>
                    <FormControl>
                      <div
                        className={
                          !isEditing ? "opacity-60 pointer-events-none" : ""
                        }
                      >
                        <MultiUploader
                          bucket="publicFiles"
                          onChange={(urls) => field.onChange(urls[0] ?? "")}
                          initialUrls={field.value ? [field.value] : []}
                          maxFiles={1}
                          required={true}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 6: Advanced Settings */}
          <div className="space-y-6">
            <SectionHeader
              icon={Settings2}
              title="إعدادات النظام المتقدمة"
              desc="التحكم في أنظمة التسجيل والقبول الجديدة."
            />
            <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10">
              <FormField
                control={form.control}
                name="useQueueSystem"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl p-4 gap-4">
                    <div className="space-y-1">
                      <FormLabel className="text-lg font-bold text-slate-800">
                        تفعيل نظام "تقديم الطلبات" والتشعيب اليدوي
                      </FormLabel>
                      <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                        عند التفعيل، لن يتمكن الطلاب من اختيار الشعبة مباشرة. سيسجل الطالب "طلباً" للدورة، ويقوم المنسق بتوزيعه يدوياً لاحقاً.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                        className="scale-125 data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="sticky bottom-10 z-20">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-3xl shadow-2xl flex items-center justify-between">
              <div>
                {!isEditing ? (
                  <p className="text-sm text-slate-500 mr-4 font-medium italic">
                    * اضغط على زر "تعديل البيانات" للبدء في التغيير.
                  </p>
                ) : (
                  <p className="text-sm text-primary mr-4 font-bold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    أنت في وضع التعديل الآن
                  </p>
                )}
              </div>

              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-10 h-12 rounded-2xl shadow-lg transition-all active:scale-95 text-lg font-bold"
                >
                  تعديل البيانات
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      form.reset();
                      setIsEditing(false);
                    }}
                    className="hover:bg-slate-100 rounded-2xl px-8 font-bold text-slate-600"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 h-12 rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-95 font-bold text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin ml-2" /> جاري الحفظ...
                      </>
                    ) : (
                      "حفظ التغييرات"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditCompanyInfo;
