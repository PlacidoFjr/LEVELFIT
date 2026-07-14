import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { encryptSecret, hashContext, hashToken } from "../../common/crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { SubscribePushDto, TestEmailPreferencesDto, UnsubscribePushDto, UpdateNotificationPreferencesDto } from "./notifications.dto";

function clockToDate(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

@Injectable()
export class NotificationsService {
  private readonly secret: string;

  constructor(private readonly prisma: PrismaService, config: ConfigService) {
    this.secret = config.getOrThrow<string>("TOKEN_HASH_SECRET");
  }

  async list(userId: string, unreadOnly = false) {
    const items = await this.prisma.notification.findMany({
      where: { userId, deletedAt: null, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await this.prisma.notification.count({ where: { userId, deletedAt: null, readAt: null } });
    return { items, unreadCount };
  }

  async markRead(userId: string, id: string) {
    const updated = await this.prisma.notification.updateMany({
      where: { id, userId, deletedAt: null },
      data: { readAt: new Date() },
    });
    if (!updated.count) throw new NotFoundException({ code: "NOTIFICATION_NOT_FOUND", message: "Notificacao nao encontrada." });
    return { id, read: true };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, deletedAt: null, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  getPreferences(userId: string) {
    return this.prisma.notificationPreference.findUniqueOrThrow({ where: { userId } });
  }

  updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const data: Prisma.NotificationPreferenceUpdateInput = { ...dto };
    for (const key of ["preferredWorkoutTime", "streakRiskTime", "quietHoursStart", "quietHoursEnd"] as const) {
      if (dto[key]) data[key] = clockToDate(dto[key]);
    }
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data } as Prisma.NotificationPreferenceUncheckedCreateInput,
      update: data,
    });
  }

  subscribe(userId: string, dto: SubscribePushDto, userAgent?: string) {
    const endpointHash = hashToken(dto.endpoint, this.secret);
    return this.prisma.pushSubscription.upsert({
      where: { endpointHash },
      create: {
        userId,
        endpointHash,
        endpointEncrypted: encryptSecret(dto.endpoint, this.secret),
        p256dhEncrypted: encryptSecret(dto.keys.p256dh, this.secret),
        authEncrypted: encryptSecret(dto.keys.auth, this.secret),
        userAgentHash: hashContext(userAgent, this.secret),
      },
      update: {
        userId,
        endpointEncrypted: encryptSecret(dto.endpoint, this.secret),
        p256dhEncrypted: encryptSecret(dto.keys.p256dh, this.secret),
        authEncrypted: encryptSecret(dto.keys.auth, this.secret),
        userAgentHash: hashContext(userAgent, this.secret),
        revokedAt: null,
      },
      select: { id: true, createdAt: true, revokedAt: true },
    });
  }

  async unsubscribe(userId: string, dto: UnsubscribePushDto) {
    const result = await this.prisma.pushSubscription.updateMany({
      where: { userId, endpointHash: hashToken(dto.endpoint, this.secret), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { revoked: result.count > 0 };
  }

  async queueTestEmail(userId: string, dto: TestEmailPreferencesDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
    const log = await this.prisma.emailLog.create({
      data: {
        userId,
        templateKey: dto.templateKey,
        provider: "development",
        recipientHash: hashToken(user.email, this.secret),
        status: "queued",
      },
      select: { id: true, status: true, createdAt: true },
    });
    return { accepted: true, emailLog: log };
  }
}
