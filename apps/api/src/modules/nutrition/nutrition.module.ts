import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GamificationModule } from "../gamification/gamification.module";
import { NutritionController } from "./nutrition.controller";
import { NutritionService } from "./nutrition.service";

@Module({ imports: [AuthModule, GamificationModule], controllers: [NutritionController], providers: [NutritionService] })
export class NutritionModule {}
