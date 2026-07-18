import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Droplets,
  FileText,
  MessageSquareText,
  TrendingUp,
  UsersRound,
} from "lucide-react";

export type ProClientStatus = "active" | "attention" | "new" | "paused";
export type AppointmentStatus = "confirmed" | "pending" | "done" | "cancelled";
export type AppointmentMode = "presencial" | "online";
export type AlertPriority = "high" | "medium" | "low";

export type ProClient = {
  id: string;
  name: string;
  initials: string;
  avatarTone: "lime" | "cyan" | "green" | "gold" | "violet" | "coral";
  status: ProClientStatus;
  goal: string;
  plan: string;
  adherence: number;
  hydration: number;
  checkins: string;
  lastRecord: string;
  nextAppointment: string;
  riskReason?: string;
  permissions: string[];
  metrics: {
    weight?: string;
    energy: number;
    hunger: number;
    sleep: string;
  };
  week: number[];
  meals: Array<{ name: string; status: "done" | "partial" | "missed" | "pending"; note: string }>;
  notes: Array<{ date: string; title: string; body: string }>;
};

export type ProAppointment = {
  id: string;
  clientId: string;
  clientName: string;
  time: string;
  dateLabel: string;
  type: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
  note: string;
};

export type ProAlert = {
  id: string;
  clientId: string;
  clientName: string;
  priority: AlertPriority;
  title: string;
  detail: string;
  action: string;
};

export type NutritionPlanTemplate = {
  id: string;
  title: string;
  target: string;
  meals: number;
  clients: number;
  updatedAt: string;
};

export const proStats = [
  { label: "Clientes ativos", value: "38", detail: "+4 neste mês", icon: UsersRound, tone: "lime" },
  { label: "Retornos hoje", value: "4", detail: "2 presenciais, 2 online", icon: CalendarClock, tone: "cyan" },
  { label: "Check-ins pendentes", value: "11", detail: "priorizar antes das 18h", icon: ClipboardList, tone: "gold" },
  { label: "Planos para revisar", value: "6", detail: "3 vencem esta semana", icon: FileText, tone: "coral" },
] as const;

