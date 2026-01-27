"use server";

import { db } from "@/src";
import { jobs, jobApplications } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function checkAdminAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  // Ideally check for admin role here if available in session or db
  return session;
}

export async function createJob(data: {
  title: string;
  department: string;
  description: string;
}) {
  await checkAdminAuth();
  await db.insert(jobs).values({
    id: crypto.randomUUID(),
    title: data.title,
    department: data.department,
    description: data.description,
    isActive: true,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateJob(
  id: string,
  data: {
    title: string;
    department: string;
    description: string;
    isActive?: boolean;
  },
) {
  await checkAdminAuth();
  await db
    .update(jobs)
    .set({
      title: data.title,
      department: data.department,
      description: data.description,
      isActive: data.isActive,
    })
    .where(eq(jobs.id, id));

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteJob(id: string) {
  await checkAdminAuth();
  await db.delete(jobs).where(eq(jobs.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleJobStatus(id: string, currentStatus: boolean) {
  await checkAdminAuth();
  await db
    .update(jobs)
    .set({ isActive: !currentStatus })
    .where(eq(jobs.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function submitApplication(data: {
  jobId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  major?: string;
  education?: string;
  experienceYears?: string;
  gender?: string;
  location?: string;
  age?: string;
  cv?: string; // URL
  notes?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  // Check if job is active
  const jobResults = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, data.jobId))
    .limit(1);
  const job = jobResults[0];

  if (!job) {
    return { success: false, error: "JOB_NOT_FOUND" };
  }

  if (!job.isActive) {
    return { success: false, error: "JOB_CLOSED" };
  }

  // Check if already applied
  const existingApplications = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.jobId, data.jobId),
        eq(jobApplications.userId, session.user.id), // Use session user id for security
      ),
    )
    .limit(1);

  if (existingApplications.length > 0) {
    return { success: false, error: "ALREADY_APPLIED" };
  }

  // Robust number parsing helper (handles Arabic-Indic digits too)
  const parseSafeInt = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === "") return null;
    const str = String(val).replace(/[٠-٩]/g, (d) =>
      "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString(),
    );
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? null : parsed;
  };

  try {
    console.log(
      "Submitting job application for user:",
      session.user.id,
      "job:",
      data.jobId,
    );
    console.log("Application data:", {
      ...data,
      cv: data.cv ? "EXISTS" : "MISSING",
    });

    await db.insert(jobApplications).values({
      id: crypto.randomUUID(),
      jobId: data.jobId,
      userId: session.user.id,
      applicantName: data.name,
      applicantEmail: data.email,
      applicantPhone: data.phone,
      applicantWhatsapp: data.whatsapp,
      applicantMajor: data.major,
      applicantEducation: data.education,
      applicantExperienceYears: parseSafeInt(data.experienceYears),
      applicantGender: data.gender,
      applicantLocation: data.location,
      applicantAge: parseSafeInt(data.age),
      applicantCV: data.cv,
      notes: data.notes,
    });

    console.log("Application submitted successfully");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in submitApplication action:", error);
    // Log specific info about the data that failed
    return {
      success: false,
      error: "DATABASE_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
}

export async function deleteApplication(id: string) {
  await checkAdminAuth();
  await db.delete(jobApplications).where(eq(jobApplications.id, id));
  revalidatePath("/admin");
}
