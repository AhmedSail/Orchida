import { db } from "@/src";
import { trendingProducts, users } from "@/src/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import TrendingProductsTable from "@/components/admin/trendingProducts/TrendingProductsTable";

export const metadata = {
  title: "المنتجات الرائجة | لوحة الإدارة",
  description: "إدارة المنتجات الرائجة التي تظهر للمستخدمين",
};

export default async function TrendingProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch products
  const products = await db
    .select()
    .from(trendingProducts)
    .orderBy(desc(trendingProducts.order), desc(trendingProducts.createdAt));

  // Fetch user role
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = userRecord[0]?.role;

  return (
    <div className="p-6">
      <TrendingProductsTable 
        initialProducts={products} 
        userId={session.user.id} 
        role={role || "user"} 
      />
    </div>
  );
}
