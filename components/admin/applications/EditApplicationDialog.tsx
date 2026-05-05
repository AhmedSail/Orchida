"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Phone, Mail, MapPin, GraduationCap, Calendar, MessageSquare, Save, BookOpen } from "lucide-react";
import Swal from "sweetalert2";

interface Application {
  id: string;
  userId: string;
  statusValue: string;
  attendanceType: string;
  courseId: string;
  studentNotes: string | null;
  adminNotes: string | null;
  user: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string | null;
    major: string | null;
    location: string | null;
    age: number | null;
  };
}

interface EditApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  courses: { id: string; title: string }[];
  onSuccess: () => void;
}

const EditApplicationDialog = ({
  open,
  onOpenChange,
  application,
  courses,
  onSuccess,
}: EditApplicationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    major: "",
    location: "",
    age: "",
    courseId: "",
    attendanceType: "",
    studentNotes: "",
    adminNotes: "",
  });

  useEffect(() => {
    if (application) {
      setFormData({
        name: application.user.name || "",
        email: application.user.email || "",
        phone: application.user.phone || "",
        whatsapp: application.user.whatsapp || "",
        major: application.user.major || "",
        location: application.user.location || "",
        age: application.user.age?.toString() || "",
        courseId: application.courseId || "",
        attendanceType: application.attendanceType || "in_person",
        studentNotes: application.studentNotes || "",
        adminNotes: application.adminNotes || "",
      });
    }
  }, [application, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/course-applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onOpenChange(false);
        onSuccess();
        Swal.fire({
          title: "تم التحديث!",
          text: "تم تحديث بيانات الطالب بنجاح.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const err = await res.json();
        throw new Error(err.message || "فشل تحديث البيانات");
      }
    } catch (error: any) {
      Swal.fire("خطأ", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <User className="text-primary w-6 h-6" />
            تعديل بيانات الطالب والطلب
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium pt-2">
            يمكنك تعديل كافة معلومات الطالب وتفاصيل طلبه هنا.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-black text-zinc-900 border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                المعلومات الشخصية
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pr-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                    placeholder="الاسم الكامل..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pr-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                    placeholder="example@mail.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pr-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                      placeholder="059xxxxxxx"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">رقم الواتساب</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    <Input 
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="pr-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                      placeholder="059xxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">العمر</label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="pr-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                      placeholder="20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">المكان/السكن</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pr-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                      placeholder="غزة، الرمال"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">التخصص الدراسي</label>
                <div className="relative">
                  <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="pr-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                    placeholder="هندسة برمجيات"
                  />
                </div>
              </div>
            </div>

            {/* Application Info */}
            <div className="space-y-4">
              <h3 className="font-black text-zinc-900 border-b pb-2 flex items-center gap-2">
                <Save className="w-4 h-4 text-primary" />
                تفاصيل الطلب
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">الدورة التدريبية المطلوبة</label>
                <Select 
                  value={formData.courseId} 
                  onValueChange={(val) => setFormData({ ...formData, courseId: val })}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-primary/5 border-primary/20 font-black text-primary focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <SelectValue placeholder="اختر الدورة..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id} className="rounded-xl font-bold">
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-zinc-500 font-bold mr-1">تغيير الدورة سينقل طلب الطالب لدورة أخرى فوراً</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">نوع الحضور</label>
                <Select 
                  value={formData.attendanceType} 
                  onValueChange={(val) => setFormData({ ...formData, attendanceType: val })}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20">
                    <SelectValue placeholder="اختر نوع الحضور..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="in_person" className="rounded-xl">وجاهي (بالمركز)</SelectItem>
                    <SelectItem value="online" className="rounded-xl">أونلاين (عن بعد)</SelectItem>
                    <SelectItem value="hybrid" className="rounded-xl">مدمج (Hybrid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">ملاحظات الطالب (من الموقع)</label>
                <div className="relative">
                  <MessageSquare className="absolute right-3 top-3 w-4 h-4 text-zinc-400" />
                  <Textarea 
                    value={formData.studentNotes}
                    onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
                    className="pr-10 min-h-[100px] rounded-2xl bg-zinc-50 border-zinc-100 font-bold focus:ring-primary/20"
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">ملاحظات الإدارة (خاصة)</label>
                <div className="relative">
                  <Save className="absolute right-3 top-3 w-4 h-4 text-primary/40" />
                  <Textarea 
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    className="pr-10 min-h-[100px] rounded-2xl bg-primary/5 border-primary/10 font-bold focus:ring-primary/20"
                    placeholder="اكتب ملاحظاتك كمسؤول هنا..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex flex-row gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-2xl font-bold"
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                حفظ التعديلات
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditApplicationDialog;
