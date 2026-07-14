import { Injectable } from "@nestjs/common";
import { asUtcDate, utcDayRange } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import type { CreateFoodLogDto } from "./nutrition.dto";

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async goal(userId: string) {
    return this.prisma.nutritionGoal.findFirst({ where: { userId, startsOn: { lte: asUtcDate() }, OR: [{ endsOn: null }, { endsOn: { gte: asUtcDate() } }], deletedAt: null }, orderBy: { startsOn: "desc" } });
  }

  async today(userId: string) {
    const { start, end } = utcDayRange();
    const data = await this.prisma.foodLog.findMany({ where: { userId, loggedAt: { gte: start, lt: end }, deletedAt: null }, include: { meal: true }, orderBy: { loggedAt: "desc" } });
    const checklistCompleted = data.reduce((count, item) => count + Number(Boolean(item.hasProtein)) + Number(Boolean(item.hasFruitOrVegetable)) + Number(Boolean(item.avoidedSkippingMeal)) + Number(Boolean(item.mindfulChoice)), 0);
    return { data, checklistCompleted };
  }

  async create(userId: string, dto: CreateFoodLogDto) {
    const loggedAt = dto.loggedAt ? new Date(dto.loggedAt) : new Date();
    const { start, end } = utcDayRange(loggedAt);
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.foodLog.create({ data: { userId, ...dto, loggedAt } });
      const dayLogs = await tx.foodLog.findMany({ where: { userId, loggedAt: { gte: start, lt: end }, deletedAt: null } });
      const distinctChecks = new Set<string>();
      for (const item of dayLogs) {
        if (item.hasProtein) distinctChecks.add("protein");
        if (item.hasFruitOrVegetable) distinctChecks.add("fruit_or_vegetable");
        if (item.avoidedSkippingMeal) distinctChecks.add("no_skip");
        if (item.mindfulChoice) distinctChecks.add("mindful");
      }
      let xpAwarded = 0;
      if (distinctChecks.size >= 3) {
        const award = await this.game.awardXp(userId, 30, "nutrition_checklist_completed", `nutrition_checklist:${userId}:${start.toISOString()}`, "food_log", log.id, tx);
        xpAwarded = award.awarded;
      }
      return { log, checklistCompleted: distinctChecks.size, xpAwarded };
    });
  }
}
