"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Search, 
  AlertCircle, 
  Loader2, 
  Save, 
  X,
  Video,
  ImageIcon,
  Zap,
  Clock,
  Layout
} from "lucide-react";
import { upsertAiPricingAction, deleteAiPricingAction } from "@/app/actions/ai-pricing";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface PricingItem {
  id: string;
  serviceType: string;
  provider: string;
  quality: string;
  duration?: number | null;
  credits: number;
}

export default function AiPricingTable({ initialPricing }: { initialPricing: PricingItem[] }) {
  const [pricing, setPricing] = useState<PricingItem[]>(initialPricing);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    id: "", // For editing
    serviceType: "video",
    provider: "Veo",
    quality: "720p",
    duration: 0,
    credits: 5
  });
  const [editMode, setEditMode] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await upsertAiPricingAction({
        serviceType: formData.serviceType as "video" | "image",
        provider: formData.provider,
        quality: formData.quality,
        duration: formData.serviceType === "video" ? formData.duration : undefined,
        credits: formData.credits
      });

      if (res.success) {
        toast.success(editMode ? "تم تحديث التسعيرة" : "تم حفظ التسعيرة بنجاح");
        setEditMode(false);
        setIsAdding(false);
        setFormData({ id: "", serviceType: "video", provider: "Veo", quality: "720p", duration: 0, credits: 5 });
        window.location.reload(); 
      } else {
        toast.error("فشل في حفظ التسعيرة");
      }
    } catch (err) {
      toast.error("حدث خطأ ما");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item: PricingItem) => {
    setFormData({
      id: item.id,
      serviceType: item.serviceType as "video" | "image",
      provider: item.provider,
      quality: item.quality,
      duration: item.duration || 0,
      credits: item.credits
    });
    setEditMode(true);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من التراجع عن حذف هذه التسعيرة!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'نعم، احذفها!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      background: '#ffffff',
      customClass: {
        popup: 'rounded-[1.5rem] border-0',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold text-slate-500'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteAiPricingAction(id);
        if (res.success) {
          setPricing(pricing.filter(p => p.id !== id));
          Swal.fire({
            title: 'تم الحذف!',
            text: 'تم حذف التسعيرة بنجاح.',
            icon: 'success',
            confirmButtonColor: '#0f172a',
            timer: 2000
          });
        }
      } catch (err) {
        toast.error("فشل في الحذف");
      }
    }
  };

  const filteredPricing = pricing.filter(p => 
    p.provider.toLowerCase().includes(search.toLowerCase()) || 
    p.quality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section with glassmorphism */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
               <Zap className="size-8 text-primary fill-primary/20" />
            </div>
            تسعير خدمات الذكاء الاصطناعي
          </h1>
          <p className="text-slate-500 font-medium mt-1 pr-1">تحكم في تكلفة الكريدت لكل جودة ونوع وموديل</p>
        </div>
        
        <button 
          onClick={() => {
            if (isAdding && editMode) {
                setEditMode(false);
                setFormData({ id: "", serviceType: "video", provider: "Veo", quality: "720p", duration: 0, credits: 5 });
            }
            setIsAdding(!isAdding);
          }}
          className="group relative flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold transition-all duration-300 hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
           {isAdding ? <X className="size-5 z-10" /> : <Plus className="size-5 z-10" />}
           <span className="z-10">{isAdding ? (editMode ? "إلغاء التعديل" : "إلغاء الإضافة") : "إضافة تسعيرة جديدة"}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Service Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Layout className="size-3.5" /> نوع الخدمة
                    </label>
                    <select 
                      value={formData.serviceType}
                      onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-slate-800"
                    >
                      <option value="video">فيديو</option>
                      <option value="image">صورة</option>
                    </select>
                  </div>

                  {/* Provider */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="size-3.5" /> الموديل / المزود
                    </label>
                    <select 
                      value={formData.provider}
                      onChange={(e) => setFormData({...formData, provider: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-slate-800"
                    >
                      {formData.serviceType === "video" ? (
                        <>
                          <option value="Veo">Veo (Google)</option>
                          <option value="Grok">Grok (xAI)</option>
                          <option value="Bytedance">Bytedance</option>
                          <option value="Kling">Kling</option>
                        </>
                      ) : (
                        <>
                          <option value="Imagen">Imagen (Google)</option>
                          <option value="Grok">Grok (xAI)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Quality */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Settings2 className="size-3.5" /> الجودة / الدقة
                    </label>
                    <select 
                      value={formData.quality}
                      onChange={(e) => setFormData({...formData, quality: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-slate-800"
                    >
                      {formData.serviceType === "video" ? (
                        <>
                          <option value="480p">480p (Standard)</option>
                          <option value="720p">720p (HD)</option>
                          <option value="1080p">1080p (Full HD)</option>
                        </>
                      ) : (
                        <>
                          <option value="1K">1K (Standard)</option>
                          <option value="2K">2K (High)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className={cn("space-y-2", formData.serviceType !== "video" && "opacity-30 pointer-events-none")}>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="size-3.5" /> الثواني (0 للعام)
                    </label>
                    <input 
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                      disabled={formData.serviceType !== "video"}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>

                  {/* Credits */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-primary">
                       <Plus className="size-3.5" /> الكريدت المطلوب
                    </label>
                    <input 
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 0})}
                      className="w-full h-12 px-4 rounded-xl bg-primary/5 border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold text-primary"
                      required
                    />
                  </div>
               </div>
               
               <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex justify-center items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                    <span>{editMode ? "تحديث التسعيرة" : "حفظ التسعيرة"}</span>
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <div className="bg-white overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-auto right-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input 
                type="text"
                placeholder="ابحث عن مزود، جودة، أو موديل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pr-12 pl-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-700"
              />
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-black text-slate-500">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              تم تحميل {filteredPricing.length} قاعدة تسعير
           </div>
        </div>

        <div className="overflow-x-auto">
          {filteredPricing.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase tracking-wider text-[11px] font-black text-slate-400">
                  <th className="px-8 py-5 text-right font-black">الخدمة</th>
                  <th className="px-6 py-5 text-right font-black">المزود</th>
                  <th className="px-6 py-5 text-right font-black">الجودة</th>
                  <th className="px-6 py-5 text-center font-black">الكريدت</th>
                  <th className="px-6 py-5 text-center font-black">الثواني (لفيديو)</th>
                  <th className="px-8 py-5 text-left font-black">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPricing.map((item) => (
                  <motion.tr 
                    layout
                    key={item.id} 
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            item.serviceType === "video" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                          )}>
                             {item.serviceType === "video" ? <Video className="size-4" /> : <ImageIcon className="size-4" />}
                          </div>
                          <span className="font-black text-slate-800 tracking-tight">
                             {item.serviceType === "video" ? "إنتاج فيديو" : "توليد صورة"}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase">
                          {item.provider}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className="font-bold text-slate-600">
                          {item.quality}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-black text-sm border border-emerald-100">
                          <Zap className="size-3.5" />
                          {item.credits}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       {item.duration ? (
                         <span className="font-bold text-slate-500 tabular-nums">{item.duration} ث'</span>
                       ) : (
                         <span className="text-slate-300 font-medium">---</span>
                       )}
                    </td>
                     <td className="px-8 py-5 text-left flex items-center gap-2">
                        <button 
                          onClick={() => startEdit(item)}
                          className="p-2.5 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        >
                           <Settings2 className="size-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                           <Trash2 className="size-5" />
                        </button>
                     </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30">
               <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm mb-4">
                  <AlertCircle className="size-12 text-slate-200" />
               </div>
               <p className="text-slate-400 font-bold">لا توجد أي قواعد تسعير حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility to merge class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
