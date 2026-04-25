"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, Youtube, UserPlus, Users, Info } from "lucide-react";

// استدعاء hook الخاص بـ EdgeStore
import { uploadToR2 } from "@/lib/r2-client";
import { useRouter } from "next/navigation";

interface StudentWorkFormProps {
  courseId: string;
  sectionId: string;
  students: { id: string | null; name: string }[];
  userRole: string;
  courseTitle: string | null;
  sectionNumber?: number;
  userId: string | null;
}

const StudentWorkForm = ({
  courseId,
  sectionId,
  students,
  userRole,
  courseTitle,
  sectionNumber,
  userId,
}: StudentWorkFormProps) => {
  const [studentId, setStudentId] = useState("");
  const [customStudentName, setCustomStudentName] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);
  const [type, setType] = useState<"story" | "image" | "video">("story");
  const [mediaMode, setMediaMode] = useState<"upload" | "youtube">("upload");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCustomName && !studentId) {
      Swal.fire("⚠️ خطأ", "يجب اختيار الطالب", "error");
      return;
    }
    if (isCustomName && !customStudentName.trim()) {
      Swal.fire("⚠️ خطأ", "يجب إدخال اسم الطالب", "error");
      return;
    }
    if (!title.trim()) {
      Swal.fire("⚠️ خطأ", "يجب إدخال عنوان العمل", "error");
      return;
    }

    let fileUrl: string | null = null;

    // ✅ رفع الملف إذا النوع صورة أو فيديو واختيار الرفع
    if (file && type !== "story" && mediaMode === "upload") {
      try {
        const url = await uploadToR2(file, (progress) =>
          setUploadProgress(progress)
        );
        fileUrl = url;
      } catch (err) {
        Swal.fire("❌ خطأ", "فشل رفع الملف", "error");
        return;
      }
    }

    // ✅ إرسال البيانات للـ API
    const formData = new FormData();
    if (isCustomName) {
      formData.append("studentName", customStudentName);
      formData.append("studentId", "");
    } else {
      formData.append("studentId", studentId);
      const student = students.find(s => s.id === studentId);
      if (student) formData.append("studentName", student.name);
    }

    formData.append("courseId", courseId);
    formData.append("sectionId", sectionId);
    formData.append("type", type);
    formData.append("title", title);
    formData.append("description", description);
    
    if (mediaMode === "upload" && fileUrl) {
      formData.append("mediaUrl", fileUrl);
    } else if (mediaMode === "youtube" && youtubeUrl) {
      formData.append("youtubeUrl", youtubeUrl);
      formData.append("mediaUrl", youtubeUrl); // For backward compatibility if needed
    }

    const res = await fetch("/api/student-work", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      Swal.fire("✅ تم الحفظ", "تم رفع العمل بنجاح", "success");
      setStudentId("");
      setCustomStudentName("");
      setTitle("");
      setDescription("");
      setFile(null);
      setYoutubeUrl("");
      setType("story");
      setUploadProgress(0);
      router.push(
        `/${userRole}/${userId}/courses/sections/${sectionId}/allStudentsWork`
      );
    } else {
      Swal.fire("❌ خطأ", "حدث خطأ أثناء رفع العمل", "error");
    }
  };

  if (userRole !== "coordinator" && userRole !== "admin") {
    return <p className="text-red-600 p-6 bg-red-50 rounded-xl border border-red-100">❌ ليس لديك صلاحية لرفع الأعمال</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-8 md:p-10 border-none rounded-[2.5rem] shadow-2xl bg-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 animate-pulse"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">إضافة عمل طالب / قصة نجاح</h2>
            <p className="text-gray-500 text-sm font-medium">قم بتوثيق إنجازات طلابك في هذا القسم</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400">
              <Info size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الكورس الحالي</p>
              <p className="text-sm font-bold text-gray-900">{courseTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الشعبة</p>
              <p className="text-sm font-bold text-gray-900"># {sectionNumber}</p>
            </div>
          </div>
        </div>

        {/* اختيار الطالب أو كتابة الاسم */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">معلومات الطالب</label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCustomName(!isCustomName)}
              className="text-primary hover:bg-primary/5 font-bold gap-2"
            >
              {isCustomName ? <Users size={14} /> : <UserPlus size={14} />}
              {isCustomName ? "اختيار من المسجلين" : "إدخال اسم يدوي"}
            </Button>
          </div>

          {isCustomName ? (
            <Input
              placeholder="أدخل اسم الطالب الرباعي..."
              value={customStudentName}
              onChange={(e) => setCustomStudentName(e.target.value)}
              className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-lg font-bold"
            />
          ) : (
            <Select onValueChange={(val) => setStudentId(val)} value={studentId}>
              <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-lg font-bold" dir="rtl">
                <SelectValue placeholder="اختر الطالب من القائمة" />
              </SelectTrigger>
              <SelectContent dir="rtl" className="rounded-2xl border-none shadow-2xl">
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id ?? ""} className="rounded-xl font-bold py-3">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* نوع العمل وعنوانه */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">نوع العمل</label>
            <Select
              onValueChange={(val) => setType(val as "story" | "image" | "video")}
              defaultValue="story"
            >
              <SelectTrigger dir="rtl" className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-lg font-bold">
                <SelectValue placeholder="اختر نوع العمل" />
              </SelectTrigger>
              <SelectContent dir="rtl" className="rounded-2xl border-none shadow-2xl">
                <SelectItem value="story" className="rounded-xl font-bold py-3">📖 قصة نجاح</SelectItem>
                <SelectItem value="image" className="rounded-xl font-bold py-3">🖼️ صورة (تصميم/رسم)</SelectItem>
                <SelectItem value="video" className="rounded-xl font-bold py-3">🎥 فيديو (موشن/مونتاج)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">عنوان العمل</label>
            <Input
              placeholder="مثال: قصة كفاح جوليا..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-lg font-bold"
            />
          </div>
        </div>

        {/* الوصف */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">الوصف أو القصة</label>
          <Textarea
            placeholder="اكتب هنا تفاصيل العمل أو قصة النجاح..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 min-h-[150px] text-base font-medium p-6"
          />
        </div>

        {/* الوسائط (يوتيوب أو رفع) */}
        {type !== "story" && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <label className="text-xs font-black text-gray-400 uppercase tracking-widest">وسائط العمل</label>
               <Tabs 
                defaultValue="upload" 
                onValueChange={(val) => setMediaMode(val as "upload" | "youtube")}
                className="w-full md:w-auto"
              >
                <TabsList className="bg-gray-100 p-1 rounded-xl h-10">
                  <TabsTrigger value="upload" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-primary font-bold text-xs px-4">
                    <Upload size={14} />
                    رفع ملف
                  </TabsTrigger>
                  <TabsTrigger value="youtube" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600 font-bold text-xs px-4">
                    <Youtube size={14} />
                    رابط يوتيوب
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Tabs value={mediaMode} className="w-full">
              <TabsContent value="upload" className="mt-0">
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 flex flex-col items-center justify-center gap-4 relative">
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="size-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{file ? file.name : "اضغط لرفع الملف أو اسحبه هنا"}</p>
                    <p className="text-xs text-gray-500 mt-1">يدعم الصور والفيديوهات بجميع الصيغ</p>
                  </div>
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-[10px] font-black text-primary mt-2 text-left">{uploadProgress}%</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="youtube" className="mt-0">
                <div className="relative">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-red-500">
                    <Youtube size={20} />
                  </div>
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="h-14 pr-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-red-500/20 text-lg font-bold"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 mt-8">
          نشر العمل الآن
        </Button>
      </form>
    </div>
  );
};

export default StudentWorkForm;
