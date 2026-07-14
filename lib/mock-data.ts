import {
  Apple,
  Award,
  Bike,
  BicepsFlexed,
  CheckCircle2,
  Dumbbell,
  Footprints,
  GlassWater,
  HeartPulse,
  MoonStar,
  Salad,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
} from "lucide-react";

export const user = {
  name: "Marina",
  email: "marina@levelfit.app",
  level: 12,
  levelName: "Ritmo forte",
  currentXp: 1840,
  nextLevelXp: 2200,
  streak: 18,
};

export const missions = [
  {
    id: "movement",
    title: "Movimente o corpo",
    detail: "Conclua o treino de mobilidade",
    xp: 40,
    icon: Dumbbell,
    tone: "workout",
  },
  {
    id: "water",
    title: "Hidratação em dia",
    detail: "Beba 2 litros ao longo do dia",
    xp: 25,
    icon: GlassWater,
    tone: "water",
  },
  {
    id: "nutrition",
    title: "Prato com cor",
    detail: "Inclua vegetais em duas refeições",
    xp: 30,
    icon: Salad,
    tone: "nutrition",
  },
  {
    id: "recovery",
    title: "Desacelere por 5 minutos",
    detail: "Respire, alongue ou simplesmente pause",
    xp: 20,
    icon: MoonStar,
    tone: "recovery",
  },
];

export const workoutExercises = [
  { id: "warmup", name: "Mobilidade dinâmica", meta: "5 min", icon: TimerReset },
  { id: "squat", name: "Agachamento livre", meta: "3 x 12", icon: BicepsFlexed },
  { id: "pushup", name: "Flexão inclinada", meta: "3 x 10", icon: HeartPulse },
  { id: "lunge", name: "Avanço alternado", meta: "3 x 10", icon: Footprints },
  { id: "cooldown", name: "Alongamento leve", meta: "4 min", icon: Sparkles },
];

export const nutritionItems = [
  { id: "breakfast", label: "Café da manhã equilibrado", icon: Apple, done: true },
  { id: "vegetables", label: "Vegetais em duas refeições", icon: Salad, done: false },
  { id: "protein", label: "Fonte de proteína", icon: BicepsFlexed, done: true },
  { id: "mindful", label: "Uma refeição sem distrações", icon: HeartPulse, done: false },
];

export const dailyNutritionPlans = [
  {
    id: "balanced-base",
    title: "Base alimentar do dia",
    description: "Pequenas escolhas para manter energia, sem regra rígida.",
    items: [
      { id: "breakfast", label: "Café da manhã equilibrado", icon: Apple, done: true },
      { id: "vegetables", label: "Vegetais em duas refeições", icon: Salad, done: false },
      { id: "protein", label: "Fonte de proteína", icon: BicepsFlexed, done: true },
      { id: "mindful", label: "Uma refeição sem distrações", icon: HeartPulse, done: false },
    ],
  },
  {
    id: "color-day",
    title: "Prato com mais cor",
    description: "Hoje o foco é variedade, não perfeição.",
    items: [
      { id: "fruit", label: "Uma fruta no dia", icon: Apple, done: false },
      { id: "colorful-plate", label: "Monte um prato colorido", icon: Salad, done: true },
      { id: "hydrated-meal", label: "Água junto da refeição", icon: GlassWater, done: false },
      { id: "slow-bites", label: "Coma sem pressa em uma refeição", icon: HeartPulse, done: false },
    ],
  },
  {
    id: "steady-energy",
    title: "Energia estável",
    description: "Evite longos períodos sem comer e cuide do básico.",
    items: [
      { id: "no-skip", label: "Não pular uma refeição importante", icon: CheckCircle2, done: true },
      { id: "planned-snack", label: "Planejar um lanche simples", icon: Apple, done: false },
      { id: "protein-choice", label: "Adicionar uma fonte de proteína", icon: BicepsFlexed, done: false },
      { id: "pause-check", label: "Perceber fome e saciedade", icon: HeartPulse, done: false },
    ],
  },
  {
    id: "light-recovery",
    title: "Dia leve de nutrição",
    description: "Um checklist curto para dias corridos ou de retomada.",
    items: [
      { id: "water-first", label: "Começar com um copo de água", icon: GlassWater, done: true },
      { id: "simple-meal", label: "Fazer uma refeição simples e completa", icon: Salad, done: false },
      { id: "kind-choice", label: "Escolher sem culpa ou compensação", icon: HeartPulse, done: false },
    ],
  },
  {
    id: "home-plate",
    title: "Prato caseiro",
    description: "Priorize comida de verdade quando couber na rotina.",
    items: [
      { id: "home-meal", label: "Uma refeição caseira ou planejada", icon: Salad, done: false },
      { id: "fiber", label: "Adicionar fibra: fruta, legume ou grão", icon: Apple, done: true },
      { id: "protein-home", label: "Incluir proteína no prato", icon: BicepsFlexed, done: false },
      { id: "calm-table", label: "Sentar para comer com calma", icon: HeartPulse, done: false },
    ],
  },
];

export function getTodaysNutritionPlan(date = new Date()) {
  const daySeed = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000);
  return dailyNutritionPlans[daySeed % dailyNutritionPlans.length];
}

