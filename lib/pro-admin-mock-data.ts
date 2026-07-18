import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export type WorkspaceStatus = "healthy" | "attention" | "setup";

export const adminStats = [
  { label: "Usuários totais", value: "62", detail: "38 nutri, 24 run/teste", icon: UsersRound, tone: "lime" },
  { label: "Ativos hoje", value: "31", detail: "50% da base abriu o app", icon: Activity, tone: "cyan" },
  { label: "Profissionais", value: "2", detail: "Nutri e Run em ambientes separados", icon: ShieldCheck, tone: "green" },
  { label: "Pendencias", value: "5", detail: "convites, planos e check-ins", icon: AlertTriangle, tone: "coral" },
] as const;

export const productWorkspaces = [
  {
    id: "nutrition",
    title: "LevelFit Pro Nutri",
    owner: "Dr. Rafael Martins",
    status: "healthy" as WorkspaceStatus,
    users: 38,
    activeToday: 19,
    retention: 74,
    revenueState: "Piloto pago ou validação local",
    nextStep: "Conectar planos reais e carteira do nutricionista",
  },
  {
    id: "run",
    title: "LevelFit Run Pro",
    owner: "Coach TAF / Corrida",
    status: "setup" as WorkspaceStatus,
    users: 24,
    activeToday: 12,
    retention: 68,
    revenueState: "Piloto inicial sem GPS",
    nextStep: "Validar treinos, simulados e acompanhamento semanal",
  },
];

export const ownerChecklist = [
  { title: "Separar login por perfil", detail: "Admin, nutricionista, run coach e usuario final.", done: false },
  { title: "Definir convite por profissional", detail: "Cada profissional enxerga somente a própria carteira.", done: false },
  { title: "Publicar piloto controlado", detail: "Poucos usuários reais, feedback rápido e ajustes semanais.", done: true },
  { title: "Monitorar retenção", detail: "Ver quem criou conta, voltou, registrou e concluiu missões.", done: true },
  { title: "Preparar monetização", detail: "Plano mensal por profissional ou por carteira ativa.", done: false },
] as const;

export const adminTimeline = [
  { icon: CheckCircle2, tone: "green", title: "Build visual Pro aprovado", detail: "Nutri e Run seguem o mesmo padrão premium." },
  { icon: BarChart3, tone: "cyan", title: "Gestão geral adicionada", detail: "Tela para controlar uso, produtos e próximas pendências." },
  { icon: AlertTriangle, tone: "gold", title: "Falta backend de papéis", detail: "Hoje a separação ainda é visual/mockada." },
  { icon: ShieldCheck, tone: "lime", title: "Próximo salto seguro", detail: "Implementar RBAC e escopo por profissional antes de vender maior." },
] as const;

export function workspaceStatusLabel(status: WorkspaceStatus) {
  return ({ healthy: "Saudável", attention: "Atenção", setup: "Configurando" } as const)[status];
}
