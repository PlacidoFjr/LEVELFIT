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
