import ClientServices from "@/components/user/service/clientServices";
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { serviceRequests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| خدماتي",
};
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
    .where(eq(serviceRequests.clientId, session.user.id));
  return (
    <div>
      <ClientServices requests={requests} userId={id} />
    </div>
  );
};

export default page;
