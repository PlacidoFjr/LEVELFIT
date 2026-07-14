import type { AuthUser } from "./auth-client";
export function getUserProgress(sessionUser?: AuthUser | null) {
  const level = sessionUser?.level?.level ?? 1;
  const currentXp = sessionUser?.level?.currentLevelXp ?? 0;
  const nextLevelXp = sessionUser?.level?.nextLevelXp ?? 100;
  const totalXp = sessionUser?.level?.totalXp ?? 0;
  const dailyStreak = sessionUser?.streaks?.find((streak) => streak.type === "daily")?.currentCount ?? 0;

  return {
    level,
    currentXp,
    nextLevelXp,
    totalXp,
    streak: dailyStreak,
    levelName: level <= 1 ? "Primeiro passo" : level < 5 ? "Ritmo inicial" : level < 10 ? "Ritmo crescente" : "Ritmo forte",
  };
}
