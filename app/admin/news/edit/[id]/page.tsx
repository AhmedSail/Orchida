import EditNewsForm from "@/components/news/EditNewsForm";
import React from "react";
import { db } from "@/src";
import { news } from "@/src/db/schema";
import { eq } from "drizzle-orm";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  // ✅ جلب الخبر من قاعدة البيانات مباشرة (Server Component)
  const result = await db.select().from(news).where(eq(news.id, id));
  console.log(result);
  if (!result.length) {
    return <div>الخبر غير موجود ❌</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">تعديل الخبر</h1>
      <EditNewsForm currentNews={result[0]} />
    </div>
  );
};

export default page;
