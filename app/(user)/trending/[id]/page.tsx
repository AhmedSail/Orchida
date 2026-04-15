import { db } from "@/src";
import { trendingProducts } from "@/src/db/schema";
import ProductDetailView from "@/src/modules/trending/ui/components/ProductDetailView";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product] = await db
    .select()
    .from(trendingProducts)
    .where(eq(trendingProducts.id, id))
    .limit(1);

  if (!product) return { title: "المنتج غير موجود" };

  return {
    title: `${product.name} | أوركيدة`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product] = await db
    .select()
    .from(trendingProducts)
    .where(eq(trendingProducts.id, id))
    .limit(1);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-20">
      <ProductDetailView product={product} />
    </div>
  );
}
