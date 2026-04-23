import { db } from "@/src";
import { trendingProducts, courses, courseEnrollments, courseApplications, courseSections, users } from "@/src/db/schema";
import { NextResponse } from "next/server";
import { eq, desc, or, like, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/email";

// GET: Fetch all trending products
export async function GET() {
  try {
    const products = await db
      .select()
      .from(trendingProducts)
      .orderBy(desc(trendingProducts.order), desc(trendingProducts.createdAt));
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending products" },
      { status: 500 }
    );
  }
}

// POST: Add new trending product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, imageUrl, link, source, isActive, order } = body;

    const newProduct = await db
      .insert(trendingProducts)
      .values({
        id: uuidv4(),
        name,
        description,
        imageUrl,
        link,
        source: source || "AliExpress",
        isActive: isActive ?? true,
        order: order ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const product = newProduct[0];

    // ✅ إرسال إشعارات بالبريد الإلكتروني للمهتمين بدورات التجارة
    (async () => {
      try {
        // 1. العثور على الكورسات المتعلقة بالتجارة
        const commerceCourses = await db
          .select({ id: courses.id })
          .from(courses)
          .where(
            or(
              like(courses.title, "%تجارة%"),
              like(courses.title, "%commerce%"),
              like(courses.title, "%E-commerce%"),
              like(courses.title, "%دروبشيبينغ%"),
              like(courses.title, "%Dropshipping%")
            )
          );

        if (commerceCourses.length === 0) return;

        const courseIds = commerceCourses.map((c) => c.id);

        // 2. جلب إيميلات المسجلين في هذه الكورسات
        const enrolledStudents = await db
          .select({ email: courseEnrollments.studentEmail })
          .from(courseEnrollments)
          .innerJoin(courseSections, eq(courseEnrollments.sectionId, courseSections.id))
          .where(inArray(courseSections.courseId, courseIds));

        // 3. جلب إيميلات المهتمين (Applications) بهذه الكورسات - النظام الجديد
        const interestedApps = await db
          .select({ email: users.email })
          .from(courseApplications)
          .innerJoin(users, eq(courseApplications.userId, users.id))
          .where(inArray(courseApplications.courseId, courseIds));

        // 4. دمج وتصفية الإيميلات المتكررة
        const allEmails = Array.from(
          new Set([
            ...enrolledStudents.map((s) => s.email),
            ...interestedApps.filter(a => a.email).map((a) => a.email!)
          ])
        );

        if (allEmails.length === 0) return;

        // 5. إرسال الإيميلات
        const emailSubject = `🔥 منتج رائج جديد: ${product.name}`;
        const emailHtml = `
          <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6e5e9b;">أهلاً بك في أوركيدة!</h2>
            <p>لقد قمنا بإضافة منتج رائج جديد قد يهمك في مجال التجارة الإلكترونية:</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${product.name}</h3>
              <p>${product.description || ""}</p>
              ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; border-radius: 8px;" />` : ""}
            </div>
            <a href="https://www.orchida-ods.com/trending" style="display: inline-block; background: #6e5e9b; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">تصفح المنتج الآن</a>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">وصلك هذا الإيميل لأنك مسجل أو مهتم بدورات التجارة الإلكترونية لدينا.</p>
          </div>
        `;

        for (const email of allEmails) {
          await sendEmail({
            to: email,
            subject: emailSubject,
            text: `منتج جديد: ${product.name}`,
            html: emailHtml,
          });
        }
        
        console.log(`✅ Sent notification emails to ${allEmails.length} recipients.`);
      } catch (err) {
        console.error("❌ Failed to send notification emails:", err);
      }
    })();

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating trending product:", error);
    return NextResponse.json(
      { error: "Failed to create trending product" },
      { status: 500 }
    );
  }
}
