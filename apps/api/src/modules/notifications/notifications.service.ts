import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, type Notification } from "@prisma/client";
import webpush, { type PushSubscription } from "web-push";
import { decryptSecret, encryptSecret, hashContext, hashToken } from "../../common/crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { SubscribePushDto, TestEmailPreferencesDto, UnsubscribePushDto, UpdateNotificationPreferencesDto } from "./notifications.dto";

function clockToDate(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

function timeToMinutes(value?: Date | null) {
  if (!value) return null;
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function nowInTimezoneMinutes(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const weekday = String(parts.find((part) => part.type === "weekday")?.value ?? "Sun");
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  return { minutes: hour * 60 + minute, weekday: weekdayIndex < 0 ? 0 : weekdayIndex };
}

function isInsideQuietWindow(nowMinutes: number, start: number | null, end: number | null) {
  if (start === null || end === null || start === end) return false;
  if (start < end) return nowMinutes >= start && nowMinutes < end;
  return nowMinutes >= start || nowMinutes < end;
}

@Injectable()
export class NotificationsService {
  private readonly secret: string;
  private readonly vapidConfigured: boolean;

  constructor(private readonly prisma: PrismaService, config: ConfigService) {
    this.secret = config.getOrThrow<string>("TOKEN_HASH_SECRET");
    const publicKey = config.get<string>("VAPID_PUBLIC_KEY") ?? config.get<string>("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
    const privateKey = config.get<string>("VAPID_PRIVATE_KEY");
    const subject = config.get<string>("VAPID_SUBJECT") ?? "mailto:security@levelfit.app";
    this.vapidConfigured = Boolean(publicKey && privateKey);
    if (publicKey && privateKey) webpush.setVapidDetails(subject, publicKey, privateKey);
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
    if (!updated.count) throw new NotFoundException({ code: "NOTIFICATION_NOT_FOUND", message: "Notificação não encontrada." });
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

  async subscribe(userId: string, dto: SubscribePushDto, userAgent?: string) {
    const endpointHash = hashToken(dto.endpoint, this.secret);
    const existing = await this.prisma.pushSubscription.findUnique({ where: { endpointHash }, select: { userId: true } });
    if (existing && existing.userId !== userId) {
      throw new ConflictException({ code: "PUSH_SUBSCRIPTION_UNAVAILABLE", message: "Não foi possível registrar esta subscription." });
    }
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

  async sendPushForNotification(notification: Pick<Notification, "id" | "userId" | "type" | "title" | "body" | "actionUrl">) {
    if (!this.vapidConfigured) return { attempted: false, sent: 0, revoked: 0, reason: "vapid_not_configured" };

    const preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId: notification.userId },
      select: {
        pushEnabled: true,
        professionalMessagesEnabled: true,
        nutritionProMessagesEnabled: true,
        runProMessagesEnabled: true,
        quietHoursStart: true,
        quietHoursEnd: true,
        silentDays: true,
        timezone: true,
      },
    });
    if (!preferences?.pushEnabled) return { attempted: false, sent: 0, revoked: 0, reason: "push_disabled" };

    const metadata = await this.prisma.notification.findUnique({
      where: { id: notification.id },
      select: { metadata: true },
    });
    const kind = metadata?.metadata && typeof metadata.metadata === "object" && !Array.isArray(metadata.metadata) ? (metadata.metadata as Record<string, unknown>).kind : null;
    if (notification.type === "professional_message") {
      if (!preferences.professionalMessagesEnabled) return { attempted: false, sent: 0, revoked: 0, reason: "professional_push_disabled" };
      if (kind === "nutrition" && !preferences.nutritionProMessagesEnabled) return { attempted: false, sent: 0, revoked: 0, reason: "nutrition_push_disabled" };
      if (kind === "run" && !preferences.runProMessagesEnabled) return { attempted: false, sent: 0, revoked: 0, reason: "run_push_disabled" };
    }

    const localNow = nowInTimezoneMinutes(preferences.timezone);
    if (preferences.silentDays.includes(localNow.weekday)) return { attempted: false, sent: 0, revoked: 0, reason: "silent_day" };
    if (isInsideQuietWindow(localNow.minutes, timeToMinutes(preferences.quietHoursStart), timeToMinutes(preferences.quietHoursEnd))) {
      return { attempted: false, sent: 0, revoked: 0, reason: "quiet_hours" };
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId: notification.userId, revokedAt: null },
      select: { id: true, endpointEncrypted: true, p256dhEncrypted: true, authEncrypted: true },
      take: 10,
    });
    if (!subscriptions.length) return { attempted: false, sent: 0, revoked: 0, reason: "no_subscriptions" };

    const payload = JSON.stringify(this.publicPushPayload(notification, kind));
    let sent = 0;
    let revoked = 0;
    await Promise.all(subscriptions.map(async (subscription) => {
      const pushSubscription: PushSubscription = {
        endpoint: decryptSecret(subscription.endpointEncrypted, this.secret),
        keys: {
          p256dh: decryptSecret(subscription.p256dhEncrypted, this.secret),
          auth: decryptSecret(subscription.authEncrypted, this.secret),
        },
      };
      try {
        await webpush.sendNotification(pushSubscription, payload, { TTL: 60 * 60 * 6 });
        sent += 1;
      } catch (error) {
        const statusCode = typeof error === "object" && error && "statusCode" in error ? Number((error as { statusCode?: number }).statusCode) : 0;
        if (statusCode === 404 || statusCode === 410) {
          revoked += 1;
          await this.prisma.pushSubscription.update({ where: { id: subscription.id }, data: { revokedAt: new Date() } });
        }
      }
    }));

    return { attempted: true, sent, revoked };
  }

  private publicPushPayload(notification: Pick<Notification, "type" | "title" | "body" | "actionUrl">, kind: unknown) {
    if (notification.type === "professional_message") {
      const origin = kind === "run" ? "Run Pro" : kind === "nutrition" ? "Nutri Pro" : "Profissional";
      return {
        title: `Novo toque ${origin}`,
        body: "Abra o LevelFit para ver a mensagem no app.",
        actionUrl: notification.actionUrl ?? "/notifications",
      };
    }
    return {
      title: notification.title,
      body: notification.body,
      actionUrl: notification.actionUrl ?? "/notifications",
    };
  }
}
