import { Injectable } from "@nestjs/common";
import { Prisma, XpReason } from "@prisma/client";
import { asUtcDate } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

type DatabaseClient = Prisma.TransactionClient | PrismaService;

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

  async ranking() {
    const users = await this.prisma.user.findMany({
      where: { rankingOptIn: true, status: "active", deletedAt: null },
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
