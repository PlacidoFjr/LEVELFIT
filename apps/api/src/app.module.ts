import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, minutes, seconds } from "@nestjs/throttler";
import { validateEnvironment } from "./config/environment";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
import { HealthModule } from "./modules/health/health.module";
import { HydrationModule } from "./modules/hydration/hydration.module";
import { MissionsModule } from "./modules/missions/missions.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { NutritionModule } from "./modules/nutrition/nutrition.module";
import { ProfessionalsModule } from "./modules/professionals/professionals.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { UsersModule } from "./modules/users/users.module";
import { WorkoutsModule } from "./modules/workouts/workouts.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"], validate: validateEnvironment }),
    ThrottlerModule.forRoot([
      { name: "short", ttl: seconds(1), limit: 5 },
      { name: "default", ttl: minutes(1), limit: 120 },
    ]),
    PrismaModule,
    AdminModule,
    AuthModule,
    UsersModule,
    WorkoutsModule,
    NutritionModule,
    HydrationModule,
    MissionsModule,
    GamificationModule,
    ProgressModule,
    NotificationsModule,
    ProfessionalsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
