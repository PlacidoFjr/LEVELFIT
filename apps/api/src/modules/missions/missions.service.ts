import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { asUtcDate } from "../../common/date";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";

const missionTypes = ["workout", "water", "nutrition", "habit", "recovery", "progress"] as const;
const dailyMissionLimit = 8;

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async today(userId: string) {
    const missionDate = asUtcDate();
    const templates = await this.prisma.dailyMission.findMany({ where: { isActive: true, deletedAt: null }, orderBy: [{ type: "asc" }, { key: "asc" }] });
    const selected = missionTypes
      .flatMap((type) => templates.filter((template) => template.type === type).sort((a, b) => stableHash(`${userId}:${dayKey(missionDate)}:${a.key}`) - stableHash(`${userId}:${dayKey(missionDate)}:${b.key}`)).slice(0, type === "habit" ? 2 : 1))
      .slice(0, dailyMissionLimit);

    const extra = templates
      .filter((template) => !selected.some((item) => item.id === template.id))
      .sort((a, b) => stableHash(`${dayKey(missionDate)}:${userId}:extra:${a.key}`) - stableHash(`${dayKey(missionDate)}:${userId}:extra:${b.key}`))
      .slice(0, Math.max(0, dailyMissionLimit - selected.length));

    const dailyTemplates = [...selected, ...extra];
    if (dailyTemplates.length) await this.prisma.userMission.createMany({ data: dailyTemplates.map((template) => ({ userId, dailyMissionId: template.id, missionDate })), skipDuplicates: true });
    return this.prisma.userMission.findMany({ where: { userId, missionDate, deletedAt: null }, include: { dailyMission: true }, orderBy: { createdAt: "asc" } });
  }

  async complete(userId: string, missionId: string) {
    const mission = await this.prisma.userMission.findFirst({ where: { id: missionId, userId, deletedAt: null }, include: { dailyMission: true } });
    if (!mission) throw new NotFoundException({ code: "MISSION_NOT_FOUND", message: "Missão não encontrada." });
    if (mission.status === "completed") throw new ConflictException({ code: "MISSION_ALREADY_RESOLVED", message: "Missão já concluída." });
    return this.prisma.$transaction(async (tx) => {
      const completedBefore = await tx.userMission.count({ where: { userId, status: "completed", deletedAt: null } });
      const award = await this.game.awardXp(userId, mission.dailyMission.xpReward, "mission_completed", `user_mission:${mission.id}:completed`, "user_mission", mission.id, tx);
      const updated = await tx.userMission.update({ where: { id: mission.id }, data: { status: "completed", completedAt: new Date(), xpAwarded: mission.xpAwarded + award.awarded } });
      let rankingAutoJoined = false;
      if (completedBefore === 0 && award.awarded > 0) {
        await tx.user.update({ where: { id: userId }, data: { rankingOptIn: true } });
        await tx.auditLog.create({ data: { actorUserId: userId, targetUserId: userId, action: "ranking_auto_joined", entityType: "user", entityId: userId, metadata: { source: "first_mission", missionId: mission.id } } });
        rankingAutoJoined = true;
      }
      return { mission: updated, xpAwarded: award.awarded, rankingAutoJoined };
    });
  }
}
