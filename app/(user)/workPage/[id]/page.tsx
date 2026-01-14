// app/(user)/workPage/[id]/page.tsx

import WorkPage from "@/components/user/work/workPage";
import { db } from "@/src";
import { works, mediaFiles } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const workRaw = await db
    .select({
      title: works.title,
      description: works.description,
    })
    .from(works)
    .where(eq(works.id, id))
    .limit(1);

  const work = workRaw[0];

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.orchida-ods.com";

  return {
    title: work?.title ? `${work.title} | اوركيدة` : "معرض الأعمال",
    description: work?.description || "عرض تفاصيل العمل في اوركيدة",
    alternates: {
      canonical: `${baseUrl}/workPage/${id}`,
    },
  };
}
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
