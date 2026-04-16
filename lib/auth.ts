import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src"; // your drizzle instance
import * as schema from "@/src/db/schema";
import bcrypt from "bcryptjs";

interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
  session: {
    expiresIn: 60 * 60 * 6, // 6 hours
    updateAge: 60 * 60, // Update session age every hour
  },

  // 👇 هنا تحط إعدادات الكوكيز
  cookies: {
    sessionToken: {
      name: "better-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax", // ضروري جداً للجوال
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },

  // trustedOrigins مهم للتعامل مع الـ Redirects والأمان
  trustedOrigins: [
    process.env.NEXT_PUBLIC_BASE_URL as string,
    "https://orchida-liard.vercel.app",
    "https://www.orchida-ods.com",
  ],

  user: {
    additionalFields: {
      role: { type: "string" }, // ✅ إضافة role هنا
      image: { type: "string" },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const { sendEmail } = await import("./email");
      // HTML email template مع شعار وهيدر
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        
        <h1 style="color: #675795;font-size: 35px;">Orchida</h1>
        <h2 style="color: #333;">تأكيد البريد الإلكتروني</h2>
        <p style="color: #555; font-size: 16px;">
          شكراً لتسجيلك معنا! يرجى الضغط على الزر أدناه لتأكيد بريدك الإلكتروني وإكمال عملية التسجيل.
        </p>
        <a href="${url}" 
           style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 6px;">
          تأكيد البريد الإلكتروني
        </a>
        <p style="margin-top: 30px; font-size: 14px; color: #888;">
          إذا لم يعمل الزر، يمكنك نسخ الرابط التالي ولصقه في المتصفح:<br/>
          <span style="color: #007BFF;">${url}</span>
        </p>
      </div>
    `;

      await sendEmail({
        to: user.email,
        subject: "تأكيد عنوان البريد الإلكتروني",
        text: `اضغط على الرابط لتأكيد بريدك الإلكتروني: ${url}`,
        html: htmlContent,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ password, hash }) => {
        // Handle bcrypt hashes
        if (hash.startsWith("$2")) {
          return await bcrypt.compare(password, hash);
        }
        return false;
      },
    },

    // ✅ هنا تضع دوال reset password
    sendResetPassword: async ({ user, url, token }, request) => {
      const { sendEmail } = await import("./email");
      await sendEmail({
        to: user.email,
        subject: "إعادة تعيين كلمة المرور",
        text: `اضغط على الرابط لإعادة تعيين كلمة المرور: ${url}`,
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h1 style="color: #675795;font-size: 35px;">Orchida</h1>
          <h2 style="color: #333;">إعادة تعيين كلمة المرور</h2>
          <p style="color: #555; font-size: 16px;">
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه للمتابعة.
          </p>
          <a href="${url}" 
             style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 6px;">
            إعادة تعيين كلمة المرور
          </a>
          <p style="margin-top: 30px; font-size: 14px; color: #888;">
            إذا لم يعمل الزر، يمكنك نسخ الرابط التالي:<br/>
            <span style="color: #007BFF;">${url}</span>
          </p>
        </div>
        `,
      });
    },

    onPasswordReset: async ({ user }, request) => {},
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account", // لو بدك يجبر المستخدم يختار حساب كل مرة
      accessType: "offline", // لو بدك refresh token دائم

      // تم تغيير profile إلى mapProfileToUser لحل مشكلة التايب
      mapProfileToUser: (profile: GoogleProfile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user", // ✅ لو بدك تعطي دور افتراضي لمستخدم Google
        };
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user: any) => {
          // You can add logic here if needed for new users
        },
      },
    },
    session: {
      create: {
        before: async (session: any) => {
          // قبل إنشاء الجلسة، نتأكد إذا كان المستخدم زائر ونحوله لمستخدم عادي
          const { users } = await import("@/src/db/schema");
          const { eq } = await import("drizzle-orm");

          const userData = await db
            .select()
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);

          if (userData[0] && userData[0].role === "guest") {
            await db
              .update(users)
              .set({ role: "user" })
              .where(eq(users.id, userData[0].id));
          }
        },
      },
    },
  },
});
