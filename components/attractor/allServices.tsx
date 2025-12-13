"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { InferSelectModel } from "drizzle-orm";
import { serviceRequests } from "@/src/db/schema";
import Swal from "sweetalert2";
import ServiceTable from "./serviceTable";

export type ServiceRequest = InferSelectModel<typeof serviceRequests>;

const PendingServices = ({ data }: { data: ServiceRequest[] }) => {
  return (
    <div>
      <h1 className="text-2xl text-primary font-bold mb-4">الخدمات </h1>
      <ServiceTable data={data} role="attractor" />
    </div>
  );
};

export default PendingServices;
