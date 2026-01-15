import CompanyFormPage from "@/components/companyInfo";
import { db } from "@/src/db";
import { companies } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { Building2, Settings2 } from "lucide-react";

type CompanyFormValues = {
  name: string;
  phoneToCall: string;
  phoneToBank?: string;
  email?: string;
  address?: string;
  workingHours?: string;
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

  const c = company.at(0);

  const normalizedCompany: Partial<CompanyFormValues> = {
    name: c?.name ?? "",
    phoneToCall: c?.phoneToCall ?? "",
    phoneToBank: c?.phoneToBank ?? "",
    email: c?.email ?? "",
    address: c?.address ?? "",
    workingHours: c?.workingHours ?? "",
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
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8" dir="rtl">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Building2 size={28} />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                إعدادات الشركة
              </h1>
            </div>
            <p className="text-slate-500 mr-12">
              تحكم في هوية الشركة، وسائل التواصل، وبيانات الحسابات البنكية.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-600">
            <Settings2 size={16} />
            تحديث تلقائي مفعل
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-1">
            <CompanyFormPage company={normalizedCompany} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
