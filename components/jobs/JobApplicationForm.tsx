"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { submitApplication } from "@/app/actions/jobs";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MessageCircle,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Send,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
import { Progress } from "@/components/ui/progress";

interface JobApplicationFormProps {
  jobId: string;
  userId: string;
  initialData?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

export default function JobApplicationForm({
  jobId,
  userId,
  initialData,
}: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    whatsapp: "",
    major: "",
    education: "",
    experienceYears: "",
    gender: "",
    location: "",
    age: "",
    notes: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateWhatsapp = (number: string) => {
    // allow digits, +, spaces, dashes, and parentheses
    const whatsappRegex = /^[\d+ \-()]{9,20}$/;
    return whatsappRegex.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    // Explicit Validation
    if (!formData.gender) {
      toast.error("يرجى اختيار الجنس");
      setLoading(false);
      return;
    }

    if (formData.whatsapp && !validateWhatsapp(formData.whatsapp)) {
      toast.error("رقم الواتساب غير صحيح، يرجى التأكد من الرقم");
      setLoading(false);
      return;
    }

    if (!cvFile) {
      toast.error("يرجى إرفاق السيرة الذاتية");
      setLoading(false);
      return;
    }

    if (cvFile.size > 5 * 1024 * 1024) {
      toast.error("حجم السيرة الذاتية كبير جداً (الأقصى 5 ميجابايت)");
      setLoading(false);
      return;
    }

    try {
      let cvUrl = "";
      if (cvFile) {
        // Simulating progress since fetch doesn't support progress events easily
        // without XMLHttpRequest which is old school, or streams which are complex.
        // For simple UX, we'll simulate a fast progress bar.
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        const uploadData = new FormData();
        uploadData.append("file", cvFile);

        try {
          const res = await fetch("/api/upload/r2", {
            method: "POST",
            body: uploadData,
          });

          if (res.ok) {
            const data = await res.json();
            cvUrl = data.url;
            setUploadProgress(100);
            clearInterval(progressInterval);
          } else {
            if (res.status === 413) throw new Error("LARGE_FILE");
            throw new Error(`Upload failed with status: ${res.status}`);
          }
        } catch (err: any) {
          console.error("Upload process error:", err);
          const errorMsg =
            err.message === "LARGE_FILE"
              ? "حجم الملف كبير جداً، يرجى اختيار ملف أصغر من 5 ميجابايت"
              : "فشل رفع السيرة الذاتية، يرجى المحاولة مرة أخرى أو التأكد من اتصالك بالإنترنت";
          toast.error(errorMsg);
          setLoading(false);
          setUploadProgress(0);
          clearInterval(progressInterval);
          return;
        }
      }

      const result = await submitApplication({
        jobId,
        userId,
        ...formData,
        cv: cvUrl,
      });

      if (!result.success) {
        if (result.error === "ALREADY_APPLIED") {
          Swal.fire({
            title: "عذراً",
            text: "لقد قمت بالتقديم على هذه الوظيفة مسبقاً. سنقوم بالتواصل معك قريباً.",
            icon: "info",
            confirmButtonText: "فهمت",
          });
        } else if (result.error === "UNAUTHORIZED") {
          Swal.fire({
            title: "جلسة منتهية",
            text: "يرجى تسجيل الدخول مرة أخرى لإتمام الطلب.",
            icon: "warning",
            confirmButtonText: "تسجيل الدخول",
          }).then(() => {
            window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(`/jobs/${jobId}/apply`)}`;
          });
        } else {
          // Display detailed error if available
          throw new Error(
            result.details || result.error || "Submission failed",
          );
        }
      } else {
        Swal.fire({
          title: "تم استلام طلبك!",
          text: "شكراً لاهتمامك بالانضمام إلينا. سيتم مراجعة طلبك والتواصل معك قريباً.",
          icon: "success",
          confirmButtonColor: "#10b981",
          confirmButtonText: "حسناً",
        }).then(() => {
          window.location.href = "/";
        });
      }
      // Optional: Clear form or redirect
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        title: "خطأ في التقديم",
        text:
          error.message ||
          "حدث خطأ غير متوقع أثناء تقديم الطلب، يرجى المحاولة لاحقاً.",
        icon: "error",
        confirmButtonText: "حاول مرة أخرى",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-2xl border-0 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-purple-600 w-full" />
      <CardHeader className="text-center pb-8 pt-8 bg-gray-50/50">
        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          نموذج التقديم الوظيفي
        </CardTitle>
        <p className="text-gray-500 mt-2">
          جميع الحقول أدناه مطلوبة لضمان تقييم طلبك بشكل صحيح
        </p>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2 border-b pb-2">
              <User size={20} />
              البيانات الشخصية
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                    placeholder="الاسم الرباعي"
                    disabled={!!initialData?.name}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                    placeholder="example@mail.com"
                    disabled={!!initialData?.email}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  رقم الهاتف <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                    placeholder="059xxxxxxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  رقم الواتساب <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MessageCircle
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                    placeholder="+97259xxxxxxx"
                  />
                </div>
                <p className="text-xs text-gray-400 mr-1">
                  يجب أن يكون رقم صحيح للتواصل
                </p>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  الجنس <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, gender: val })
                  }
                  required
                >
                  <SelectTrigger className="h-11 w-full" dir="rtl">
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  العمر <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  مكان السكن <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                    placeholder="المدينة / المنطقة"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Professional Info */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2 border-b pb-2">
              <Briefcase size={20} />
              البيانات المهنية والأكاديمية
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="major" className="flex items-center gap-2">
                  التخصص <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <GraduationCap
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                    placeholder="مثال: هندسة حاسوب"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="education" className="flex items-center gap-2">
                  المؤهل التعليمي <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <FileText
                    className="absolute right-3 top-3 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="pr-10 h-11"
                    placeholder="مثال: بكالوريوس"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="experienceYears"
                  className="flex items-center gap-2"
                >
                  سنوات الخبرة <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="عدد السنوات"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Attachments & Notes */}
          <div className="space-y-6 pt-4">
            <div
              className={`border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors text-center ${!cvFile ? "border-red-300 bg-red-50/30" : ""}`}
            >
              <Label htmlFor="cv" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud size={24} />
                  </div>
                  <div className="text-gray-600 font-medium">
                    رفع السيرة الذاتية (CV){" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    PDF, DOC, DOCX (Max 5MB)
                  </div>
                </div>
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </Label>
              {cvFile ? (
                <div className="mt-4 text-sm text-green-600 bg-green-50 py-2 px-4 rounded-lg inline-block">
                  تم اختيار الملف: {cvFile.name}
                </div>
              ) : (
                <div className="mt-2 text-xs text-red-400 font-medium">
                  (مطلوب)
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="mt-4 w-full max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadProgress}% جاري الرفع...
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية / رسالة تغطية</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="resize-none min-h-[120px]"
                placeholder="اكتب أي معلومات إضافية تود مشاركتها معنا..."
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="ml-2 h-5 w-5" />
                إرسال الطلب
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
