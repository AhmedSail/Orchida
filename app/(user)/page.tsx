import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import HomeView from "@/src/modules/home/ui/view/home-view";
import {
  courses,
  courseSections,
  digitalServices,
  news,
  serviceRequests,
  sliders,
  studentWorks,
  users,
  jobs,
} from "@/src/db/schema";
import { db } from "@/src";
import { eq, inArray, desc } from "drizzle-orm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "أوركيدة للخدمات الرقمية والأكاديمية | الرئيسية",
  description:
    "أوركيدة، شريكك الأمثل للحلول الرقمية المتكاملة والتدريب الأكاديمي المتقدم. نقدم خدمات البرمجة، التصميم، التسويق، ودورات تدريبية احترافية.",
  alternates: {
    canonical: "https://www.orchida-ods.com",
  },
};

import JsonLd from "@/components/ui/JsonLd";

const page = async () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.orchida-ods.com";

  // ✅ جلب جميع البيانات بالتوازي مع ترتيب الأخبار تنازلياً
  const [
    services,
    slidersPhoto,
    newsData,
    sections,
    rowData,
    studentStories,
    activeJobs,
  ] = await Promise.all([
    db.select().from(digitalServices),
    db.select().from(sliders),
    db.select().from(news).orderBy(desc(news.publishedAt)),
    db.select().from(courseSections),
    db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        imageUrl: courses.imageUrl,
        hours: courses.hours,
        price: courses.price,
        duration: courses.duration,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        approvedAt: courses.approvedAt,
        currency: courses.currency,
        sectionId: courseSections.id,
        sectionNumber: courseSections.sectionNumber,
        startDate: courseSections.startDate,
        endDate: courseSections.endDate,
        status: courseSections.status,
      })
      .from(courses)
      .leftJoin(courseSections, eq(courses.id, courseSections.courseId))
      .where(inArray(courseSections.status, ["open", "in_progress"])),
    db
      .select({
        id: studentWorks.id,
        title: studentWorks.title,
        description: studentWorks.description,
        type: studentWorks.type,
        mediaUrl: studentWorks.mediaUrl,
        studentName: users.name,
      })
      .from(studentWorks)
      .innerJoin(users, eq(studentWorks.studentId, users.id))
      .where(eq(studentWorks.status, "approved"))
      .limit(6),
    db.select().from(jobs),
  ]);

  const rows = rowData;

  const allCourses = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    hours: row.hours,
    price: row.price,
    duration: row.duration,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    approvedAt: row.approvedAt,
    currency: row.currency,
    // ممكن تضيف sections كمصفوفة منفصلة لو بدك
  }));

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "اوركيدة",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "أوركيدة، شريكك الأمثل للحلول الرقمية المتكاملة والتدريب الأكاديمي المتقدم.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+972-598-919-125", // Replace with real phone if known, or leave as placeholder for user to update
      contactType: "customer service",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "اوركيدة",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const navigationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "الرئيسية",
        url: `${baseUrl}/`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "آخر المستجدات والأخبار",
        url: `${baseUrl}/latest`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "الخدمات الرقمية",
        url: `${baseUrl}/services`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "الدورات التدريبية",
        url: `${baseUrl}/courses`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "من نحن",
        url: `${baseUrl}/about`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 6,
        name: "اتصل بنا",
        url: `${baseUrl}/contact`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 7,
        name: "تسجيل الدخول",
        url: `${baseUrl}/sign-in`,
      },
    ],
  };

  return (
    <div>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={navigationJsonLd} />
      {/* مرر الخدمات + الطلبات للـ HomeView */}
      <HomeView
        services={services}
        sliders={slidersPhoto}
        news={newsData}
        allCourses={allCourses}
        sections={sections}
        studentStories={studentStories}
        jobs={activeJobs}
      />
    </div>
  );
};

export default page;
