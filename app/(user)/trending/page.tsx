import { db } from "@/src";
import { trendingProducts } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import TrendingProductsHome from "@/src/modules/home/ui/components/trendingProductsHome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "المنتجات الرائجة | أوركيدة",
  description: "استعرض آخر المنتجات الرائجة في أوركيدة للخدمات الرقمية.",
};

export default async function TrendingPage() {
  const products = await db
    .select()
    .from(trendingProducts)
    .where(eq(trendingProducts.isActive, true))
    .orderBy(desc(trendingProducts.order), desc(trendingProducts.createdAt));

  return (
    <div className="min-h-screen pt-20">
      <TrendingProductsHome products={products} />
    </div>
  );
}
