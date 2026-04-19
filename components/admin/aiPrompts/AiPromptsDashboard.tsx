"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  createPromptAction,
  deletePromptAction,
  getPromptsByTypeAction,
  updatePromptAction,
} from "@/app/actions/ai-prompts";
import { SingleUploader } from "@/components/SingleUploader";
import {
  Video,
  Image as ImageIcon,
  Trash2,
  Plus,
  Loader2,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AiPromptsDashboard() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<"image" | "video">("image");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [promptText, setPromptText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    const res = await getPromptsByTypeAction(activeTab);
    if (res.success && res.data) {
      setPrompts(res.data);
    } else {
      toast.error("فشل جلب الأوامر");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrompts();
  }, [activeTab]);

  const openAddModal = () => {
    setEditingId(null);
    setType(activeTab);
    setTitle("");
    setCategory("");
    setPromptText("");
    setMediaUrl("");
    setIsDialogOpen(true);
  };

  const openEditModal = (prompt: any) => {
    setEditingId(prompt.id);
    setType(prompt.type);
    setTitle(prompt.title || "");
    setCategory(prompt.category || "");
    setPromptText(prompt.promptText || "");
    setMediaUrl(prompt.mediaUrl || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText || !mediaUrl) {
      return toast.error("يرجى إدخال نص الأمر ورفع صورة/فيديو العرض");
    }

    setIsSubmitting(true);
    
    let res;
    if (editingId) {
      res = await updatePromptAction(editingId, {
        type,
        title,
        category,
        promptText,
        mediaUrl,
      });
    } else {
      res = await createPromptAction({
        type,
        title,
        category,
        promptText,
        mediaUrl,
      });
    }

    if (res.success) {
      toast.success(editingId ? "تم تعديل الأمر بنجاح!" : "تمت إضافة الأمر بنجاح!");
      setIsDialogOpen(false);
      if (type === activeTab) {
        fetchPrompts();
      }
    } else {
      toast.error(res.error || "حدث خطأ أثناء حفظ الأمر");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      const res = await deletePromptAction(id);
      if (res.success) {
        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف الأمر بنجاح.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
        fetchPrompts();
      } else {
        toast.error("فشل الحذف");
      }
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">مكتبة أوامر AI</h1>
          <p className="text-zinc-500 text-sm mt-1">
            إدارة النماذج (Prompts) الجاهزة لقسم الصور والفيديوهات
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة أمر جديد
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white rounded-[2rem] border-0 shadow-2xl overflow-y-auto max-h-[90vh]" dir="rtl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-black text-zinc-900">
                {editingId ? "تعديل الأمر (Prompt)" : "إضافة أمر (Prompt) جديد"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">نوع التوليد</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "image" | "video")}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="image">صورة (Image)</option>
                    <option value="video">فيديو (Video)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">التصنيف (اختياري)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: تصوير سينمائي، واقعي..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">العنوان (اختياري)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان قصير للعرض..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">نص التوليد (Prompt) <span className="text-red-500">*</span></label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="أدخل الأمر هنا باللغة الإنجليزية يفضل..."
                  className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">صورة / فيديو العرض <span className="text-red-500">*</span></label>
                <SingleUploader
                  onChange={setMediaUrl}
                  initialUrl={mediaUrl}
                  onUploadChange={setIsUploading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploading || !mediaUrl}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  editingId ? "حفظ التعديلات" : "حفظ ونشر"
                )}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1.5 border border-zinc-100 max-w-sm">
        <button
          onClick={() => setActiveTab("image")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "image"
              ? "bg-primary/10 text-primary"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          أوامر الصور
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "video"
              ? "bg-primary/10 text-primary"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Video className="w-4 h-4" />
          أوامر الفيديو
        </button>
      </div>

      {/* Display List */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="p-12 flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex items-center justify-center h-full">
            <p>لا توجد أوامر مضافة في هذا القسم حتى الآن.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="group relative bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                <div className="aspect-square relative bg-zinc-200 overflow-hidden">
                  {prompt.type === "video" ? (
                    <video src={prompt.mediaUrl} className="w-full h-full object-cover" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
                  ) : (
                    <img src={prompt.mediaUrl} alt={prompt.title || "Prompt media"} className="w-full h-full object-cover" />
                  )}
                  
                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(prompt)}
                      className="p-2 bg-white text-zinc-700 rounded-xl hover:bg-zinc-100 shadow-lg"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {prompt.category && (
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/20">
                      {prompt.category}
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-zinc-900 mb-2 truncate">
                    {prompt.title || "بدون عنوان"}
                  </h3>
                  <div className="text-xs text-zinc-500 bg-white p-3 rounded-xl border border-zinc-100 flex-1 overflow-y-auto max-h-24 custom-scrollbar">
                    {prompt.promptText}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
