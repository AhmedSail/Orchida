import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HomeView from "@/src/modules/home/ui/view/home-view";
import {
  digitalServices,
  news,
  serviceRequests,
  sliders,
} from "@/src/db/schema";
import { db } from "@/src";
import { eq } from "drizzle-orm";

const page = async () => {
  // ✅ جيب الخدمات
  const services = await db.select().from(digitalServices);

  const slidersPhoto = await db.select().from(sliders);
  const newsData = await db.select().from(news);

  return (
    <div>
      {/* مرر الخدمات + الطلبات للـ HomeView */}
      <HomeView services={services} sliders={slidersPhoto} news={newsData} />
    </div>
  );
};

export default page;
