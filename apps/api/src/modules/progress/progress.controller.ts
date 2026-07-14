import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateBodyMeasurementDto, CreateProgressPhotoDto } from "./progress.dto";
import { ProgressService } from "./progress.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}
  @Get("body-measurements") measurements(@CurrentUser() user: AuthUser) { return this.progress.measurements(user.userId); }
  @Post("body-measurements") createMeasurement(@CurrentUser() user: AuthUser, @Body() dto: CreateBodyMeasurementDto) { return this.progress.createMeasurement(user.userId, dto); }
  @Post("progress-photos") createPhoto(@CurrentUser() user: AuthUser, @Body() dto: CreateProgressPhotoDto) { return this.progress.createPhoto(user.userId, dto); }
}
