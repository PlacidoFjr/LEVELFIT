import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { AcceptProfessionalInviteDto, UpdateProfessionalPermissionsDto } from "./professionals.dto";

const allowedPermissions = new Set([
  "nutrition",
  "hydration",
  "body_checkins",
  "progress_photos",
  "workouts",
  "run_checkins",
  "notes",
]);

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function sanitizePermissions(permissions: string[] | undefined, fallback: string[]) {
  const source = permissions?.length ? permissions : fallback;
  return Array.from(new Set(source.map((item) => item.trim()).filter((item) => allowedPermissions.has(item))));
}

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

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
      code: invite.code,
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

    const permissions = sanitizePermissions(dto.permissions, invite.defaultPermissions);
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
    const permissions = sanitizePermissions(dto.permissions, []);
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
}
