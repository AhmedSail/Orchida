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

  const c = company.at(0); // لو ما في بيانات، c = undefined

  const normalizedCompany: Partial<CompanyFormValues> = {
    name: c?.name ?? "",
    phone: c?.phone ?? "",
    accountNumber: c?.accountNumber ?? "",
    ibanShekel: c?.ibanShekel ?? "",
    ibanDinar: c?.ibanDinar ?? "",
    ibanDollar: c?.ibanDollar ?? "",
    videoUrl: c?.videoUrl ?? "",
    managerMessage: c?.managerMessage ?? "",
    facebookUrl: c?.facebookUrl ?? "",
    instagramUrl: c?.instagramUrl ?? "",
    twitterUrl: c?.twitterUrl ?? "",
    whatsappUrl: c?.whatsappUrl ?? "",
    linkedinUrl: c?.linkedinUrl ?? "",
    tiktokUrl: c?.tiktokUrl ?? "",
  };

  return (
    <div>
      <CompanyFormPage company={normalizedCompany} />
    </div>
  );
};

export default page;
