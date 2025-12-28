// app/(user)/workPage/[id]/page.tsx

import WorkPage from "@/components/user/work/workPage";
import { db } from "@/src";
import { works, mediaFiles } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| عرض العمل",
};
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  // جلب العمل
  const result = await db.select().from(works).where(eq(works.id, id));
  const work = result[0];

  if (!work) {
    return <div>العمل غير موجود ❌</div>;
  }

  // جلب الوسائط المرتبطة بالعمل
  const media = await db
    .select()
    .from(mediaFiles)
    .where(eq(mediaFiles.workId, id));

  return (
    <div>
      <WorkPage work={work} media={media} />
    </div>
  );
}