export const proClients: ProClient[] = [
  {
    id: "maria-souza",
    name: "Maria Souza",
    initials: "MS",
    avatarTone: "lime",
    status: "active",
    goal: "Recomposição corporal",
    plan: "Plano Base Performance",
    adherence: 86,
    hydration: 78,
    checkins: "6/7",
    lastRecord: "Hoje, 08:20",
    nextAppointment: "Hoje, 09:00",
    permissions: ["Alimentação", "Hidratação", "Check-ins", "Medidas"],
    metrics: { weight: "68,4 kg", energy: 4, hunger: 2, sleep: "7h20" },
    week: [76, 82, 90, 72, 88, 94, 86],
    meals: [
      { name: "Café da manhã", status: "done", note: "Seguiu plano com proteína." },
      { name: "Almoço", status: "partial", note: "Comeu fora, manteve proteína." },
      { name: "Lanche", status: "pending", note: "Ainda não registrado." },
      { name: "Jantar", status: "pending", note: "Planejado para 20h." },
    ],
    notes: [
      { date: "18 jul", title: "Retorno", body: "Boa consistência. Ajustar ceia se fome noturna voltar." },
      { date: "11 jul", title: "Check-in", body: "Energia melhorou após aumentar carboidrato no almoço." },
    ],
  },
  {
    id: "joao-lima",
    name: "João Lima",
    initials: "JL",
    avatarTone: "coral",
    status: "attention",
    goal: "Emagrecimento sustentável",
    plan: "Plano Rotina Flexível",
    adherence: 42,
    hydration: 51,
    checkins: "2/7",
    lastRecord: "4 dias atrás",
    nextAppointment: "Hoje, 10:30",
    riskReason: "Sem registro alimentar há 4 dias",
    permissions: ["Alimentação", "Hidratação", "Check-ins"],
    metrics: { weight: "92,1 kg", energy: 2, hunger: 5, sleep: "5h50" },
    week: [62, 44, 30, 0, 0, 0, 42],
    meals: [
      { name: "Café da manhã", status: "missed", note: "Não registrado." },
      { name: "Almoço", status: "missed", note: "Não registrado." },
      { name: "Lanche", status: "pending", note: "Solicitar atualização." },
      { name: "Jantar", status: "pending", note: "Solicitar atualização." },
    ],
    notes: [
      { date: "17 jul", title: "Alerta", body: "Enviar mensagem curta antes do retorno. Evitar cobrança pesada." },
      { date: "04 jul", title: "Plano", body: "Preferiu opções simples para marmita." },
    ],
  },
  {
    id: "ana-paula",
    name: "Ana Paula",
    initials: "AP",
    avatarTone: "gold",
    status: "attention",
    goal: "Controle de fome noturna",
    plan: "Plano Saciedade",
    adherence: 68,
    hydration: 72,
    checkins: "5/7",
    lastRecord: "Ontem, 21:12",
    nextAppointment: "Hoje, 14:00",
    riskReason: "Fome alta em 3 check-ins",
    permissions: ["Alimentação", "Hidratação", "Check-ins", "Medidas"],
    metrics: { weight: "74,8 kg", energy: 3, hunger: 5, sleep: "6h10" },
    week: [70, 68, 64, 72, 60, 66, 68],
    meals: [
      { name: "Café da manhã", status: "done", note: "Ok." },
      { name: "Almoço", status: "done", note: "Ok." },
      { name: "Lanche", status: "partial", note: "Relatou fome alta." },
      { name: "Jantar", status: "partial", note: "Jantar tardio." },
    ],
    notes: [
      { date: "16 jul", title: "Hipótese", body: "Revisar lanche da tarde e horário do jantar." },
    ],
  },
  {
    id: "carlos-mendes",
    name: "Carlos Mendes",
    initials: "CM",
    avatarTone: "cyan",
    status: "new",
    goal: "Primeiro plano",
    plan: "Sem plano ativo",
    adherence: 0,
    hydration: 0,
    checkins: "0/7",
    lastRecord: "Nunca",
    nextAppointment: "Hoje, 16:30",
    riskReason: "Convite aceito, plano pendente",
    permissions: ["Alimentação", "Hidratação", "Check-ins"],
    metrics: { energy: 0, hunger: 0, sleep: "-" },
    week: [0, 0, 0, 0, 0, 0, 0],
    meals: [
      { name: "Café da manhã", status: "pending", note: "Aguardando plano." },
      { name: "Almoço", status: "pending", note: "Aguardando plano." },
      { name: "Lanche", status: "pending", note: "Aguardando plano." },
      { name: "Jantar", status: "pending", note: "Aguardando plano." },
    ],
    notes: [
      { date: "18 jul", title: "Novo cliente", body: "Criar plano inicial após primeira consulta." },
    ],
  },
  {
    id: "bruna-alves",
    name: "Bruna Alves",
    initials: "BA",
    avatarTone: "green",
    status: "active",
    goal: "Performance na corrida",
    plan: "Plano Corrida + Nutrição",
    adherence: 79,
    hydration: 83,
    checkins: "5/7",
    lastRecord: "Hoje, 07:40",
    nextAppointment: "Amanhã, 08:30",
    permissions: ["Alimentação", "Hidratação", "Check-ins", "Corrida"],
    metrics: { weight: "61,2 kg", energy: 4, hunger: 3, sleep: "7h05" },
    week: [74, 80, 76, 84, 82, 78, 79],
    meals: [
      { name: "Café da manhã", status: "done", note: "Pré-treino registrado." },
      { name: "Almoço", status: "done", note: "Ok." },
      { name: "Lanche", status: "pending", note: "Ainda não registrado." },
      { name: "Jantar", status: "pending", note: "Planejado." },
    ],
    notes: [
      { date: "15 jul", title: "Corrida", body: "Manter carboidrato antes dos treinos intensos." },
    ],
  },
];

