import React from "react";
import { db } from "@/src/db";
import { serviceRequests, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import Contract from "@/components/contract";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المستقطب | العقد",
};
const page = async ({ params }: { params: { id: string } }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  const { id } = await params;
  const servicesRequests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id));
  return (
    <div>
      <Contract data={servicesRequests[0]} />
    </div>
  );
};

export default page;
