import AboutPage from "@/components/about";

import { Metadata } from "next";
import { db } from "@/src/db";
import { companies } from "@/src/db/schema";
import { eq } from "drizzle-orm";
export const metadata: Metadata = {
  title: "من نحن | أوركيدة للخدمات الرقمية والأكاديمية",
  description:
    "تعرف على شركة أوركيدة، رؤيتنا، رسالتنا، وفريقنا المتميز في تقديم الحلول الرقمية والدورات التدريبية.",
  alternates: {
    canonical: "https://orchida-ods.com/about",
  },
};

type CompanyFormValues = {
  name: string;
  phoneToCall: string;
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
    phoneToCall: company[0].phoneToCall ?? "",
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
