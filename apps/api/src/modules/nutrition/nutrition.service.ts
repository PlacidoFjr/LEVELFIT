import { Injectable, Logger } from "@nestjs/common";
import { asUtcDate, utcDayRange } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import type { CreateFoodLogDto, UpdateNutritionGoalDto } from "./nutrition.dto";

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async goal(userId: string) {
    return this.prisma.nutritionGoal.findFirst({ where: { userId, startsOn: { lte: asUtcDate() }, OR: [{ endsOn: null }, { endsOn: { gte: asUtcDate() } }], deletedAt: null }, orderBy: { startsOn: "desc" } });
  }

  async updateGoal(userId: string, dto: UpdateNutritionGoalDto) {
    const today = asUtcDate();
    const current = await this.prisma.nutritionGoal.findFirst({
      where: { userId, startsOn: { lte: today }, OR: [{ endsOn: null }, { endsOn: { gte: today } }], deletedAt: null },
      orderBy: { startsOn: "desc" },
      select: { id: true },
    });
    const data = {
      ...(dto.dailyCalories !== undefined ? { dailyCalories: dto.dailyCalories } : {}),
      ...(dto.proteinG !== undefined ? { proteinG: dto.proteinG } : {}),
      ...(dto.carbsG !== undefined ? { carbsG: dto.carbsG } : {}),
      ...(dto.fatG !== undefined ? { fatG: dto.fatG } : {}),
      ...(dto.checklistGoalCount !== undefined ? { checklistGoalCount: dto.checklistGoalCount } : {}),
    };

    if (current) return this.prisma.nutritionGoal.update({ where: { id: current.id }, data });
    return this.prisma.nutritionGoal.create({ data: { userId, startsOn: today, checklistGoalCount: dto.checklistGoalCount ?? 3, ...data } });
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
    const { log, distinctChecks } = await this.prisma.$transaction(async (tx) => {
      const log = await tx.foodLog.create({ data: { userId, ...dto, loggedAt } });
      const dayLogs = await tx.foodLog.findMany({ where: { userId, loggedAt: { gte: start, lt: end }, deletedAt: null } });
      const distinctChecks = new Set<string>();
      for (const item of dayLogs) {
        if (item.hasProtein) distinctChecks.add("protein");
        if (item.hasFruitOrVegetable) distinctChecks.add("fruit_or_vegetable");
        if (item.avoidedSkippingMeal) distinctChecks.add("no_skip");
        if (item.mindfulChoice) distinctChecks.add("mindful");
      }
      return { log, distinctChecks };
    });

    let xpAwarded = 0;
    if (distinctChecks.size >= 3) {
      try {
        const award = await this.game.awardXp(userId, 30, "nutrition_checklist_completed", `nutrition_checklist:${userId}:${start.toISOString()}`, "food_log", log.id);
        xpAwarded = award.awarded;
        if (xpAwarded > 0) {
          await this.prisma.notification.create({
            data: {
              userId,
              type: "daily_summary",
              title: "Checklist alimentar concluído",
              body: "Você completou escolhas importantes de alimentação hoje. Sem culpa, sem extremos.",
              actionUrl: "/nutrition",
            },
          });
        }
      } catch (error) {
        this.logger.warn(`Nutrition XP side effect failed for user ${userId}: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }

    return { log, checklistCompleted: distinctChecks.size, xpAwarded };
  }
}
