import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MissionsService } from "./missions.service";

@Controller("missions")
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(private readonly missions: MissionsService) {}
  @Get("today") today(@CurrentUser() user: AuthUser) { return this.missions.today(user.userId); }
  @Patch(":id/complete") complete(@CurrentUser() user: AuthUser, @Param("id") id: string) { return this.missions.complete(user.userId, id); }
}
