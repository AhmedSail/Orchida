import AboutPage from "@/components/about";
import React from "react";
import { Metadata } from "next";
import { db } from "@/src/db";
import { companies } from "@/src/db/schema";
import { eq } from "drizzle-orm";
export const metadata: Metadata = {
  title: "اوركيدة",
  description: "اوكيدة| عن اوركيدة",
};

type CompanyFormValues = {
  name: string;
  phone: string;
  accountNumber?: string;
  ibanShekel?: string;
  ibanDinar?: string;
  ibanDollar?: string;
  videoUrl?: string;
  managerMessage?: string;
};
const page = async () => {
  const company = await db
    .select()
    .from(companies)
    .where(eq(companies.id, "orchid-company"))
    .limit(1);

  const normalizedCompany: Partial<CompanyFormValues> = {
    name: company[0].name ?? "",
    phone: company[0].phone ?? "",
    accountNumber: company[0].accountNumber ?? "",
    ibanShekel: company[0].ibanShekel ?? "",
    ibanDinar: company[0].ibanDinar ?? "",
    ibanDollar: company[0].ibanDollar ?? "",
    videoUrl: company[0].videoUrl ?? "",
    managerMessage: company[0].managerMessage ?? "",
  };
  return (
    <div>
      <AboutPage company={normalizedCompany} />
    </div>
  );
};

export default page;
