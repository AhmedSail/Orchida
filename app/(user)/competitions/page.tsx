import { db } from "@/src/db";
import {
  quizSessions,
  quizzes,
  quizParticipants,
  quizResponses,
} from "@/src/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { Trophy, Medal, Calendar, Award } from "lucide-react";
import React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Force dynamic rendering to get latest results
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompetitionsResultPage() {
  // 1. Fetch finished sessions
  const sessions = await db
    .select({
      id: quizSessions.id,
      pin: quizSessions.pin,
      createdAt: quizSessions.createdAt,
      quizTitle: quizzes.title,
      coverImage: quizzes.coverImage,
    })
    .from(quizSessions)
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(eq(quizSessions.status, "finished"))
    .orderBy(desc(quizSessions.createdAt));

  // 2. For each session, fetch top 3 winners
  const sessionsWithWinners = await Promise.all(
    sessions.map(async (session) => {
      const winners = await db
        .select({
          nickname: quizParticipants.nickname,
          score: quizParticipants.score,
          totalTime: sql<number>`SUM(${quizResponses.responseTime})`.mapWith(
            Number,
          ),
        })
        .from(quizParticipants)
        .leftJoin(
          quizResponses,
          eq(quizParticipants.id, quizResponses.participantId),
        )
        .where(eq(quizParticipants.sessionId, session.id))
        .groupBy(
          quizParticipants.id,
          quizParticipants.nickname,
          quizParticipants.score,
        )
        .orderBy(
          desc(quizParticipants.score),
          asc(sql`SUM(${quizResponses.responseTime})`),
        )
        .limit(3);

      return {
        ...session,
        winners,
      };
    }),
  );

  return (
    <div className="min-h-screen  py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-4">
            <Trophy className="h-12 w-12 text-amber-500 animate-bounce" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            لوحة شرف الأبطال
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نحتفي هنا بالفائزين في مسابقات أوكيدة. هؤلاء هم الأبطال الذين أثبتوا
            جدارتهم!
          </p>
        </div>

        {sessionsWithWinners.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl backdrop-blur-sm border border-white">
            <Award className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400">
              لا توجد مسابقات منتهية بعد
            </h3>
            <p className="text-gray-400">ترقبوا المسابقات القادمة!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessionsWithWinners.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-[2rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-10 -translate-y-10 blur-2xl" />
                  <h3 className="text-2xl font-bold relative z-10 mb-2">
                    {session.quizTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-indigo-100 text-sm relative z-10">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(session.createdAt), "dd MMMM yyyy", {
                      locale: ar,
                    })}
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 my-2">
                    {session.winners.map((winner, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          index === 0
                            ? "bg-amber-50 border-amber-100"
                            : index === 1
                              ? "bg-slate-50 border-slate-100"
                              : "bg-orange-50/50 border-orange-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-sm shadow-sm ${
                              index === 0
                                ? "bg-amber-500 text-white"
                                : index === 1
                                  ? "bg-slate-400 text-white"
                                  : "bg-orange-400 text-white"
                            }`}
                          >
                            {index === 0 && <Trophy className="h-4 w-4" />}
                            {index !== 0 && `#${index + 1}`}
                          </div>
                          <span
                            className={`font-bold ${
                              index === 0 ? "text-amber-900" : "text-gray-800"
                            }`}
                          >
                            {winner.nickname}
                          </span>
                        </div>
                        <div className="font-black text-gray-500 bg-white px-2 py-1 rounded-lg text-sm shadow-sm">
                          {winner.score} نقطة
                        </div>
                      </div>
                    ))}

                    {session.winners.length === 0 && (
                      <div className="text-center text-gray-400 py-4 text-sm">
                        لم يشارك أحد في هذه المسابقة
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
