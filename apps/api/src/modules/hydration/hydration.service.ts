import { Injectable } from "@nestjs/common";
import { asUtcDate, utcDayRange } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import type { CreateWaterLogDto } from "./hydration.dto";

@Injectable()
export class HydrationService {
  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async today(userId: string) {
    const { start, end } = utcDayRange();
    const [goal, logs, aggregate] = await Promise.all([
      this.prisma.hydrationGoal.findFirst({ where: { userId, startsOn: { lte: asUtcDate() }, OR: [{ endsOn: null }, { endsOn: { gte: asUtcDate() } }], deletedAt: null }, orderBy: { startsOn: "desc" } }),
      this.prisma.waterLog.findMany({ where: { userId, loggedAt: { gte: start, lt: end }, deletedAt: null }, orderBy: { loggedAt: "desc" } }),
      this.prisma.waterLog.aggregate({ where: { userId, loggedAt: { gte: start, lt: end }, deletedAt: null }, _sum: { amountMl: true } }),
    ]);
    const consumedMl = aggregate._sum.amountMl ?? 0;
    return { goalMl: goal?.dailyGoalMl ?? 2000, consumedMl, percentage: Math.min(100, Math.round((consumedMl / (goal?.dailyGoalMl ?? 2000)) * 100)), logs };
  }

  async create(userId: string, dto: CreateWaterLogDto) {
    const loggedAt = dto.loggedAt ? new Date(dto.loggedAt) : new Date();
    const { start, end } = utcDayRange(loggedAt);
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.waterLog.create({ data: { userId, amountMl: dto.amountMl, loggedAt } });
      const [goal, aggregate] = await Promise.all([
        tx.hydrationGoal.findFirst({ where: { userId, startsOn: { lte: asUtcDate(loggedAt) }, OR: [{ endsOn: null }, { endsOn: { gte: asUtcDate(loggedAt) } }], deletedAt: null }, orderBy: { startsOn: "desc" } }),
        tx.waterLog.aggregate({ where: { userId, loggedAt: { gte: start, lt: end }, deletedAt: null }, _sum: { amountMl: true } }),
      ]);
      const consumedMl = aggregate._sum.amountMl ?? 0;
      const goalMl = goal?.dailyGoalMl ?? 2000;
      let xpAwarded = 0;
      if (consumedMl >= goalMl) {
        const award = await this.game.awardXp(userId, 25, "water_goal_completed", `water_goal:${userId}:${start.toISOString()}`, "water_log", log.id, tx);
        xpAwarded = award.awarded;
      }
      return { log, consumedMl, goalMl, xpAwarded };
    });
  }
}
