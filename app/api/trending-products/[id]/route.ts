import { db } from "@/src";
import { trendingProducts } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Remove id from body to avoid updating it
    const { id: _, ...updateData } = body;

    const updatedProduct = await db
      .update(trendingProducts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(trendingProducts.id, id))
      .returning();

    if (updatedProduct.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error("Error updating trending product:", error);
    return NextResponse.json(
      { error: "Failed to update trending product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const deletedProduct = await db
      .delete(trendingProducts)
      .where(eq(trendingProducts.id, id))
      .returning();

    if (deletedProduct.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting trending product:", error);
    return NextResponse.json(
      { error: "Failed to delete trending product" },
      { status: 500 }
    );
  }
}
