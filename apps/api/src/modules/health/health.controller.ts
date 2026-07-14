import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Controller("health")
@SkipThrottle()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  live() { return { status: "ok", service: "levelfit-api", timestamp: new Date().toISOString() }; }

  @Get("ready")
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ready", database: "ok", timestamp: new Date().toISOString() };
  }
}
