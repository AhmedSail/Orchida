// app/api/serviceRequests/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db"; // تأكد من مسار db الصحيح
import { serviceRequests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // إدخال البيانات في الجدول
    await db.insert(serviceRequests).values({
      id: uuidv4(), // توليد id فريد
      serviceId: body.serviceId,
      clientId: body.clientId, // أو اجلبه من الـ session إذا عندك Auth
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone || null,
      name: body.name,
      description: body.description,
      budget: body.budget ? body.budget : null,
      status: "pending", // الحالة الافتراضية
      duration: body.duration || null,
      assignedTo: null,
      contractUrl: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inserting service request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to insert service request" },
      { status: 500 }
    );
  }
}

// لو بدك تجيب كل الطلبات
export async function GET() {
  try {
    const requests = await db.select().from(serviceRequests);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch service requests" },
      { status: 500 }
    );
  }
}
