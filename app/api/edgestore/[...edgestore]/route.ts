import { initEdgeStore } from "@edgestore/server";
import {
  type CreateContextOptions,
  createEdgeStoreNextHandler,
} from "@edgestore/server/adapters/next/app";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type Context = {
  userId: string;
  userRole:
    | "user"
    | "admin"
    | "coordinator"
    | "attractor"
    | "instructor"
    | "content_creator"
    | "guest";
};

async function createContext({ req }: CreateContextOptions): Promise<Context> {
  try {
    // استخدم req.headers مباشرة أفضل في السياقات المختلفة
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const userId = session?.user?.id ?? "anonymous";
    const userRole = (session?.user?.role as any) ?? "guest";

    console.log(
      `[EdgeStore] Context Created - User: ${userId}, Role: ${userRole}`
    );

    return {
      userId,
      userRole,
    };
  } catch (error) {
    console.error("[EdgeStore] Error in createContext:", error);
    return {
      userId: "anonymous",
      userRole: "guest",
    };
  }
}

const es = initEdgeStore.context<Context>().create();

const edgeStoreRouter = es.router({
  publicFiles: es
    .fileBucket()
    .beforeUpload(({ ctx, input, fileInfo }) => {
      // السماح لجميع المسجلين بالرفع
      return ctx.userRole !== "guest";
    })
    .beforeDelete(({ ctx, fileInfo }) => {
      console.log(
        `[EdgeStore] Attempting delete from public - Role: ${ctx.userRole}, Path: ${fileInfo.path}`
      );
      const staffRoles = [
        "admin",
        "coordinator",
        "instructor",
        "attractor",
        "content_creator",
        "user",
      ];
      return staffRoles.includes(ctx.userRole);
    }),

  // إبقاء protectedFiles مؤقتاً لتجنب كراش المكونات القديمة، مع جعلها تعمل كـ public
  protectedFiles: es
    .fileBucket()
    .accessControl({
      OR: [
        { userRole: { eq: "admin" } },
        { userRole: { eq: "user" } },
        { userRole: { eq: "coordinator" } },
        { userRole: { eq: "instructor" } },
        { userRole: { eq: "attractor" } },
        { userRole: { eq: "content_creator" } },
      ],
    })
    .beforeDelete(({ ctx, fileInfo }) => {
      const staffRoles = [
        "admin",
        "coordinator",
        "instructor",
        "attractor",
        "content_creator",
        "user",
      ];
      return staffRoles.includes(ctx.userRole);
    }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
  createContext,
});

// 👇 هذا الجزء هو اللي كان ناقص عندك
export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;
