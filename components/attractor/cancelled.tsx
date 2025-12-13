"use client";

import React, { useState } from "react";

import { InferSelectModel } from "drizzle-orm";
import { serviceRequests } from "@/src/db/schema";

import ServiceTable from "./serviceTable";

export type ServiceRequest = InferSelectModel<typeof serviceRequests>;

const Cancelled = ({
  data,
  role,
}: {
  data: ServiceRequest[];
  role?: string;
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>(data);

  return (
    <div>
      <h1 className="text-2xl text-primary font-bold mb-4">الخدمات الملغية</h1>
      <ServiceTable data={data} role={role} />
    </div>
  );
};

export default Cancelled;
