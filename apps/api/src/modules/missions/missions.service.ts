import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { asUtcDate } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async today(userId: string) {
    const missionDate = asUtcDate();
    const templates = await this.prisma.dailyMission.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { type: "asc" }, take: 4 });
    if (templates.length) await this.prisma.userMission.createMany({ data: templates.map((template) => ({ userId, dailyMissionId: template.id, missionDate })), skipDuplicates: true });
    return this.prisma.userMission.findMany({ where: { userId, missionDate, deletedAt: null }, include: { dailyMission: true }, orderBy: { createdAt: "asc" } });
  }

  async complete(userId: string, missionId: string) {
    const mission = await this.prisma.userMission.findFirst({ where: { id: missionId, userId, deletedAt: null }, include: { dailyMission: true } });
    if (!mission) throw new NotFoundException({ code: "MISSION_NOT_FOUND", message: "Missao nao encontrada." });
    if (mission.status === "completed") throw new ConflictException({ code: "MISSION_ALREADY_RESOLVED", message: "Missao ja concluida." });
    return this.prisma.$transaction(async (tx) => {
      const award = await this.game.awardXp(userId, mission.dailyMission.xpReward, "mission_completed", `user_mission:${mission.id}:completed`, "user_mission", mission.id, tx);
      const updated = await tx.userMission.update({ where: { id: mission.id }, data: { status: "completed", completedAt: new Date(), xpAwarded: mission.xpAwarded + award.awarded } });
      return { mission: updated, xpAwarded: award.awarded };
    });
  }
}
