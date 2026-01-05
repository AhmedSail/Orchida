import { initEdgeStore } from "@edgestore/server";
import {
  type CreateContextOptions,
  createEdgeStoreNextHandler,
} from "@edgestore/server/adapters/next/app";

type Context = {
  userId: string;
  userRole: "admin" | "user";
};

async function createContext({ req }: CreateContextOptions): Promise<Context> {
  // استبدل بمنطق BetterAuth أو أي نظام Auth عندك
  return { userId: "123", userRole: "admin" };
}

const es = initEdgeStore.context<Context>().create();

const edgeStoreRouter = es.router({
  publicFiles: es
    .fileBucket()
    .beforeUpload(({ ctx, input, fileInfo }) => {
      console.log("beforeUpload", ctx, input, fileInfo);
      return true;
    })
    .beforeDelete(({ ctx, fileInfo }) => {
      console.log("beforeDelete", ctx, fileInfo);
      return ctx.userRole === "admin"; // امنع الحذف إلا لو Admin
    }),

  // 👇 هذا البكت "محمي"، يعني الصور ما بتفتح إلا من خلال موقعك (لأنها تتطلب كوكي/سيشن)
  protectedFiles: es
    .fileBucket()
    .accessControl({
      OR: [{ userRole: { eq: "admin" } }, { userRole: { eq: "user" } }],
    })
    .beforeDelete(({ ctx, fileInfo }) => {
      return ctx.userRole === "admin"; // السماح بالحذف فقط للأدمن
    }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
  createContext,
});

// 👇 هذا الجزء هو اللي كان ناقص عندك
export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;
