import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateWorkoutDto, StartWorkoutSessionDto, UpdateWorkoutSessionDto } from "./workouts.dto";
import { WorkoutsService } from "./workouts.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workouts: WorkoutsService) {}
  @Get("workouts") list(@CurrentUser() user: AuthUser) { return this.workouts.list(user.userId); }
  @Get("workouts/today") today(@CurrentUser() user: AuthUser) { return this.workouts.today(user.userId); }
  @Get("workout-sessions") sessions(@CurrentUser() user: AuthUser) { return this.workouts.sessions(user.userId); }
  @Post("workouts") create(@CurrentUser() user: AuthUser, @Body() dto: CreateWorkoutDto) { return this.workouts.create(user.userId, dto); }
  @Post("workout-sessions") start(@CurrentUser() user: AuthUser, @Body() dto: StartWorkoutSessionDto) { return this.workouts.startSession(user.userId, dto); }
  @Patch("workout-sessions/:id") update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateWorkoutSessionDto) { return this.workouts.updateSession(user.userId, id, dto); }
}
