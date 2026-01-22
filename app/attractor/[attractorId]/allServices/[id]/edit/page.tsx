import EditServiceRequestForm from "@/components/attractor/EditserviceRequestForm";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { digitalServices, serviceRequests, users } from "@/src/db/schema";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "لوحة المستقطب | تعديل على الخدمة",
};
const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in"); // لو مش مسجل دخول
  }

  let requests: any[] = [];
  requests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id));
  const services = await db.select().from(digitalServices);
  return (
    <div>
      <EditServiceRequestForm
        service={requests[0]}
        services={services}
        userId={session.user.id}
      />
    </div>
  );
};

export default page;
