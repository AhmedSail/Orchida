import ClientServices from "@/components/user/service/clientServices";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/src/db";
import { digitalServices, serviceRequests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import EditServiceRequestForm from "@/components/user/service/EditserviceRequestForm";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return redirect("/sign-in");
  }
  let requests: any[] = [];
  requests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id));
  const services = await db.select().from(digitalServices);
  return (
    <div>
      <EditServiceRequestForm service={requests[0]} services={services} />
    </div>
  );
};

export default page;
