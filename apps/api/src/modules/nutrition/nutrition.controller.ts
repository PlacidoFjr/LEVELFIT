import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateFoodLogDto } from "./nutrition.dto";
import { NutritionService } from "./nutrition.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly nutrition: NutritionService) {}
  @Get("nutrition/goals") goal(@CurrentUser() user: AuthUser) { return this.nutrition.goal(user.userId); }
  @Get("food-logs/today") today(@CurrentUser() user: AuthUser) { return this.nutrition.today(user.userId); }
  @Post("food-logs") create(@CurrentUser() user: AuthUser, @Body() dto: CreateFoodLogDto) { return this.nutrition.create(user.userId, dto); }
}
