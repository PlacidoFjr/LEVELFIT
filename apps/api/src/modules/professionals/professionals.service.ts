import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sanitizeProfessionalPermissions } from "../../common/professional-permissions";
import { buildAccessProfile, type AccessRole } from "../../common/access-profile";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { AcceptProfessionalInviteDto, SendProfessionalMessageDto, UpdateProfessionalPermissionsDto } from "./professionals.dto";
import type { AuthUser } from "../../common/auth-user";

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function metadataValue(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  private async accessProfile(auth: AuthUser) {
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId: auth.userId, revokedAt: null },
      select: { role: true },
    });
    return buildAccessProfile(this.config, auth.email, assignments.map((item) => item.role as AccessRole));
  }

  private async assertProfessionalAccess(auth: AuthUser, kind: "nutrition" | "run") {
    const profile = await this.accessProfile(auth);
    const allowed = profile.roles.includes("OWNER") || (kind === "nutrition" ? profile.roles.includes("NUTRITIONIST") : profile.roles.includes("RUN_COACH"));
    if (!allowed) throw new ForbiddenException({ code: "PROFESSIONAL_ACCESS_REQUIRED", message: "Acesso profissional necessario para enviar este toque." });
  }

  async list(userId: string) {
    const connections = await this.prisma.professionalConnection.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return { data: connections };
  }

  async previewInvite(userId: string, code: string) {
    const normalizedCode = normalizeCode(code);
    const invite = await this.prisma.professionalInvite.findUnique({ where: { code: normalizedCode } });

    if (!invite || !invite.isActive || invite.deletedAt || (invite.expiresAt && invite.expiresAt <= new Date())) {
      await this.prisma.auditLog.create({
        data: {
          actorUserId: userId,
          targetUserId: userId,
          action: "professional_invite_preview_failed",
          entityType: "professional_invite",
          metadata: { codePrefix: normalizedCode.slice(0, 7), reason: "not_found_or_expired" },
        },
      });
      throw new NotFoundException({ code: "INVITE_NOT_FOUND", message: "Convite nao encontrado ou expirado." });
    }

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        targetUserId: userId,
        action: "professional_invite_previewed",
        entityType: "professional_invite",
        entityId: invite.id,
        metadata: { kind: invite.kind, professionalKey: invite.professionalKey, codePrefix: invite.code.slice(0, 7) },
      },
    });

    return {
      kind: invite.kind,
      professionalName: invite.professionalName,
      professionalRole: invite.professionalRole,
      headline: invite.headline,
      planTitle: invite.planTitle,
      defaultPermissions: invite.defaultPermissions,
    };
  }

  async accept(userId: string, dto: AcceptProfessionalInviteDto) {
    const invite = await this.prisma.professionalInvite.findUnique({ where: { code: normalizeCode(dto.code) } });
    if (!invite || !invite.isActive || invite.deletedAt || (invite.expiresAt && invite.expiresAt <= new Date())) {
      throw new NotFoundException({ code: "INVITE_NOT_FOUND", message: "Convite nao encontrado ou expirado." });
    }

    const permissions = sanitizeProfessionalPermissions(dto.permissions, invite.defaultPermissions);
    if (!permissions.length) throw new BadRequestException({ code: "PERMISSIONS_REQUIRED", message: "Escolha pelo menos uma permissao." });
    const nextEventLabel = invite.kind === "nutrition" ? "Proximo retorno a combinar" : "Proxima sessao TAF a combinar";

    const connection = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.professionalConnection.upsert({
        where: { userId_professionalKey_kind: { userId, professionalKey: invite.professionalKey, kind: invite.kind } },
        create: {
          userId,
          inviteId: invite.id,
          kind: invite.kind,
          professionalKey: invite.professionalKey,
          professionalName: invite.professionalName,
          professionalRole: invite.professionalRole,
          permissions,
          planTitle: invite.planTitle,
          nextEventLabel,
        },
        update: {
          inviteId: invite.id,
          status: "active",
          permissions,
          professionalName: invite.professionalName,
          professionalRole: invite.professionalRole,
          planTitle: invite.planTitle,
          nextEventLabel,
          acceptedAt: new Date(),
          revokedAt: null,
          deletedAt: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          targetUserId: userId,
          action: "professional_connection_accepted",
          entityType: "professional_connection",
          entityId: saved.id,
          metadata: { kind: saved.kind, professionalKey: saved.professionalKey, permissions: saved.permissions },
        },
      });

      return saved;
    });

    return { connection };
  }

  async updatePermissions(userId: string, connectionId: string, dto: UpdateProfessionalPermissionsDto) {
    const permissions = sanitizeProfessionalPermissions(dto.permissions, []);
    if (!permissions.length) throw new BadRequestException({ code: "PERMISSIONS_REQUIRED", message: "Escolha pelo menos uma permissao." });

    const existing = await this.prisma.professionalConnection.findFirst({ where: { id: connectionId, userId, deletedAt: null } });
    if (!existing) throw new NotFoundException({ code: "CONNECTION_NOT_FOUND", message: "Conexao profissional nao encontrada." });

    const connection = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.professionalConnection.update({ where: { id: existing.id }, data: { permissions } });
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          targetUserId: userId,
          action: "professional_permissions_updated",
          entityType: "professional_connection",
          entityId: updated.id,
          metadata: { kind: updated.kind, professionalKey: updated.professionalKey, permissions },
        },
      });
      return updated;
    });

    return { connection };
  }

  async revoke(userId: string, connectionId: string) {
    const existing = await this.prisma.professionalConnection.findFirst({ where: { id: connectionId, userId, deletedAt: null } });
    if (!existing) throw new NotFoundException({ code: "CONNECTION_NOT_FOUND", message: "Conexao profissional nao encontrada." });

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.professionalConnection.update({ where: { id: existing.id }, data: { status: "revoked", revokedAt: now } }),
      this.prisma.auditLog.create({
        data: {
          actorUserId: userId,
          targetUserId: userId,
          action: "professional_connection_revoked",
          entityType: "professional_connection",
          entityId: existing.id,
          metadata: { kind: existing.kind, professionalKey: existing.professionalKey },
        },
      }),
    ]);

    return { id: existing.id, status: "revoked" };
  }

  async recipients(auth: AuthUser, kind: "nutrition" | "run") {
    await this.assertProfessionalAccess(auth, kind);
    const connections = await this.prisma.professionalConnection.findMany({
      where: { kind, status: "active", deletedAt: null, user: { deletedAt: null, status: "active" } },
      orderBy: { acceptedAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, email: true, profile: { select: { displayName: true } } } } },
    });

    return {
      data: connections.map((connection) => ({
        connectionId: connection.id,
        userId: connection.userId,
        displayName: connection.user.profile?.displayName ?? connection.user.email.split("@")[0],
        email: connection.user.email,
        kind: connection.kind,
        permissions: connection.permissions,
        planTitle: connection.planTitle,
        acceptedAt: connection.acceptedAt,
      })),
    };
  }

  async messageHistory(auth: AuthUser, kind: "nutrition" | "run") {
    await this.assertProfessionalAccess(auth, kind);
    const logs = await this.prisma.auditLog.findMany({
      where: { actorUserId: auth.userId, action: "professional_touch_sent" },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: { target: { select: { id: true, email: true, profile: { select: { displayName: true } } } } },
    });
    const filtered = logs.filter((log) => metadataValue(log.metadata, "kind") === kind).slice(0, 20);
    const notificationIds = filtered.map((log) => log.entityId).filter((id): id is string => Boolean(id));
    const notifications = notificationIds.length
      ? await this.prisma.notification.findMany({
          where: { id: { in: notificationIds } },
          select: { id: true, title: true, body: true, actionUrl: true, createdAt: true },
        })
      : [];
    const notificationById = new Map(notifications.map((item) => [item.id, item]));

    return {
      data: filtered.map((log) => {
        const notification = log.entityId ? notificationById.get(log.entityId) : null;
        return {
          id: log.id,
          notificationId: log.entityId,
          kind,
          category: metadataValue(log.metadata, "category") ?? "free",
          title: notification?.title ?? "Toque enviado",
          body: notification?.body ?? "",
          actionUrl: notification?.actionUrl ?? null,
          targetUserId: log.targetUserId,
          targetName: log.target?.profile?.displayName ?? log.target?.email?.split("@")[0] ?? "Usuario",
          targetEmail: log.target?.email ?? null,
          createdAt: log.createdAt,
        };
      }),
    };
  }

  async sendMessage(auth: AuthUser, dto: SendProfessionalMessageDto) {
    await this.assertProfessionalAccess(auth, dto.kind);
    const connection = await this.prisma.professionalConnection.findFirst({
      where: { userId: dto.targetUserId, kind: dto.kind, status: "active", deletedAt: null, user: { deletedAt: null, status: "active" } },
      select: { id: true, userId: true, kind: true, professionalName: true, professionalKey: true },
    });
    if (!connection) throw new NotFoundException({ code: "PROFESSIONAL_CONNECTION_NOT_FOUND", message: "Usuario conectado nao encontrado para este produto." });

    const preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId: connection.userId },
      select: {
        professionalMessagesEnabled: true,
        nutritionProMessagesEnabled: true,
        runProMessagesEnabled: true,
      },
    });
    const productAllowed = dto.kind === "run" ? preferences?.runProMessagesEnabled !== false : preferences?.nutritionProMessagesEnabled !== false;
    if (preferences?.professionalMessagesEnabled === false || !productAllowed) {
      throw new ForbiddenException({ code: "PROFESSIONAL_MESSAGES_DISABLED", message: "O usuario desativou Toques Pro para este produto." });
    }

    const title = dto.title.trim();
    const body = dto.body.trim();
    if (!title || !body) throw new BadRequestException({ code: "MESSAGE_REQUIRED", message: "Titulo e mensagem sao obrigatorios." });
    const actionUrl = dto.actionUrl?.startsWith("/") ? dto.actionUrl : dto.kind === "run" ? "/workouts" : "/nutrition";

    const notification = await this.prisma.$transaction(async (tx) => {
      const created = await tx.notification.create({
        data: {
          userId: connection.userId,
          type: "professional_message",
          title,
          body,
          actionUrl,
          metadata: {
            origin: dto.kind === "run" ? "Run Pro" : "Nutri Pro",
            kind: dto.kind,
            category: dto.category,
            professionalName: connection.professionalName,
            professionalKey: connection.professionalKey,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: auth.userId,
          targetUserId: connection.userId,
          action: "professional_touch_sent",
          entityType: "notification",
          entityId: created.id,
          metadata: { kind: dto.kind, category: dto.category, connectionId: connection.id },
        },
      });

      return created;
    });

    return { notification };
  }
}
