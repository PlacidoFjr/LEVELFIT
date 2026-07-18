import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Gauge,
  Medal,
  Route,
  Timer,
  UsersRound,
} from "lucide-react";

export type RunAthleteStatus = "ready" | "attention" | "building" | "new";

export type RunAthlete = {
  id: string;
  name: string;
  initials: string;
  objective: string;
  status: RunAthleteStatus;
  phase: string;
  readiness: number;
  weeklyLoad: string;
  nextSession: string;
  bestTwoKm: string;
  lastCheckin: string;
  risk?: string;
  week: number[];
};

export type RunSession = {
  id: string;
  title: string;
  type: "base" | "interval" | "strength" | "test" | "recovery";
  duration: string;
  target: string;
  athletes: number;
  intensity: string;
};

export const runStats = [
  { label: "Atletas ativos", value: "24", detail: "7 em preparação TAF", icon: UsersRound, tone: "lime" },
  { label: "Sessões hoje", value: "6", detail: "3 corrida, 2 força, 1 mobilidade", icon: CalendarClock, tone: "cyan" },
  { label: "Prontos para teste", value: "8", detail: "readiness acima de 80%", icon: Medal, tone: "gold" },
  { label: "Alertas de carga", value: "3", detail: "ajustar volume antes do fim do dia", icon: AlertTriangle, tone: "coral" },
] as const;

export const runAthletes: RunAthlete[] = [
  {
    id: "bruna-alves",
    name: "Bruna Alves",
    initials: "BA",
    objective: "TAF 2 km em 12 min",
    status: "ready",
    phase: "Polimento",
    readiness: 88,
    weeklyLoad: "18 km",
    nextSession: "Intervalado curto - 18:30",
    bestTwoKm: "11:48",
    lastCheckin: "Hoje, 07:20",
    week: [62, 70, 76, 80, 84, 86, 88],
  },
  {
    id: "rafael-costa",
    name: "Rafael Costa",
    initials: "RC",
    objective: "TAF PM - corrida + flexão",
    status: "attention",
    phase: "Base aeróbica",
    readiness: 54,
    weeklyLoad: "9 km",
    nextSession: "Rodagem leve - amanhã",
    bestTwoKm: "14:32",
    lastCheckin: "2 dias atrás",
    risk: "Dor leve na canela",
    week: [44, 52, 58, 42, 46, 50, 54],
  },
  {
    id: "camila-nunes",
    name: "Camila Nunes",
    initials: "CN",
    objective: "5 km sem pausa",
    status: "building",
    phase: "Construção",
    readiness: 71,
    weeklyLoad: "12 km",
    nextSession: "Run/walk progressivo - hoje",
    bestTwoKm: "13:05",
    lastCheckin: "Hoje, 09:10",
    week: [55, 60, 63, 65, 67, 69, 71],
  },
  {
    id: "diego-moura",
    name: "Diego Moura",
    initials: "DM",
    objective: "Retomar corrida",
    status: "new",
    phase: "Triagem",
    readiness: 22,
    weeklyLoad: "0 km",
    nextSession: "Avaliação inicial - sexta",
    bestTwoKm: "-",
    lastCheckin: "Novo convite",
    week: [0, 0, 0, 10, 14, 18, 22],
  },
];

export const runSessions: RunSession[] = [
  {
    id: "easy-base",
    title: "Base leve controlada",
    type: "base",
    duration: "35 min",
    target: "Conversável, técnica solta e sem sprint",
    athletes: 11,
    intensity: "Leve",
  },
  {
    id: "taf-interval",
    title: "Intervalado TAF 2 km",
    type: "interval",
    duration: "42 min",
    target: "6 x 400 m no ritmo-alvo com pausa completa",
    athletes: 7,
    intensity: "Moderado",
  },
  {
    id: "run-strength",
    title: "Forca para corrida",
    type: "strength",
    duration: "28 min",
    target: "Core, panturrilha, glúteos e estabilidade",
    athletes: 18,
    intensity: "Técnico",
  },
  {
    id: "recovery",
    title: "Recuperação ativa",
    type: "recovery",
    duration: "22 min",
    target: "Mobilidade, respiração e caminhada leve",
    athletes: 9,
    intensity: "Baixo impacto",
  },
];

export const runTimeline = [
  { time: "07:30", title: "Bruna Alves", detail: "Check-in de treino concluído. Pronta para bloco intervalado.", tone: "lime" },
  { time: "10:00", title: "Rafael Costa", detail: "Revisar carga por relato de canela sensivel.", tone: "coral" },
  { time: "15:30", title: "Grupo TAF", detail: "Enviar orientação de aquecimento antes do treino das 18h.", tone: "gold" },
  { time: "18:30", title: "Intervalado TAF", detail: "Sessão principal do dia para 7 atletas.", tone: "cyan" },
] as const;

export const runProgramBlocks = [
  { label: "Seg", title: "Base leve", detail: "30-40 min em zona confortável", done: true },
  { label: "Ter", title: "Força + core", detail: "Técnica, postura e estabilidade", done: true },
  { label: "Qua", title: "Intervalado", detail: "Ritmo TAF com pausas completas", done: false },
  { label: "Qui", title: "Recuperação", detail: "Caminhada, mobilidade ou descanso", done: false },
  { label: "Sex", title: "Simulado curto", detail: "Controle de pace sem esgotar", done: false },
] as const;

export const runActivity = [
  { icon: Route, tone: "cyan", title: "7 atletas com treino publicado", detail: "Treinos da semana liberados sem GPS obrigatório." },
  { icon: Gauge, tone: "gold", title: "3 precisam reduzir carga", detail: "Sinais de fadiga ou dor leve no check-in." },
  { icon: Timer, tone: "lime", title: "8 prontos para simulado", detail: "Readiness acima de 80% e boa frequência." },
  { icon: Activity, tone: "coral", title: "TAF em 21 dias", detail: "Criar bloco de polimento na próxima semana." },
] as const;

export function runStatusLabel(status: RunAthleteStatus) {
  return ({ ready: "Pronto", attention: "Atenção", building: "Evoluindo", new: "Novo" } as const)[status];
}
