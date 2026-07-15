import { Injectable, Logger } from "@nestjs/common";
import { asUtcDate, utcDayRange } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import type { CreateFoodLogDto, FoodLogItemDto, SearchFoodsDto, UpdateNutritionGoalDto } from "./nutrition.dto";

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async searchFoods(query: SearchFoodsDto) {
    const term = normalizeSearch(query.q ?? "");
    return this.prisma.food.findMany({
      where: { deletedAt: null, ...(term ? { searchName: { contains: term } } : {}) },
      orderBy: [{ searchName: "asc" }],
      take: query.limit ?? 20,
    });
  }

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
    const data = await this.prisma.foodLog.findMany({ where: { userId, loggedAt: { gte: start, lt: end }, deletedAt: null }, include: { meal: true, items: { include: { food: true }, orderBy: { createdAt: "asc" } } }, orderBy: { loggedAt: "desc" } });
    const checklistCompleted = data.reduce((count, item) => count + Number(Boolean(item.hasProtein)) + Number(Boolean(item.hasFruitOrVegetable)) + Number(Boolean(item.avoidedSkippingMeal)) + Number(Boolean(item.mindfulChoice)), 0);
    return { data, checklistCompleted };
  }

  async create(userId: string, dto: CreateFoodLogDto) {
    const loggedAt = dto.loggedAt ? new Date(dto.loggedAt) : new Date();
    const { start, end } = utcDayRange(loggedAt);
    const { log, distinctChecks } = await this.prisma.$transaction(async (tx) => {
      const { items, ...foodLogDto } = dto;
      const itemInputs = (items ?? []).filter((item) => item.quantityG > 0);
      const foodIds = [...new Set(itemInputs.map((item) => item.foodId).filter(Boolean))] as string[];
      const foods = foodIds.length ? await tx.food.findMany({ where: { id: { in: foodIds }, deletedAt: null } }) : [];
      const foodById = new Map(foods.map((food) => [food.id, food]));
      const builtItems = itemInputs.map((item) => buildFoodLogItem(item, foodById.get(item.foodId ?? "")));
      const totals = builtItems.reduce((sum, item) => ({
        calories: sum.calories + (item.calories ?? 0),
        proteinG: sum.proteinG + (Number(item.proteinG) || 0),
        carbsG: sum.carbsG + (Number(item.carbsG) || 0),
        fatG: sum.fatG + (Number(item.fatG) || 0),
      }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

      const data = {
        userId,
        ...foodLogDto,
        loggedAt,
        ...(builtItems.length && foodLogDto.calories === undefined ? { calories: totals.calories } : {}),
        ...(builtItems.length && foodLogDto.proteinG === undefined ? { proteinG: roundMacro(totals.proteinG) } : {}),
        ...(builtItems.length && foodLogDto.carbsG === undefined ? { carbsG: roundMacro(totals.carbsG) } : {}),
        ...(builtItems.length && foodLogDto.fatG === undefined ? { fatG: roundMacro(totals.fatG) } : {}),
        ...(builtItems.length && foodLogDto.hasProtein === undefined ? { hasProtein: totals.proteinG >= 10 } : {}),
        ...(builtItems.length && foodLogDto.hasFruitOrVegetable === undefined ? { hasFruitOrVegetable: builtItems.some((item) => foodById.get(item.foodId ?? "")?.category.match(/frutas|verduras|hortali/i)) } : {}),
        ...(builtItems.length && foodLogDto.avoidedSkippingMeal === undefined ? { avoidedSkippingMeal: true } : {}),
      };

      const log = await tx.foodLog.create({
        data: builtItems.length ? { ...data, items: { create: builtItems } } : data,
        include: { meal: true, items: { include: { food: true }, orderBy: { createdAt: "asc" } } },
      });
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

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function roundMacro(value: number) {
  return Math.round(value * 100) / 100;
}

function scaled(value: unknown, quantityG: number) {
  if (value === null || value === undefined) return undefined;
  return roundMacro((Number(value) * quantityG) / 100);
}

function scaledCalories(value: unknown, quantityG: number) {
  if (value === null || value === undefined) return undefined;
  return Math.round((Number(value) * quantityG) / 100);
}

function buildFoodLogItem(item: FoodLogItemDto, food?: { id: string; name: string; kcalPer100g: number | null; proteinGPer100g: unknown; carbsGPer100g: unknown; fatGPer100g: unknown; fiberGPer100g: unknown }) {
  return {
    foodId: food?.id,
    nameSnapshot: food?.name ?? item.name ?? "Alimento personalizado",
    quantityG: item.quantityG,
    calories: food ? scaledCalories(food.kcalPer100g, item.quantityG) : item.calories,
    proteinG: food ? scaled(food.proteinGPer100g, item.quantityG) : item.proteinG,
    carbsG: food ? scaled(food.carbsGPer100g, item.quantityG) : item.carbsG,
    fatG: food ? scaled(food.fatGPer100g, item.quantityG) : item.fatG,
    fiberG: food ? scaled(food.fiberGPer100g, item.quantityG) : item.fiberG,
  };
}
