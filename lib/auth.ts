import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src"; // your drizzle instance
import * as schema from "@/src/db/schema";
import { sendEmail } from "./email";

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
    "https://orchida-ods.com",
  ],

  user: {
    additionalFields: {
      role: { type: "string" }, // ✅ إضافة role هنا
      image: { type: "string" },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
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

      if (process.env.NODE_ENV === "development") {
        console.log(
          "--------------- EMAIL VERIFICATION LINK (DEV) ---------------"
        );
        console.log(url);
        console.log(
          "-------------------------------------------------------------"
        );
      }

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

    // ✅ هنا تضع دوال reset password
    sendResetPassword: async ({ user, url, token }, request) => {
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

      if (process.env.NODE_ENV === "development") {
        console.log(
          "--------------- RESET PASSWORD LINK (DEV) ---------------"
        );
        console.log(url);
        console.log(
          "---------------------------------------------------------"
        );
      }
    },

    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
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
});
