import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GamificationService } from "./gamification.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly game: GamificationService) {}
  @Get("xp") xp(@CurrentUser() user: AuthUser) { return this.game.xp(user.userId); }
  @Get("streak") streak(@CurrentUser() user: AuthUser) { return this.game.streaks(user.userId); }
  @Get("achievements") achievements(@CurrentUser() user: AuthUser) { return this.game.achievements(user.userId); }
  @Get("ranking") ranking(@CurrentUser() user: AuthUser, @Query("scope") scope?: "global" | "nutrition" | "run") { return this.game.ranking(user.userId, scope); }
}
