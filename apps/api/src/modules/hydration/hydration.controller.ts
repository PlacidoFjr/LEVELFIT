import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateWaterLogDto, UpdateHydrationGoalDto } from "./hydration.dto";
import { HydrationService } from "./hydration.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class HydrationController {
  constructor(private readonly hydration: HydrationService) {}
  @Get("hydration/today") today(@CurrentUser() user: AuthUser) { return this.hydration.today(user.userId); }
  @Patch("hydration/goals") updateGoal(@CurrentUser() user: AuthUser, @Body() dto: UpdateHydrationGoalDto) { return this.hydration.updateGoal(user.userId, dto); }
  @Post("water-logs") create(@CurrentUser() user: AuthUser, @Body() dto: CreateWaterLogDto) { return this.hydration.create(user.userId, dto); }
}
