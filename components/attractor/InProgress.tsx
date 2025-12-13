import { eq, InferSelectModel } from "drizzle-orm";
import { serviceRequests, users } from "@/src/db/schema";

import ServiceTable from "./serviceTable";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/src/db";

export type ServiceRequest = InferSelectModel<typeof serviceRequests>;

const InProgress = async ({
  data,
  role,
}: {
  data: ServiceRequest[];
  role?: string;
}) => {
  return (
    <div>
      <h1 className="text-2xl text-primary font-bold mb-4">الخدمات الفعّالة</h1>
      <ServiceTable data={data} role={role} />
    </div>
  );
};

export default InProgress;
