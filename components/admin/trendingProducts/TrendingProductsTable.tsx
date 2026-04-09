"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { InferSelectModel } from "drizzle-orm";
import { trendingProducts } from "@/src/db/schema";
import Image from "next/image";
import {
  Edit3,
  Trash2,
  Search,
  Plus,
  Eye,
  EyeOff,
  Package,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import TrendingProductDialog from "./TrendingProductDialog";

export type TrendingProduct = InferSelectModel<typeof trendingProducts>;

const TrendingProductsTable = ({
  initialProducts,
  userId,
  role,
}: {
  initialProducts: TrendingProduct[];
  userId: string;
  role: string;
}) => {
  const router = useRouter();
  const [products, setProducts] = useState<TrendingProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TrendingProduct | null>(
    null,
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استرجاع هذا المنتج!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه",
      cancelButtonText: "تراجع",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/trending-products/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setProducts(products.filter((p) => p.id !== id));
          Swal.fire("تم الحذف!", "تم حذف المنتج بنجاح.", "success");
        }
      } catch (error) {
        Swal.fire("خطأ", "حدث خطأ أثناء الحذف", "error");
      }
    }
  };

  const handleToggleActive = async (product: TrendingProduct) => {
    const action = product.isActive ? "إلغاء تنشيط" : "تنشيط";
    const result = await Swal.fire({
      title: `هل تريد ${action} هذا المنتج؟`,
      text: product.isActive 
        ? "لن يظهر هذا المنتج للمستخدمين في الصفحة الرئيسية." 
        : "سيظهر هذا المنتج لجميع المستخدمين في الصفحة الرئيسية.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: product.isActive ? "#EF4444" : "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، قم بـ ${action}`,
      cancelButtonText: "تراجع",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/trending-products/${product.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: !product.isActive }),
        });
        if (res.ok) {
          setProducts(
            products.map((p) =>
              p.id === product.id ? { ...p, isActive: !p.isActive } : p,
            ),
          );
          Swal.fire("تم بنجاح!", `تم ${action} المنتج بنجاح.`, "success");
        }
      } catch (error) {
        console.error("Error toggling status", error);
        Swal.fire("خطأ", "حدث خطأ أثناء تغيير الحالة", "error");
      }
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: TrendingProduct) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const onSave = (newProduct: TrendingProduct) => {
    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === newProduct.id ? newProduct : p)),
      );
    } else {
      setProducts([newProduct, ...products]);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            المنتجات الرائجة
          </h1>
          <p className="text-gray-500 mt-1">
            إدارة المنتجات التي تظهر في الواجهة الرئيسية
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث عن منتج..."
              className="pr-10 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all outline-none ring-offset-0 focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={openAddDialog}
            className="rounded-2xl bg-primary hover:bg-primary/90 text-white px-6 font-bold shadow-lg shadow-primary/20 transform transition active:scale-95"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة منتج
          </Button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="text-right pr-6 py-5 font-bold text-gray-700">
                المنتج
              </TableHead>
              <TableHead className="text-center font-bold text-gray-700">
                الترتيب
              </TableHead>
              <TableHead className="text-center font-bold text-gray-700">
                الحالة / الظهور
              </TableHead>
              <TableHead className="text-left pl-6 font-bold text-gray-700">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={product.id}
                  className="group hover:bg-primary/2 transition-colors border-b border-gray-50 last:border-0"
                >
                  <TableCell className="py-5 pr-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:shadow-md transition-shadow">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-lg leading-tight uppercase tracking-tight">
                          {product.name}
                        </span>
                        <p className="text-gray-500 text-xs mt-1 font-medium max-w-[250px] leading-relaxed">
                          {product.description 
                            ? (product.description.length > 50 
                                ? product.description.substring(0, 50) + "..." 
                                : product.description)
                            : "لا يوجد وصف"}
                        </p>
                        {product.link && (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-[10px] flex items-center gap-1 mt-1.5 hover:underline font-black opacity-70 hover:opacity-100 uppercase"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            تصفح الرابط
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center bg-gray-100/80 px-3 py-1 rounded-lg font-black text-gray-600 text-xs">
                      #{product.order}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                        product.isActive
                          ? "bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600 border border-emerald-100 hover:border-rose-100"
                          : "bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600 border border-rose-100 hover:border-emerald-100"
                      }`}
                      title={product.isActive ? "إيقاف النشاط" : "تفعيل المنتج"}
                    >
                      {product.isActive ? (
                        <>
                          <Eye className="w-4 h-4 group-hover:hidden" />
                          <EyeOff className="w-4 h-4 hidden group-hover:block" />
                          <span className="group-hover:hidden">نشط (إلغاء؟)</span>
                          <span className="hidden group-hover:inline">إلغاء التنشيط</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 group-hover:hidden" />
                          <Eye className="w-4 h-4 hidden group-hover:block" />
                          <span className="group-hover:hidden">مخفي (تفعيل؟)</span>
                          <span className="hidden group-hover:inline">تفعيل النشاط</span>
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="pl-6">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                        className="w-10 h-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-gray-400 transform transition active:scale-90"
                      >
                        <Edit3 className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="w-10 h-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-gray-400 transform transition active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="w-16 h-16 opacity-20 mb-4" />
            <p className="text-xl font-bold">لا توجد منتجات حالياً</p>
          </div>
        )}
      </div>

      <TrendingProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={onSave}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default TrendingProductsTable;
