import ServiceRequestForm from "@/components/user/service/serviceRequestForm";
import { db } from "@/src/db";
import { digitalServices } from "@/src/db/schema";
import React from "react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| طلب خدمة",
};
const page = async () => {
  const services = await db.select().from(digitalServices);
  const filterServices = services.filter(
    (service) => service.isActive === true
  );
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <div>
      <ServiceRequestForm services={filterServices} />
    </div>
  );
};

export default page;