export const avatarStages = [
  {
    id: "pulse-spark",
    name: "Pulse Spark",
    levelRequired: 1,
    image: "/assets/pulse-companion.png",
    detail: "Primeira versão do companheiro, focada em criar rotina.",
    personality: "Gentil e simples",
    activeBenefit: "Celebra pequenas ações sem cobrar perfeição.",
    perks: ["Boas-vindas guiadas", "Missões iniciais", "Lembretes gentis"],
  },
  {
    id: "pulse-core",
    name: "Pulse Core",
    levelRequired: 5,
    image: "/assets/pulse-companion.png",
    detail: "Ganha mais energia visual quando a consistência aparece.",
    personality: "Mais atento ao ritmo",
    activeBenefit: "Destaca o caminho mais curto para manter o dia ativo.",
    perks: ["Sugestão de missão fácil", "Resumo do ritmo", "Modo retomada"],
  },
  {
    id: "pulse-neo",
    name: "Pulse Neo",
    levelRequired: 10,
    image: "/assets/pulse-evolved.png",
    detail: "Armadura, luzes e postura mais fortes para quem já criou ritmo.",
    personality: "Confiante, calmo e protetor",
    activeBenefit: "Ativa recomendações inteligentes para manter consistência sem exagero.",
    perks: ["Missão recomendada", "Modo leve inteligente", "Comemoração aprimorada"],
  },
  {
    id: "pulse-volt",
    name: "Pulse Volt",
    levelRequired: 15,
    image: "/assets/pulse-evolved.png",
    detail: "Upgrade futuro com acessórios de treino e efeitos de conquista.",
    personality: "Energético e estratégico",
    activeBenefit: "Ajuda a planejar a semana com treinos, água e recuperação.",
    perks: ["Plano semanal", "Efeitos de conquista", "Checklist adaptativo"],
  },
  {
    id: "pulse-prime",
    name: "Pulse Prime",
    levelRequired: 25,
    image: "/assets/pulse-evolved.png",
    detail: "Forma premium para ciclos longos de evolução saudável.",
    personality: "Mentor premium",
    activeBenefit: "Transforma ciclos longos em metas visuais e revisões de progresso.",
    perks: ["Revisão mensal", "Avatar premium", "Metas avançadas"],
  },
];

export function getCurrentAvatarStage(level = user.level) {
  return avatarStages.reduce((current, stage) => (level >= stage.levelRequired ? stage : current), avatarStages[0]);
}

export function getNextAvatarStage(level = user.level) {
  return avatarStages.find((stage) => stage.levelRequired > level);
}

export const weeklyActivity = [
  { day: "Qua", xp: 80, minutes: 22 },
  { day: "Qui", xp: 130, minutes: 35 },
  { day: "Sex", xp: 60, minutes: 18 },
  { day: "Sáb", xp: 170, minutes: 48 },
  { day: "Dom", xp: 45, minutes: 12 },
  { day: "Seg", xp: 120, minutes: 32 },
  { day: "Hoje", xp: 95, minutes: 26 },
];

export const progressData = [
  { week: "S1", consistency: 48, energy: 58 },
  { week: "S2", consistency: 62, energy: 61 },
  { week: "S3", consistency: 55, energy: 66 },
  { week: "S4", consistency: 72, energy: 70 },
  { week: "S5", consistency: 78, energy: 74 },
  { week: "S6", consistency: 84, energy: 80 },
];

export const achievements = [
  { title: "Primeiro passo", detail: "Concluiu a primeira missão", icon: Footprints, tone: "lime", unlocked: true },
  { title: "Sete dias", detail: "Manteve um ritmo por 7 dias", icon: Trophy, tone: "gold", unlocked: true },
  { title: "Gota a gota", detail: "Atingiu a meta de água 10 vezes", icon: GlassWater, tone: "cyan", unlocked: true },
  { title: "Força crescente", detail: "Completou 20 treinos", icon: Dumbbell, tone: "coral", unlocked: true },
  { title: "Ritmo gentil", detail: "Fez 5 dias de recuperação", icon: HeartPulse, tone: "green", unlocked: false },
  { title: "Nível 15", detail: "Alcance o nível Explorador", icon: Award, tone: "violet", unlocked: false },
];

export const leaderboard = [
  { rank: 1, name: "Ana L.", level: 18, xp: 12480, streak: 42, badge: "Pulse Volt" },
  { rank: 2, name: "Rafa M.", level: 17, xp: 11920, streak: 31, badge: "Pulse Volt" },
  { rank: 3, name: "Bia S.", level: 16, xp: 11240, streak: 28, badge: "Pulse Volt" },
  { rank: 4, name: "Caio R.", level: 14, xp: 9820, streak: 22, badge: "Pulse Neo" },
  { rank: 5, name: "Luna P.", level: 13, xp: 9340, streak: 19, badge: "Pulse Neo" },
  { rank: 6, name: "Theo A.", level: 12, xp: 8870, streak: 16, badge: "Pulse Neo" },
];

export const notifications = [
  { id: "achievement", title: "Nova conquista desbloqueada", detail: "Você ganhou o badge Sete dias.", time: "Há 18 min", icon: Trophy, unread: true },
  { id: "workout", title: "Treino pronto", detail: "Seu treino de corpo inteiro leva 28 minutos.", time: "Há 1 h", icon: Dumbbell, unread: true },
  { id: "water", title: "Pausa para água", detail: "Um copo agora já ajuda a manter o ritmo.", time: "Há 3 h", icon: GlassWater, unread: false },
  { id: "security", title: "Conta protegida", detail: "Seu último acesso foi reconhecido com segurança.", time: "Ontem", icon: ShieldCheck, unread: false },
];

export const activityOptions = [
  { id: "strength", label: "Força", icon: Dumbbell },
  { id: "cardio", label: "Cardio", icon: Bike },
  { id: "mobility", label: "Mobilidade", icon: HeartPulse },
  { id: "consistency", label: "Consistência", icon: Target },
];

export { CheckCircle2 };
