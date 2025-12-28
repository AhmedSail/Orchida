import React from "react";
import { db } from "@/src/db";
import { serviceRequests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import Contract from "@/components/contract";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| العقد",
};
const page = async ({ params }: { params: { id: string } }) => {
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
