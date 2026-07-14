import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GamificationModule } from "../gamification/gamification.module";
import { HydrationController } from "./hydration.controller";
import { HydrationService } from "./hydration.service";

@Module({ imports: [AuthModule, GamificationModule], controllers: [HydrationController], providers: [HydrationService] })
export class HydrationModule {}
