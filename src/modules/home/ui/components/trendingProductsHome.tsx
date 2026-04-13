"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ExternalLink,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { TrendingProduct } from "@/components/admin/trendingProducts/TrendingProductsTable";
import { Link } from "next-view-transitions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

const TrendingProductsHome = ({
  products,
}: {
  products: TrendingProduct[];
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (products.length === 0) return null;

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="trending" className="overflow-hidden pb-20" dir="rtl">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-start gap-4 mb-16"
        >
          <div className="w-2 h-10 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              منتجات رائجة للتجارة بنظام
              <span className="mr-3 text-primary italic">
                الدروب شوبنج Dropshipping
              </span>
            </h2>
            <p className="text-gray-500 mt-2 font-medium text-lg">
              منتجات رائجة تم اختيارها من موقع علي اكسبرس AliExpress لبيعها على
              موقع ايباي eBay
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <AnimatePresence mode="wait">
            {currentProducts.map((product, index) => (
              <motion.div
                key={product.id + currentPage}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 aspect-square items-center text-center"
              >
                <div className="relative w-full aspect-square overflow-hidden mb-6 shrink-0 bg-gray-50">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-300 font-bold uppercase tracking-widest">
                        Orchida
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 w-full p-10">
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors duration-300 uppercase tracking-tight line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 mt-2 line-clamp-2 text-xs leading-relaxed font-medium">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4 w-full">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                      Trending Now
                    </span>
                    {product.link && (
                      <Link
                        href={product.link}
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-[10px] font-black hover:bg-primary hover:text-white transition-all duration-300 whitespace-nowrap"
                      >
                        Aliexpress
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <Pagination>
              <PaginationContent className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-lg gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    className={`cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show current page, first, last, and neighbors
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          className={`cursor-pointer transition-all duration-300 rounded-xl ${currentPage === page ? "bg-primary text-white shadow-lg shadow-primary/30" : "hover:bg-primary/10 hover:text-primary"}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    className={`cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProductsHome;
