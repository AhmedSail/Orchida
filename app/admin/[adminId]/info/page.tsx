import CompanyFormPage from "@/components/companyInfo";
import { db } from "@/src/db";
import { companies } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
type CompanyFormValues = {
  name: string;
  phone: string;
  accountNumber?: string;
  ibanShekel?: string;
  ibanDinar?: string;
  ibanDollar?: string;
  videoUrl?: string;
  managerMessage?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
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
    facebookUrl: company[0].facebookUrl ?? "",
    instagramUrl: company[0].instagramUrl ?? "",
    twitterUrl: company[0].twitterUrl ?? "",
    whatsappUrl: company[0].whatsappUrl ?? "",
    linkedinUrl: company[0].linkedinUrl ?? "",
    tiktokUrl: company[0].tiktokUrl ?? "",
  };
  return (
    <div>
      <CompanyFormPage company={normalizedCompany} />
    </div>
  );
};

export default page;
