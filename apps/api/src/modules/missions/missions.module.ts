import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GamificationModule } from "../gamification/gamification.module";
import { MissionsController } from "./missions.controller";
import { MissionsService } from "./missions.service";

@Module({ imports: [AuthModule, GamificationModule], controllers: [MissionsController], providers: [MissionsService] })
export class MissionsModule {}
