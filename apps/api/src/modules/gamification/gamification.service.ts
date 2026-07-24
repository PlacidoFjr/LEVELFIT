import { Injectable } from "@nestjs/common";
import { MissionType, Prisma, XpReason } from "@prisma/client";
import { asUtcDate } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

type DatabaseClient = Prisma.TransactionClient | PrismaService;
type RankingScope = "global" | "nutrition" | "run";
type AchievementRule = {
  key: string;
  reason?: XpReason;
  count?: number;
  minLevel?: number;
  minDailyStreak?: number;
  missionType?: MissionType;
  sameDayMissionCount?: number;
  requiresMissionTypes?: MissionType[];
};

const achievementRules: AchievementRule[] = [
  { key: "first-mission", reason: "mission_completed", count: 1 },
  { key: "mission-5", reason: "mission_completed", count: 5 },
  { key: "mission-20", reason: "mission_completed", count: 20 },
  { key: "mission-50", reason: "mission_completed", count: 50 },
  { key: "first-workout", reason: "workout_completed", count: 1 },
  { key: "workout-3", reason: "workout_completed", count: 3 },
  { key: "workout-10", reason: "workout_completed", count: 10 },
  { key: "workout-25", reason: "workout_completed", count: 25 },
  { key: "workout-50", reason: "workout_completed", count: 50 },
  { key: "water-first", reason: "water_goal_completed", count: 1 },
  { key: "water-3", reason: "water_goal_completed", count: 3 },
  { key: "water-week", reason: "water_goal_completed", count: 7 },
  { key: "water-21", reason: "water_goal_completed", count: 21 },
  { key: "nutrition-first", reason: "nutrition_checklist_completed", count: 1 },
  { key: "nutrition-3", reason: "nutrition_checklist_completed", count: 3 },
  { key: "nutrition-21", reason: "nutrition_checklist_completed", count: 21 },
  { key: "streak-three", minDailyStreak: 3 },
  { key: "streak-seven", minDailyStreak: 7 },
  { key: "streak-fourteen", minDailyStreak: 14 },
  { key: "streak-thirty", minDailyStreak: 30 },
  { key: "level-2", minLevel: 2 },
  { key: "level-5", minLevel: 5 },
  { key: "level-10", minLevel: 10 },
  { key: "return-kindly", missionType: "recovery", count: 1 },
  { key: "gentle-day", missionType: "recovery", count: 1 },
  { key: "recovery-7", missionType: "recovery", count: 7 },
  { key: "no-extremes", missionType: "recovery", count: 10 },
  { key: "progress-first-checkin", missionType: "progress", count: 1 },
  { key: "balanced-week", requiresMissionTypes: ["workout", "water", "nutrition"] },
  { key: "all-day-flow", sameDayMissionCount: 5 },
];

