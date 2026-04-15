"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, ArrowRight, ShoppingCart, Globe, ShieldCheck } from "lucide-react";
import { Link } from "next-view-transitions";

interface TrendingProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  link: string | null;
  source: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductDetailView = ({ product }: { product: TrendingProduct }) => {
  return (
    <section className="pb-20 pt-10" dir="rtl">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            العودة للمنتجات الرائجة
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-gray-200 border border-gray-100 group"
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <span className="text-gray-200 text-6xl font-black opacity-20 uppercase">Orchida</span>
              </div>
            )}
            
            {/* Source Badge */}
            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-6 py-2 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-gray-900">{product.source || "AliExpress"}</span>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black mb-4 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                منتج مختار بعناية
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight uppercase tracking-tight">
                {product.name}
              </h1>
              <div className="w-20 h-1.5 bg-primary rounded-full mb-8 shadow-lg shadow-primary/20"></div>
            </div>

            <div className="prose prose-lg prose-primary max-w-none mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">وصف المنتج</h3>
              <p className="text-gray-600 leading-relaxed text-lg font-medium">
                {product.description || "لا يوجد وصف متاح لهذا المنتج حالياً."}
              </p>
            </div>

            <div className="space-y-6 mt-auto">
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold">حالة المنتج</p>
                    <p className="text-sm font-black text-gray-900">رائج جداً</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold">المصدر الرسمي</p>
                    <p className="text-sm font-black text-gray-900">{product.source || "AliExpress"}</p>
                  </div>
                </div>
              </div>

              {product.link && (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={product.link}
                  target="_blank"
                  className="inline-flex items-center justify-center w-full gap-3 bg-primary text-white px-8 py-5 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all duration-300"
                >
                  الذهاب للمتجر لشراء المنتج
                  <ExternalLink className="w-6 h-6" />
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailView;
