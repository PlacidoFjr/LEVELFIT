import type { AuthUser } from "./auth-client";
import { user as mockUser } from "./mock-data";

export function getUserProgress(sessionUser?: AuthUser | null) {
  const level = sessionUser?.level?.level ?? mockUser.level;
  const currentXp = sessionUser?.level?.currentLevelXp ?? mockUser.currentXp;
  const nextLevelXp = sessionUser?.level?.nextLevelXp ?? mockUser.nextLevelXp;
  const totalXp = sessionUser?.level?.totalXp ?? 8640;
  const dailyStreak = sessionUser?.streaks?.find((streak) => streak.type === "daily")?.currentCount ?? mockUser.streak;

  return {
    level,
    currentXp,
    nextLevelXp,
    totalXp,
    streak: dailyStreak,
    levelName: level <= 1 ? "Primeiro passo" : level < 5 ? "Ritmo inicial" : level < 10 ? "Ritmo crescente" : mockUser.levelName,
  };
}
