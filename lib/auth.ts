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
        sameSite: "none", // ضروري للجوال
        secure: true, // لازم HTTPS
      },
    },
  },

  user: {
    additionalFields: {
      role: { type: "string" }, // ✅ إضافة role هنا
      image: { type: "string" },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${token}`;
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${verifyUrl}`,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    // ✅ هنا تضع دوال reset password
    sendResetPassword: async ({ user, url, token }, request) => {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/reset-password?token=${token}`;
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${resetUrl}`,
      });
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

      profile(profile: GoogleProfile) {
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