function levelFromXp(totalXp: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(totalXp / 100)) + 1);
  const currentFloor = Math.pow(level - 1, 2) * 100;
  const nextFloor = Math.pow(level, 2) * 100;
  return { level, currentLevelXp: totalXp - currentFloor, nextLevelXp: nextFloor - currentFloor };
}

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async awardXp(userId: string, amount: number, reason: XpReason, idempotencyKey: string, sourceRefType?: string, sourceRefId?: string, client?: DatabaseClient) {
    const db = client ?? this.prisma;
    const existing = await db.xpEvent.findUnique({ where: { idempotencyKey } });
    if (existing) return { awarded: 0, duplicate: true };
    await db.xpEvent.create({ data: { userId, amount, reason, idempotencyKey, sourceRefType, sourceRefId } });
    const current = await db.userLevel.upsert({ where: { userId }, create: { userId }, update: {} });
    const totalXp = current.totalXp + amount;
    const level = levelFromXp(totalXp);
    await db.userLevel.update({ where: { userId }, data: { totalXp, ...level } });
    await this.countDailyStreak(userId, db);
    await this.unlockEligibleAchievements(userId, level.level, db);
    return { awarded: amount, duplicate: false, totalXp, ...level };
  }

  private async countDailyStreak(userId: string, db: DatabaseClient) {
    const today = asUtcDate();
    const streak = await db.streak.upsert({ where: { userId_type: { userId, type: "daily" } }, create: { userId, type: "daily" }, update: {} });
    if (streak.lastCountedDate?.getTime() === today.getTime()) return;
    const yesterday = new Date(today); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const contiguous = streak.lastCountedDate?.getTime() === yesterday.getTime();
    const currentCount = contiguous ? streak.currentCount + 1 : 1;
    await db.streak.update({ where: { id: streak.id }, data: { currentCount, bestCount: Math.max(streak.bestCount, currentCount), lastCountedDate: today, status: "active" } });
  }

  private async unlockEligibleAchievements(userId: string, currentLevel: number, db: DatabaseClient) {
    const [counts, dailyStreak, achievements, unlocked, completedMissions] = await Promise.all([
      db.xpEvent.groupBy({ by: ["reason"], where: { userId }, _count: { _all: true } }),
      db.streak.findUnique({ where: { userId_type: { userId, type: "daily" } } }),
      db.achievement.findMany({ where: { key: { in: achievementRules.map((rule) => rule.key) }, isActive: true, deletedAt: null }, select: { id: true, key: true } }),
      db.userAchievement.findMany({ where: { userId, achievement: { key: { in: achievementRules.map((rule) => rule.key) } } }, select: { achievement: { select: { key: true } } } }),
      db.userMission.findMany({ where: { userId, status: "completed", deletedAt: null }, select: { missionDate: true, dailyMission: { select: { type: true } } } }),
    ]);
    const countByReason = new Map(counts.map((item) => [item.reason, item._count._all]));
    const achievementByKey = new Map(achievements.map((item) => [item.key, item.id]));
    const unlockedKeys = new Set(unlocked.map((item) => item.achievement.key));
    const countByMissionType = new Map<MissionType, number>();
    const countByMissionDate = new Map<string, number>();
    const missionTypesByDate = new Map<string, Set<MissionType>>();
    for (const mission of completedMissions) {
      const type = mission.dailyMission.type;
      countByMissionType.set(type, (countByMissionType.get(type) ?? 0) + 1);
      const dateKey = mission.missionDate.toISOString().slice(0, 10);
      countByMissionDate.set(dateKey, (countByMissionDate.get(dateKey) ?? 0) + 1);
      const types = missionTypesByDate.get(dateKey) ?? new Set<MissionType>();
      types.add(type);
      missionTypesByDate.set(dateKey, types);
    }
    const maxMissionsInSameDay = Math.max(0, ...countByMissionDate.values());

    for (const rule of achievementRules) {
      if (unlockedKeys.has(rule.key)) continue;
      if (rule.reason && (countByReason.get(rule.reason) ?? 0) < (rule.count ?? 1)) continue;
      if (rule.minLevel && currentLevel < rule.minLevel) continue;
      if (rule.minDailyStreak && (dailyStreak?.currentCount ?? 0) < rule.minDailyStreak) continue;
      if (rule.missionType && (countByMissionType.get(rule.missionType) ?? 0) < (rule.count ?? 1)) continue;
      if (rule.sameDayMissionCount && maxMissionsInSameDay < rule.sameDayMissionCount) continue;
      if (rule.requiresMissionTypes && !Array.from(missionTypesByDate.values()).some((types) => rule.requiresMissionTypes?.every((type) => types.has(type)))) continue;

      const achievementId = achievementByKey.get(rule.key);
      if (!achievementId) continue;
      await db.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId } },
        create: { userId, achievementId },
        update: {},
      });
    }
  }

  async xp(userId: string) {
    const [level, events] = await Promise.all([
      this.prisma.userLevel.findUnique({ where: { userId } }),
      this.prisma.xpEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 }),
    ]);
    return { level, events, page: { nextCursor: null, hasMore: false } };
  }

  async streaks(userId: string) { return this.prisma.streak.findMany({ where: { userId }, orderBy: { type: "asc" } }); }

  async achievements(userId: string) {
    const achievements = await this.prisma.achievement.findMany({
      where: { isActive: true, deletedAt: null },
      include: { users: { where: { userId }, select: { unlockedAt: true } } },
      orderBy: [{ rarity: "asc" }, { name: "asc" }],
    });
    return { data: achievements.map(({ users, ...item }) => ({ ...item, unlocked: users.length > 0, unlockedAt: users[0]?.unlockedAt ?? null })) };
  }

  async ranking(userId: string, scope: RankingScope = "global") {
    const normalizedScope: RankingScope = scope === "nutrition" || scope === "run" ? scope : "global";
    const professionalKeys = normalizedScope === "global" ? [] : await this.prisma.professionalConnection.findMany({
      where: { userId, kind: normalizedScope, status: "active", deletedAt: null },
      select: { professionalKey: true, professionalName: true },
    });

    if (normalizedScope !== "global" && professionalKeys.length === 0) {
      return { scope: normalizedScope, label: normalizedScope === "run" ? "Run Pro" : "Nutri Pro", data: [] };
    }

    const users = await this.prisma.user.findMany({
      where: {
        rankingOptIn: true,
        status: "active",
        deletedAt: null,
        ...(normalizedScope === "global" ? {} : {
          professionalConnections: {
            some: {
              kind: normalizedScope,
              status: "active",
              deletedAt: null,
              professionalKey: { in: professionalKeys.map((connection) => connection.professionalKey) },
            },
          },
        }),
      },
      select: {
        id: true,
        rankingOptIn: true,
        profile: { select: { displayName: true } },
        level: true,
        streaks: { where: { type: "daily" }, select: { currentCount: true } },
      },
      orderBy: { level: { totalXp: "desc" } },
      take: 50,
    });

    return {
      scope: normalizedScope,
      label: normalizedScope === "global" ? "Global" : professionalKeys.map((connection) => connection.professionalName).join(", "),
      data: users.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        displayName: user.profile?.displayName ? `${user.profile.displayName.split(" ")[0]} ${user.profile.displayName.split(" ")[1]?.[0] ?? ""}`.trim() : "Atleta LevelFit",
        level: user.level?.level ?? 1,
        totalXp: user.level?.totalXp ?? 0,
        streak: user.streaks[0]?.currentCount ?? 0,
      })),
    };
  }
}
