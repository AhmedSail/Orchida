import React from "react";
import { db } from "@/src/db";
import { serviceRequests, users } from "@/src/db/schema";
import AllServices from "@/components/attractor/allServices";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المستقطب | كل الخدمات",
};
const page = async () => {
  const servicesRequests = await db.select().from(serviceRequests);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  return (
    <div>
      <AllServices data={servicesRequests} userId={session.user.id} />
    </div>
  );
};

export default page;