export const appointments: ProAppointment[] = [
  { id: "a1", clientId: "maria-souza", clientName: "Maria Souza", time: "09:00", dateLabel: "Hoje", type: "Retorno nutricional", mode: "presencial", status: "confirmed", note: "Revisar fome noturna e ceia." },
  { id: "a2", clientId: "joao-lima", clientName: "João Lima", time: "10:30", dateLabel: "Hoje", type: "Primeira consulta", mode: "online", status: "pending", note: "Chegar com plano base pronto." },
  { id: "a3", clientId: "ana-paula", clientName: "Ana Paula", time: "14:00", dateLabel: "Hoje", type: "Ajuste de plano", mode: "presencial", status: "confirmed", note: "Revisar lanche da tarde." },
  { id: "a4", clientId: "carlos-mendes", clientName: "Carlos Mendes", time: "16:30", dateLabel: "Hoje", type: "Primeira consulta", mode: "online", status: "pending", note: "Cliente novo, sem plano ativo." },
  { id: "a5", clientId: "bruna-alves", clientName: "Bruna Alves", time: "08:30", dateLabel: "Amanhã", type: "Retorno corrida + nutrição", mode: "online", status: "confirmed", note: "Checar energia em treinos longos." },
];

export const proAlerts: ProAlert[] = [
  { id: "al1", clientId: "joao-lima", clientName: "João Lima", priority: "high", title: "Sem registro há 4 dias", detail: "Último check-in indicou baixa energia e fome alta.", action: "Enviar orientação curta" },
  { id: "al2", clientId: "ana-paula", clientName: "Ana Paula", priority: "high", title: "Fome alta recorrente", detail: "3 respostas acima de 4/5 nesta semana.", action: "Revisar lanche e jantar" },
  { id: "al3", clientId: "carlos-mendes", clientName: "Carlos Mendes", priority: "medium", title: "Plano pendente", detail: "Cliente aceitou convite, mas ainda não recebeu plano.", action: "Criar primeiro plano" },
  { id: "al4", clientId: "maria-souza", clientName: "Maria Souza", priority: "low", title: "Boa aderência", detail: "Semana acima de 80%. Bom momento para reforço positivo.", action: "Registrar nota" },
];

export const planTemplates: NutritionPlanTemplate[] = [
  { id: "base-performance", title: "Base Performance", target: "Recomposição e treino regular", meals: 5, clients: 12, updatedAt: "Atualizado hoje" },
  { id: "rotina-flexivel", title: "Rotina Flexível", target: "Emagrecimento sem rigidez", meals: 4, clients: 9, updatedAt: "Atualizado ontem" },
  { id: "saciedade", title: "Saciedade Noturna", target: "Controle de fome e compulsão", meals: 5, clients: 6, updatedAt: "Atualizado há 3 dias" },
  { id: "corrida-nutricao", title: "Corrida + Nutrição", target: "Energia para treinos de rua", meals: 5, clients: 4, updatedAt: "Atualizado há 5 dias" },
];

export const proActivity = [
  { icon: CheckCircle2, tone: "green", title: "Maria registrou café da manhã", detail: "Seguiu plano com fonte de proteína." },
  { icon: AlertTriangle, tone: "gold", title: "Ana marcou fome alta", detail: "Resposta 5/5 no check-in de ontem." },
  { icon: Droplets, tone: "cyan", title: "Bruna bateu meta de água", detail: "2,5 L registrados antes das 20h." },
  { icon: MessageSquareText, tone: "violet", title: "João enviou observação", detail: "Relatou dificuldade com rotina de trabalho." },
  { icon: TrendingUp, tone: "lime", title: "Carteira acima da semana anterior", detail: "Aderência média subiu 7 pontos." },
] as const;

export function getClient(clientId: string) {
  return proClients.find((client) => client.id === clientId);
}

export function statusLabel(status: ProClientStatus) {
  return ({ active: "Ativo", attention: "Atenção", new: "Novo", paused: "Pausado" } as const)[status];
}

export function appointmentStatusLabel(status: AppointmentStatus) {
  return ({ confirmed: "Confirmado", pending: "Pendente", done: "Concluído", cancelled: "Cancelado" } as const)[status];
}

