import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { splitEmails, type AccessRole } from "../../common/access-profile";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

type AdminRole = Exclude<AccessRole, "USER">;

const adminRoles: AdminRole[] = ["OWNER", "NUTRITIONIST", "RUN_COACH"];

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function roleLabel(role: AdminRole) {
  return { OWNER: "Owner", NUTRITIONIST: "Nutri Pro", RUN_COACH: "Run Pro" }[role];
}

function productFromRole(role: AdminRole) {
  if (role === "NUTRITIONIST") return "nutri";
  if (role === "RUN_COACH") return "run";
  return "owner";
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  private envRoleRows() {
    return [
      ...splitEmails(this.config.get<string>("OWNER_EMAILS")).map((email) => ({ id: `env-owner-${email}`, email, role: "OWNER" as AdminRole, source: "env", revokedAt: null, createdAt: null })),
      ...splitEmails(this.config.get<string>("NUTRITIONIST_EMAILS")).map((email) => ({ id: `env-nutri-${email}`, email, role: "NUTRITIONIST" as AdminRole, source: "env", revokedAt: null, createdAt: null })),
      ...splitEmails(this.config.get<string>("RUN_COACH_EMAILS")).map((email) => ({ id: `env-run-${email}`, email, role: "RUN_COACH" as AdminRole, source: "env", revokedAt: null, createdAt: null })),
    ];
  }

  async overview() {
    const today = startOfToday();
    const [totalUsers, activeUsers, activeToday, nutritionConnections, runConnections, publicWorkouts, foodLogsToday, workoutSessionsToday, manualRoles] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, status: "active" } }),
      this.prisma.user.count({ where: { deletedAt: null, lastLoginAt: { gte: today } } }),
      this.prisma.professionalConnection.count({ where: { kind: "nutrition", status: "active", deletedAt: null } }),
      this.prisma.professionalConnection.count({ where: { kind: "run", status: "active", deletedAt: null } }),
      this.prisma.workout.count({ where: { deletedAt: null, isPublic: true } }),
      this.prisma.foodLog.count({ where: { deletedAt: null, loggedAt: { gte: today } } }),
      this.prisma.workoutSession.count({ where: { deletedAt: null, startedAt: { gte: today } } }),
      this.prisma.userRoleAssignment.count({ where: { revokedAt: null } }),
    ]);
    const envRoles = this.envRoleRows().length;
    const professionalRoles = await this.countProfessionalRoles();

    return {
      stats: [
        { label: "Usuarios totais", value: String(totalUsers), detail: `${activeUsers} ativos na base`, tone: "lime" },
        { label: "Ativos hoje", value: String(activeToday), detail: `${percent(activeToday, Math.max(1, totalUsers))}% da base abriu o app`, tone: "cyan" },
        { label: "Perfis Pro", value: String(professionalRoles), detail: `${manualRoles} no banco, ${envRoles} no ambiente`, tone: "green" },
        { label: "Catalogo", value: String(publicWorkouts), detail: "treinos publicos disponiveis", tone: "coral" },
      ],
      products: [
        {
          id: "levelfit",
          title: "LevelFit",
          description: "Aplicativo do usuario final com treino, alimentacao, hidratacao, missoes e progresso.",
          users: totalUsers,
          activeToday,
          status: "active",
          route: "/",
        },
        {
          id: "nutri",
          title: "Nutri Pro",
          description: "Carteira nutricional, planos alimentares e retornos.",
          users: nutritionConnections,
          activeToday: foodLogsToday,
          status: nutritionConnections > 0 ? "active" : "setup",
          route: "/pro",
        },
        {
          id: "run",
          title: "Run Pro",
          description: "Carteira de atletas e treinos TAF sem GPS nesta fase.",
          users: runConnections,
          activeToday: workoutSessionsToday,
          status: runConnections > 0 ? "active" : "setup",
          route: "/pro/run",
        },
      ],
      checklist: [
        { title: "Owner protegido", detail: "Acesso principal controlado por OWNER_EMAILS e papel OWNER ativo.", done: envRoles > 0 },
        { title: "Revogacao de perfis", detail: "Papeis manuais podem ser revogados pela Gestao.", done: true },
        { title: "Perfis Pro separados", detail: "Nutri e Run aparecem conforme papel do login.", done: true },
      ],
      meta: { generatedAt: new Date().toISOString(), source: "api" as const },
    };
  }

  async users() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        profile: { select: { displayName: true } },
        roleAssignments: { where: { revokedAt: null }, select: { id: true, role: true, source: true, createdAt: true } },
        _count: { select: { professionalConnections: true, workoutSessions: true, foodLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.profile?.displayName ?? user.email.split("@")[0],
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        roles: [...this.envRoleRows().filter((item) => item.email === user.email.toLowerCase()).map((item) => item.role), ...user.roleAssignments.map((item) => item.role as AdminRole)],
        activity: { professionalConnections: user._count.professionalConnections, workoutSessions: user._count.workoutSessions, foodLogs: user._count.foodLogs },
      })),
    };
  }

  async products() {
    const overview = await this.overview();
    return { data: overview.products, meta: overview.meta };
  }

  async professionals() {
    const roles = await this.roles();
    const connections = await this.prisma.professionalConnection.groupBy({
      by: ["kind", "professionalKey", "professionalName", "professionalRole"],
      where: { status: "active", deletedAt: null },
      _count: { _all: true },
    });

    return {
      data: roles.data
        .filter((role) => role.role === "NUTRITIONIST" || role.role === "RUN_COACH")
        .map((role) => {
          const product = productFromRole(role.role);
          const connection = connections.find((item) => item.kind === (product === "nutri" ? "nutrition" : "run"));
          return {
            ...role,
            product,
            label: roleLabel(role.role),
            connectedClients: connection?._count._all ?? 0,
            professionalName: connection?.professionalName ?? (role.role === "NUTRITIONIST" ? "Nutri Pro" : "Coach TAF"),
            professionalRole: connection?.professionalRole ?? (role.role === "NUTRITIONIST" ? "Nutricao" : "Corrida e TAF"),
          };
        }),
    };
  }

  async roles() {
    const manual = await this.prisma.userRoleAssignment.findMany({
      where: { revokedAt: null },
      include: {
        user: { select: { email: true, profile: { select: { displayName: true } } } },
        assignedBy: { select: { email: true, profile: { select: { displayName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      availableRoles: adminRoles.map((role) => ({ role, label: roleLabel(role), product: productFromRole(role) })),
      data: [
        ...this.envRoleRows().map((item) => ({ ...item, displayName: item.email.split("@")[0], assignedBy: "Render env", canRevoke: false, product: productFromRole(item.role), label: roleLabel(item.role) })),
        ...manual.map((item) => ({
          id: item.id,
          email: item.user.email,
          displayName: item.user.profile?.displayName ?? item.user.email.split("@")[0],
          role: item.role as AdminRole,
          source: item.source,
          createdAt: item.createdAt,
          revokedAt: item.revokedAt,
          assignedBy: item.assignedBy?.profile?.displayName ?? item.assignedBy?.email ?? "Owner",
          canRevoke: item.source !== "env",
          product: productFromRole(item.role as AdminRole),
          label: roleLabel(item.role as AdminRole),
        })),
      ],
    };
  }

  async grantRole(actorUserId: string, email: string, role: AdminRole) {
    if (!adminRoles.includes(role)) throw new BadRequestException({ code: "INVALID_ROLE", message: "Papel invalido." });
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { email: normalizedEmail, deletedAt: null }, select: { id: true, email: true } });
    if (!user) throw new NotFoundException({ code: "USER_NOT_FOUND", message: "Usuario nao encontrado com este e-mail." });

    const existing = await this.prisma.userRoleAssignment.findFirst({ where: { userId: user.id, role, revokedAt: null }, select: { id: true } });
    if (existing) throw new BadRequestException({ code: "ROLE_ALREADY_ACTIVE", message: "Este papel ja esta ativo para o usuario." });

    const assignment = await this.prisma.userRoleAssignment.create({
      data: { userId: user.id, role, source: "manual", assignedByUserId: actorUserId },
      include: { user: { select: { email: true, profile: { select: { displayName: true } } } } },
    });
    await this.prisma.auditLog.create({ data: { actorUserId, targetUserId: user.id, action: "admin_role_granted", entityType: "user_role_assignment", entityId: assignment.id, metadata: { role, source: "manual" } } });
    return { assignment };
  }

  async revokeRole(actorUserId: string, id: string) {
    const assignment = await this.prisma.userRoleAssignment.findFirst({ where: { id, revokedAt: null }, select: { id: true, userId: true, role: true, source: true } });
    if (!assignment) throw new NotFoundException({ code: "ROLE_NOT_FOUND", message: "Papel ativo nao encontrado." });
    if (assignment.source === "env") throw new BadRequestException({ code: "ENV_ROLE_CANNOT_BE_REVOKED_HERE", message: "Remova este papel nas variaveis de ambiente." });

    const revoked = await this.prisma.userRoleAssignment.update({ where: { id }, data: { revokedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { actorUserId, targetUserId: assignment.userId, action: "admin_role_revoked", entityType: "user_role_assignment", entityId: id, metadata: { role: assignment.role } } });
    return { id: revoked.id, revokedAt: revoked.revokedAt };
  }

  async settings() {
    return {
      ownerEmailsConfigured: splitEmails(this.config.get<string>("OWNER_EMAILS")).length,
      nutritionistEmailsConfigured: splitEmails(this.config.get<string>("NUTRITIONIST_EMAILS")).length,
      runCoachEmailsConfigured: splitEmails(this.config.get<string>("RUN_COACH_EMAILS")).length,
      nodeEnv: this.config.get<string>("NODE_ENV") ?? "development",
      webOrigin: this.config.get<string>("WEB_ORIGIN") ?? null,
    };
  }

  async securityEvents() {
    const actions = [
      "professional_invite_previewed",
      "professional_invite_preview_failed",
      "professional_connection_accepted",
      "professional_permissions_updated",
      "professional_connection_revoked",
      "admin_role_granted",
      "admin_role_revoked",
    ];
    const events = await this.prisma.auditLog.findMany({
      where: { action: { in: actions } },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        actor: { select: { email: true, profile: { select: { displayName: true } } } },
        target: { select: { email: true, profile: { select: { displayName: true } } } },
      },
    });

    return {
      data: events.map((event) => ({
        id: event.id,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        createdAt: event.createdAt,
        actorEmail: event.actor?.email ?? null,
        actorName: event.actor?.profile?.displayName ?? null,
        targetEmail: event.target?.email ?? null,
        targetName: event.target?.profile?.displayName ?? null,
        metadata: event.metadata,
      })),
    };
  }

  private async countProfessionalRoles() {
    const manual = await this.prisma.userRoleAssignment.count({ where: { revokedAt: null, role: { in: ["NUTRITIONIST", "RUN_COACH"] } } });
    const env = this.envRoleRows().filter((item) => item.role === "NUTRITIONIST" || item.role === "RUN_COACH").length;
    return manual + env;
  }
}
