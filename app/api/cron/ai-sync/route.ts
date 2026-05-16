import { db } from "@/src/db";
import { aiGenerations } from "@/src/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { 
  checkGenerationStatus, 
  internalRefundFailedTask, 
  internalUpdateGenerationStatus 
} from "@/app/actions/ai-common";

export async function GET(request: Request) {
  try {
    // التحقق من مفتاح الأمان للكرون جوب (اختياري، يفضل وضعه في Vercel)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // جلب كل المهام التي حالتها pending ومر عليها أكثر من 15 دقيقة
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const pendingTasks = await db.query.aiGenerations.findMany({
      where: and(
        eq(aiGenerations.status, "pending"),
        lt(aiGenerations.createdAt, fifteenMinutesAgo)
      ),
      limit: 50 // معالجة 50 مهمة كحد أقصى في كل تشغيلة
    });

    if (pendingTasks.length === 0) {
      return NextResponse.json({ success: true, message: "No pending tasks found" });
    }

    const results = {
      total: pendingTasks.length,
      refunded: 0,
      completed: 0,
      errors: 0
    };

    // معالجة كل مهمة بالتوازي ولكن بحذر حتى لا نضغط على الـ API
    for (const task of pendingTasks) {
      if (!task.taskUuid) continue;

      try {
        const apiRes = await checkGenerationStatus(task.taskUuid);
        
        if (!apiRes.success || !apiRes.data) {
          // إذا فشل الاتصال، نتخطى ونتركه للمرة القادمة، أو لو مر 24 ساعة نعتبره فاشل.
          // هنا للتبسيط، سنعتبره فشل إذا مرت 3 ساعات
          const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
          if (task.createdAt < threeHoursAgo) {
            await internalRefundFailedTask(task.taskUuid, task.userId, "Cron: API Status Error (Timeout)");
            await db.update(aiGenerations).set({ status: "failed", updatedAt: new Date() }).where(eq(aiGenerations.id, task.id));
            results.refunded++;
          }
          continue;
        }

        const taskData = apiRes.data?.data || apiRes.data;
        const apiStatus = taskData?.status;

        if (apiStatus === 3 || String(apiStatus).toLowerCase() === "failed") {
          // فشل التوليد
          const errorInfo = taskData.error || taskData.message || "Cron: Task Failed";
          await internalRefundFailedTask(task.taskUuid, task.userId, typeof errorInfo === 'object' ? JSON.stringify(errorInfo) : errorInfo);
          await db.update(aiGenerations).set({ status: "failed", updatedAt: new Date() }).where(eq(aiGenerations.id, task.id));
          results.refunded++;
        } 
        else if (apiStatus === 2 || String(apiStatus).toLowerCase() === "completed") {
          // التوليد نجح، لكن المستخدم لم يكن فاتحاً للصفحة لتحديثه
          let resultUrl = taskData.image_url || taskData.video_url || taskData.url;
          let resultsJson = "";

          // إذا كانت المصفوفة موجودة للصور المتعددة
          if (!resultUrl) {
            const items = taskData.generated_image || taskData.generated_video || taskData.data;
            if (Array.isArray(items) && items.length > 0) {
              const urls = items.map((i: any) => i.image_url || i.video_url || i.url).filter(Boolean);
              if (urls.length > 0) {
                resultUrl = urls[0];
                resultsJson = JSON.stringify(urls);
              }
            }
          }

          if (resultUrl) {
            await internalUpdateGenerationStatus(
              task.taskUuid, 
              task.userId, 
              "completed", 
              resultUrl, 
              taskData.thumbnail_urls?.[0] || taskData.thumbnail_url,
              resultsJson || undefined
            );
            results.completed++;
          } else {
            // اكتمل لكن لم نجد الرابط، نعتبره فشل
            await internalRefundFailedTask(task.taskUuid, task.userId, "Cron: Completed but no URL found");
            await db.update(aiGenerations).set({ status: "failed", updatedAt: new Date() }).where(eq(aiGenerations.id, task.id));
            results.refunded++;
          }
        }
      } catch (err) {
        console.error(`Cron sync error for task ${task.taskUuid}:`, err);
        results.errors++;
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
