"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SingleUploader } from "@/components/SingleUploader";
import { TrendingProduct } from "./TrendingProductsTable";
import Swal from "sweetalert2";

interface TrendingProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: TrendingProduct) => void;
  editingProduct: TrendingProduct | null;
}

const TrendingProductDialog = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}: TrendingProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    link: "",
    order: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || "",
        imageUrl: editingProduct.imageUrl || "",
        link: editingProduct.link || "",
        order: editingProduct.order,
        isActive: editingProduct.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        link: "",
        order: 0,
        isActive: true,
      });
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProduct
        ? `/api/trending-products/${editingProduct.id}`
        : "/api/trending-products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        onSave(savedProduct);
        Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      Swal.fire("خطأ", "حدث خطأ أثناء حفظ المنتج", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl overflow-hidden border-none shadow-2xl p-0">
        <DialogHeader className="bg-primary p-8 text-white">
          <DialogTitle className="text-3xl font-black">
            {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
          </DialogTitle>
          <p className="text-white/70 mt-2 font-medium">
            قم بتعبئة التفاصيل أدناه لظهور المنتج في الموقع
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold pr-1">اسم المنتج</Label>
              <Input
                required
                placeholder="مثال: دورة التصميم المتقدمة"
                className="rounded-xl border-gray-200 focus:ring-primary/20 bg-gray-50/50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold pr-1">الترتيب</Label>
              <Input
                type="number"
                placeholder="0"
                className="rounded-xl border-gray-200 focus:ring-primary/20 bg-gray-50/50"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-700 font-bold pr-1">وصف المنتج</Label>
              <Textarea
                placeholder="اكتب شرحاً قصيراً لمنتجك هنا..."
                className="rounded-xl border-gray-200 focus:ring-primary/20 bg-gray-50/50 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-700 font-bold pr-1">رابط المنتج</Label>
              <Input
                placeholder="https://example.com/product"
                className="rounded-xl border-gray-200 focus:ring-primary/20 bg-gray-50/50"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-700 font-bold pr-1">صورة المنتج</Label>
              <SingleUploader
                initialUrl={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                onUploadChange={setIsUploading}
              />
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-100 mt-6 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl font-bold border-gray-200 hover:bg-gray-50 h-12"
            >
              إلغاء
            </Button>
            <Button
              disabled={loading || isUploading}
              type="submit"
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-lg shadow-primary/20"
            >
              {loading ? "جاري الحفظ..." : isUploading ? "جاري رفع الصورة..." : "حفظ المنتج"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrendingProductDialog;
