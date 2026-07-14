import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { AuthUser } from "../../common/auth-user";
import type { DeleteAccountDto, ExportDataDto, UpdateMeDto } from "./users.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true, email: true, emailVerifiedAt: true, rankingOptIn: true, sensitiveDataConsentAt: true, createdAt: true,
        profile: true, preferences: true, notificationPreference: true, level: true, streaks: true,
      },
    });
    return { ...user, emailVerified: Boolean(user.emailVerifiedAt) };
  }

  async update(userId: string, dto: UpdateMeDto) {
    const profileData = {
      ...(dto.displayName !== undefined ? { displayName: dto.displayName.trim() } : {}),
      ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      ...(dto.fitnessGoal !== undefined ? { fitnessGoal: dto.fitnessGoal } : {}),
      ...(dto.activityLevel !== undefined ? { activityLevel: dto.activityLevel } : {}),
      ...(dto.heightCm !== undefined ? { heightCm: dto.heightCm } : {}),
    };
    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(profileData).length) await tx.userProfile.update({ where: { userId }, data: profileData });
      if (dto.rankingOptIn !== undefined) {
        await tx.user.update({ where: { id: userId }, data: { rankingOptIn: dto.rankingOptIn } });
        await tx.auditLog.create({ data: { actorUserId: userId, targetUserId: userId, action: "ranking_opt_in_changed", entityType: "user", entityId: userId, metadata: { enabled: dto.rankingOptIn } } });
      }
      if (dto.timezone) await tx.notificationPreference.update({ where: { userId }, data: { timezone: dto.timezone } });
    });
    return this.me(userId);
  }

  async securityEvents(userId: string) {
    const events = await this.prisma.userSecurityEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, type: true, createdAt: true, metadata: true } });
    return { data: events, page: { nextCursor: null, hasMore: false } };
  }

  async requestExport(userId: string, dto: ExportDataDto) {
    const exportRequestId = randomUUID();
    await this.prisma.$transaction([
      this.prisma.userSecurityEvent.create({ data: { userId, type: "data_export_requested", metadata: { exportRequestId, includeProgressPhotos: dto.includeProgressPhotos ?? false } } }),
      this.prisma.auditLog.create({ data: { actorUserId: userId, targetUserId: userId, action: "data_export_requested", entityType: "user", entityId: userId, metadata: { exportRequestId } } }),
    ]);
    return { exportRequestId, status: "queued" };
  }

  async deleteAccount(auth: AuthUser, dto: DeleteAccountDto) {
    if (dto.confirmation !== "EXCLUIR") throw new BadRequestException({ code: "CONFIRMATION_REQUIRED", message: "Confirmacao invalida." });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: auth.userId }, select: { passwordHash: true } });
    if (!user.passwordHash || !(await argon2.verify(user.passwordHash, dto.password))) throw new UnauthorizedException({ code: "REAUTHENTICATION_REQUIRED", message: "Confirme sua senha." });
    const now = new Date();
    const deletionRequestId = randomUUID();
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: auth.userId }, data: { status: "deleted", deletedAt: now } }),
      this.prisma.session.updateMany({ where: { userId: auth.userId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.refreshToken.updateMany({ where: { userId: auth.userId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.userSecurityEvent.create({ data: { userId: auth.userId, type: "account_deletion_requested", metadata: { deletionRequestId } } }),
      this.prisma.auditLog.create({ data: { actorUserId: auth.userId, targetUserId: auth.userId, action: "account_deletion_requested", entityType: "user", entityId: auth.userId, metadata: { deletionRequestId, reason: dto.reason ? "provided" : "not_provided" } } }),
    ]);
    return { deletionRequestId, status: "queued" };
  }
}
