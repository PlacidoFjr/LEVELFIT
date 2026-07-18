import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const today = startOfToday();
    const [
      totalUsers,
      activeUsers,
      activeToday,
      nutritionConnections,
      runConnections,
      workouts,
      foodLogsToday,
      workoutSessionsToday,
      pendingNotifications,
      professionalConnections,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, status: "active" } }),
      this.prisma.user.count({ where: { deletedAt: null, lastLoginAt: { gte: today } } }),
      this.prisma.professionalConnection.count({ where: { kind: "nutrition", status: "active", deletedAt: null } }),
      this.prisma.professionalConnection.count({ where: { kind: "run", status: "active", deletedAt: null } }),
      this.prisma.workout.count({ where: { deletedAt: null, isPublic: true } }),
      this.prisma.foodLog.count({ where: { deletedAt: null, loggedAt: { gte: today } } }),
      this.prisma.workoutSession.count({ where: { deletedAt: null, startedAt: { gte: today } } }),
      this.prisma.notification.count({ where: { deletedAt: null, readAt: null } }),
      this.prisma.professionalConnection.findMany({
        where: { status: "active", deletedAt: null },
        select: { kind: true, professionalName: true, professionalRole: true, planTitle: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const professionals = Number(Boolean(nutritionConnections)) + Number(Boolean(runConnections));
    const pendingCount = pendingNotifications + Math.max(0, professionalConnections.length ? 0 : 2);

    return {
      stats: [
        { label: "Usuários totais", value: String(totalUsers), detail: `${activeUsers} ativos na base`, tone: "lime" },
        { label: "Ativos hoje", value: String(activeToday), detail: `${percent(activeToday, Math.max(1, totalUsers))}% da base abriu o app`, tone: "cyan" },
        { label: "Profissionais", value: String(professionals), detail: `${nutritionConnections} nutri, ${runConnections} run conectados`, tone: "green" },
        { label: "Pendências", value: String(pendingCount), detail: "notificações e conexões a revisar", tone: "coral" },
      ],
      workspaces: [
        {
          id: "nutrition",
          title: "LevelFit Pro Nutri",
          owner: "Dr. Rafael Martins",
          status: nutritionConnections > 0 ? "healthy" : "setup",
          users: nutritionConnections,
          activeToday: foodLogsToday,
          retention: percent(foodLogsToday, Math.max(1, nutritionConnections || totalUsers)),
          revenueState: "Piloto conectado à API",
          nextStep: "Publicar planos alimentares por cliente",
        },
        {
          id: "run",
          title: "LevelFit Run Pro",
          owner: "Coach TAF / Corrida",
          status: runConnections > 0 ? "healthy" : "setup",
          users: runConnections,
          activeToday: workoutSessionsToday,
          retention: percent(workoutSessionsToday, Math.max(1, runConnections || totalUsers)),
          revenueState: "Piloto TAF sem GPS",
          nextStep: "Publicar treinos TAF por atleta",
        },
      ],
      checklist: [
        { title: "Separar login por perfil", detail: "Owner bloqueado por OWNER_EMAILS; RBAC completo entra na próxima fase.", done: false },
        { title: "Definir convite por profissional", detail: "Códigos Nutri e TAF já existem na API.", done: true },
        { title: "Publicar piloto controlado", detail: "Poucos usuários reais, feedback rápido e ajustes semanais.", done: true },
        { title: "Monitorar retenção", detail: "A API já retorna usuários ativos e atividade do dia.", done: true },
        { title: "Preparar monetização", detail: "Plano mensal por profissional ou carteira ativa.", done: false },
      ],
      timeline: [
        { tone: "green", title: "API de gestão criada", detail: "Métricas agregadas sem expor dados sensíveis." },
        { tone: "cyan", title: "Conexões profissionais ativas", detail: "Usuário aceita convites e controla permissões." },
        { tone: "gold", title: "RBAC ainda evolui", detail: "Owner por allowlist agora; roles no banco depois." },
        { tone: "lime", title: "Próximo salto seguro", detail: "Escopo por profissional antes de vender maior." },
      ],
      recentConnections: professionalConnections,
      meta: { generatedAt: new Date().toISOString(), source: "api" },
      catalog: { publicWorkouts: workouts },
    };
  }
}
