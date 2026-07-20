"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  ArrowLeft,
  ArrowRight,
  Bell,
  BicepsFlexed,
  Camera,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Dumbbell,
  Flame,
  GlassWater,
  HeartPulse,
  Info,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  Medal,
  MoonStar,
  Pencil,
  Plus,
  Salad,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  UserRound,
  UsersRound,
  Utensils,
  Zap,
} from "lucide-react";
import { ApiClientError, clearSession, logoutUser, useAuthSession } from "@/lib/auth-client";
import {
  addFoodLog,
  addMeasurement,
  addWaterLog,
  completeMission,
  createProgressPhotoMetadata,
  finishWorkoutSession,
  formatExerciseTarget,
  getHydrationToday,
  getNotificationPreferences,
  getNutritionGoal,
  getNutritionToday,
  getTodayWorkout,
  getWorkoutFromToday,
  isWorkoutSession,
  listMissions,
  listAchievements,
  listProfessionalConnections,
  listMeasurements,
  listNotifications,
  listRanking,
  listSecurityEvents,
  listWorkouts,
  listWorkoutSessions,
  logoutAllDevices,
  markAllNotificationsRead,
  markNotificationRead,
  requestDataExport,
  startWorkoutSession,
  subscribePush,
  timeValue,
  updateHydrationGoal,
  updateNotificationPreferences,
  updateNutritionGoal,
  updateMe,
  unsubscribePush,
  type Achievement,
  type BodyMeasurement,
  type HydrationToday,
  type NotificationItem,
  type NotificationPreferences,
  type NutritionGoal,
  type NutritionToday,
  type ProfessionalConnection,
  type RankingEntry,
  type TodayWorkout,
  type UserMission,
  type Workout,
  type WorkoutSession,
} from "@/lib/level-fit-api";
import { avatarStages, getCurrentAvatarStage, getNextAvatarStage, user as fallbackUser } from "@/lib/mock-data";
import { getUserProgress } from "@/lib/user-progress";
import { PageHeader } from "./page-header";
import { PulseAvatar } from "./pulse-avatar";
import { ProgressRing } from "./progress-ring";

function Screen({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-6 lg:px-8 lg:py-7"><PageHeader title={title} description={description} action={action} />{children}</div>;
}

function Pill({ children, tone = "lime" }: { children: React.ReactNode; tone?: "lime" | "cyan" | "coral" | "green" | "gold" | "violet" }) {
  const colors = { lime: "var(--lime)", cyan: "var(--cyan)", coral: "var(--coral)", green: "var(--green)", gold: "var(--gold)", violet: "var(--violet)" };
  return <span className="inline-flex min-h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-black" style={{ color: colors[tone], background: `color-mix(in srgb, ${colors[tone]} 12%, transparent)` }}>{children}</span>;
}

function Notice({ message, tone = "lime" }: { message: string | null; tone?: "lime" | "danger" }) {
  if (!message) return null;
  const color = tone === "danger" ? "var(--danger)" : "var(--lime)";
  return <div className="mb-4 border-l-2 bg-[rgba(183,255,42,0.06)] p-3 text-sm font-bold text-white" style={{ borderColor: color }}>{message}</div>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return <div className="app-card grid min-h-[220px] place-items-center p-6 text-center"><div><Icon className="mx-auto text-[var(--text-dim)]" size={32} /><h2 className="mt-4 font-black text-white">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">{detail}</p></div></div>;
}

function LoadingCard() {
  return <div className="app-card grid min-h-[240px] place-items-center p-6 text-sm font-bold text-[var(--text-muted)]">Carregando dados seguros...</div>;
}

function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) return error.message;
  return "Não foi possível concluir agora. Tente novamente.";
}

const missionIcon: Record<string, LucideIcon> = {
  workout: Dumbbell,
  water: GlassWater,
  nutrition: Salad,
  habit: HeartPulse,
  progress: TrendingUp,
  recovery: MoonStar,
};

const missionTone: Record<string, "lime" | "cyan" | "coral" | "green" | "violet"> = {
  workout: "coral",
  water: "cyan",
  nutrition: "green",
  habit: "lime",
  progress: "lime",
  recovery: "violet",
};

export function MissionsLivePage() {
  const [items, setItems] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await listMissions());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  async function markDone(id: string) {
    setError(null);
    const previous = items;
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: "completed", completedAt: new Date().toISOString() } : item));
    try {
      const result = await completeMission(id);
      setItems((current) => current.map((item) => item.id === id ? { ...item, ...result.mission, dailyMission: item.dailyMission } : item));
      setNotice(result.xpAwarded ? `Missão concluída. +${result.xpAwarded} XP salvos.` : "Missão já estava concluída.");
    } catch (err) {
      setItems(previous);
      setError(errorMessage(err));
    }
  }

  async function chooseLightMode() {
    const light = items.find((item) => ["recovery", "habit"].includes(item.dailyMission.type) && item.status === "pending");
    if (!light) {
      setNotice("Modo leve já está em dia. Voltar com calma também conta.");
      return;
    }
    await markDone(light.id);
  }

  const completed = items.filter((item) => item.status === "completed");
  const xpAvailable = items.filter((item) => item.status !== "completed").reduce((sum, item) => sum + item.dailyMission.xpReward, 0);

  return <Screen title="Missões do dia" description="O app salva suas ações reais, sem XP negativo e sem cobrança tóxica.">
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    {loading ? <LoadingCard /> : (
      <>
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="app-card p-5"><p className="eyebrow">Concluídas</p><p className="mt-2 text-xl font-black text-white">{completed.length} de {items.length}</p><p className="mt-1 text-xs text-[var(--text-muted)]">Seu dia não precisa ser perfeito.</p></div>
          <div className="app-card p-5"><p className="eyebrow">XP restante</p><p className="mt-2 text-xl font-black text-white">{xpAvailable} XP</p><p className="mt-1 text-xs text-[var(--text-muted)]">Sem punição por pausa.</p></div>
          <div className="app-card p-5"><p className="eyebrow">Ritmo leve</p><p className="mt-2 text-xl font-black text-white">Disponível</p><p className="mt-1 text-xs text-[var(--text-muted)]">Uma ação pequena ainda vale.</p></div>
        </div>
        <section className="app-card p-4 sm:p-5">
          <div className="divide-y divide-[var(--border)]">
            {items.map((mission, index) => {
              const Icon = missionIcon[mission.dailyMission.type] ?? CheckCircle2;
              const done = mission.status === "completed";
              return <motion.div key={mission.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-[var(--surface-soft)] text-[var(--lime)]"><Icon size={23} /></span>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className={`font-black ${done ? "text-[var(--text-dim)] line-through" : "text-white"}`}>{mission.dailyMission.title}</h2><Pill tone={missionTone[mission.dailyMission.type] ?? "lime"}>+{mission.dailyMission.xpReward} XP</Pill></div><p className="mt-1.5 text-sm text-[var(--text-muted)]">{mission.dailyMission.description}</p></div>
                <button onClick={() => markDone(mission.id)} disabled={done} className={done ? "secondary-button border-[rgba(183,255,42,0.3)] text-[var(--lime)] disabled:opacity-80" : "primary-button"}>{done ? <><Check size={18} /> Concluída</> : <>Concluir <ArrowRight size={18} /></>}</button>
              </motion.div>;
            })}
          </div>
        </section>
        <section className="mt-4 flex flex-col gap-4 border-l-2 border-[var(--violet)] bg-[rgba(167,139,250,0.06)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-black text-white">Hoje ficou pesado?</p><p className="mt-1 text-sm text-[var(--text-muted)]">O modo leve conclui uma missão de recuperação ou hábito, quando disponível.</p></div>
          <button onClick={chooseLightMode} className="secondary-button shrink-0"><MoonStar size={18} /> Escolher modo leve</button>
        </section>
      </>
    )}
  </Screen>;
}

function difficultyLabel(value: Workout["difficulty"]) {
  return ({ easy: "leve", medium: "moderado", hard: "intenso" } as const)[value];
}

function categoryLabel(value: Workout["category"]) {
  return ({ strength: "força", cardio: "cardio", mobility: "mobilidade", full_body: "corpo inteiro", recovery: "recuperação" } as const)[value];
}

type WorkoutFocusId = "all" | "glutes_legs" | "push" | "pull" | "core" | "full_body" | "low_impact";
type WorkoutDifficultyFilter = "all" | Workout["difficulty"];

const workoutFocuses: Array<{ id: WorkoutFocusId; label: string; detail: string }> = [
  { id: "all", label: "Todos", detail: "Biblioteca completa" },
  { id: "glutes_legs", label: "Glúteos e pernas", detail: "Inferiores, quadríceps e posterior" },
  { id: "push", label: "Peito, ombros e tríceps", detail: "Empurrar e força de tronco" },
  { id: "pull", label: "Costas e bíceps", detail: "Puxar, postura e dorsais" },
  { id: "core", label: "Core e estabilidade", detail: "Abdome, lombar e controle" },
  { id: "full_body", label: "Corpo todo", detail: "Treino equilibrado" },
  { id: "low_impact", label: "Baixo impacto", detail: "Sem saltos ou corrida" },
];

const workoutDifficulties: Array<{ id: WorkoutDifficultyFilter; label: string; detail: string }> = [
  { id: "all", label: "Qualquer intensidade", detail: "Mostra todos os níveis" },
  { id: "easy", label: "Leve / iniciante", detail: "Melhor para começar ou retomar" },
  { id: "medium", label: "Moderado", detail: "Boa base e controle" },
  { id: "hard", label: "Intenso", detail: "Mais volume e experiência" },
];

function WorkoutChoicePicker({
  focus,
  intensity,
  onFocusChange,
  onIntensityChange,
}: {
  focus: WorkoutFocusId;
  intensity: WorkoutDifficultyFilter;
  onFocusChange: (value: WorkoutFocusId) => void;
  onIntensityChange: (value: WorkoutDifficultyFilter) => void;
}) {
  return (
    <>
      <div className="mt-4 grid gap-3 sm:hidden">
        <label className="block">
          <span className="text-xs font-black uppercase text-[var(--text-muted)]">Foco do treino</span>
          <select className="field mt-2 h-14 text-base font-black" value={focus} onChange={(event) => onFocusChange(event.target.value as WorkoutFocusId)}>
            {workoutFocuses.map((item) => <option key={item.id} value={item.id}>{item.label} - {item.detail}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase text-[var(--text-muted)]">Intensidade</span>
          <select className="field mt-2 h-14 text-base font-black" value={intensity} onChange={(event) => onIntensityChange(event.target.value as WorkoutDifficultyFilter)}>
            {workoutDifficulties.map((item) => <option key={item.id} value={item.id}>{item.label} - {item.detail}</option>)}
          </select>
        </label>
        <p className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold leading-5 text-[var(--text-muted)]">No iPhone, toque no campo para abrir o seletor rolável nativo.</p>
      </div>
      <div className="mt-4 hidden gap-2 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        {workoutFocuses.map((item) => <button key={item.id} type="button" onClick={() => onFocusChange(item.id)} className={`min-h-[74px] rounded-[8px] border px-3 py-3 text-left transition-colors ${focus === item.id ? "border-[var(--lime)] bg-[rgba(183,255,42,0.1)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"}`}>
          <span className={`block text-sm font-black ${focus === item.id ? "text-[var(--lime)]" : "text-white"}`}>{item.label}</span>
          <span className="mt-1 block text-xs font-bold leading-4 text-[var(--text-muted)]">{item.detail}</span>
        </button>)}
      </div>
      <div className="mt-3 hidden gap-2 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        {workoutDifficulties.map((item) => <button key={item.id} type="button" onClick={() => onIntensityChange(item.id)} className={`min-h-[68px] rounded-[8px] border px-3 py-3 text-left transition-colors ${intensity === item.id ? "border-[var(--coral)] bg-[rgba(255,107,61,0.1)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"}`}>
          <span className={`block text-sm font-black ${intensity === item.id ? "text-[var(--coral)]" : "text-white"}`}>{item.label}</span>
          <span className="mt-1 block text-xs font-bold leading-4 text-[var(--text-muted)]">{item.detail}</span>
        </button>)}
      </div>
    </>
  );
}

function searchable(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function countMatches(value: string, pattern: RegExp) {
  return (value.match(pattern) ?? []).length;
}

function workoutMatchesFocus(workout: Workout, focus: WorkoutFocusId) {
  if (focus === "all") return true;
  const titleText = searchable(`${workout.title} ${workout.description ?? ""} ${workout.category}`);
  const exerciseText = searchable(workout.exercises.map((item) => `${item.exercise.name} ${item.exercise.muscleGroup}`).join(" "));
  const lowerScore = countMatches(exerciseText, /glute|perna|quadriceps|posterior|panturrilha|adutor|abdutor|agachamento|leg press|afundo|stiff|terra|hip thrust|rdl|bulgaro|flexora|extensora|hack squat/g);
  const pushScore = countMatches(exerciseText, /peito|ombro|triceps|delt|supino|desenvolvimento|paralela|flexao|chest press|shoulder press|landmine press|elevacao lateral/g);
  const pullScore = countMatches(exerciseText, /costas|dorsal|biceps|remada|puxada|barra|pulldown|face pull|rosca/g);
  const coreScore = countMatches(exerciseText, /abdome|abdominal|core|prancha|lombar|estabilidade|anti rotacao|pallof|dead bug|bird dog|crunch/g);
  const upperScore = pushScore + pullScore;
  if (focus === "glutes_legs") return lowerScore >= 3 && lowerScore >= upperScore && !titleText.includes("foco tronco");
  if (focus === "push") return /sessao push|(^|\s)push(\s|$)/.test(titleText) || (pushScore >= 4 && pushScore >= pullScore + 3 && !titleText.includes("upper") && !titleText.includes("full body") && !titleText.includes("foco gluteos e pernas"));
  if (focus === "pull") return /sessao pull|(^|\s)pull(\s|$)/.test(titleText) || (pullScore >= 4 && pullScore >= pushScore + 3 && !titleText.includes("upper") && !titleText.includes("full body") && !titleText.includes("foco gluteos e pernas"));
  if (focus === "core") return coreScore >= 1 || titleText.includes("core");
  if (focus === "full_body") return workout.category === "full_body" || titleText.includes("corpo todo");
  const allText = `${titleText} ${exerciseText}`;
  return workout.difficulty === "easy" || allText.includes("baixo impacto") || allText.includes("sem saltos") || allText.includes("sem corrida");
}

export function WorkoutsLivePage() {
  const router = useRouter();
  const [today, setToday] = useState<TodayWorkout>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<WorkoutFocusId>("all");
  const [intensity, setIntensity] = useState<WorkoutDifficultyFilter>("all");
  const [showPlanSettings, setShowPlanSettings] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [runConnection, setRunConnection] = useState<ProfessionalConnection | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [todayResult, listResult, connectionResult] = await Promise.allSettled([getTodayWorkout(), listWorkouts(), listProfessionalConnections()]);

      if (todayResult.status === "fulfilled") {
        setToday(todayResult.value);
      } else {
        setToday(null);
        setError(errorMessage(todayResult.reason));
      }

      if (listResult.status === "fulfilled") {
        setWorkouts(listResult.value.data);
      } else {
        setWorkouts([]);
        setError(errorMessage(listResult.reason));
      }

      if (connectionResult.status === "fulfilled") {
        setRunConnection(connectionResult.value.data.find((item) => item.kind === "run" && item.status === "active") ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  async function start(workoutId: string) {
    setBusyId(workoutId);
    setError(null);
    try {
      await startWorkoutSession(workoutId);
      router.push("/workouts/session");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "SESSION_ALREADY_STARTED") {
        router.push("/workouts/session");
        return;
      }
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const focusedWorkouts = workouts.filter((item) => workoutMatchesFocus(item, focus));
  const configuredWorkouts = focusedWorkouts.filter((item) => intensity === "all" || item.difficulty === intensity);
  const suggestedWorkouts = configuredWorkouts.length > 0 ? configuredWorkouts : focusedWorkouts;
  const todayWorkout = getWorkoutFromToday(today);
  const selectedWorkout = selectedWorkoutId ? suggestedWorkouts.find((item) => item.id === selectedWorkoutId) : null;
  const workout = selectedWorkout ?? (focus === "all" && intensity === "all" ? todayWorkout : null) ?? suggestedWorkouts[0] ?? todayWorkout ?? workouts[0] ?? null;
  const activeSessionForWorkout = isWorkoutSession(today) && today.workoutId === workout?.id;
  const options = suggestedWorkouts.filter((item) => item.id !== workout?.id).slice(0, 3);

  return <Screen title="Treino do dia" description="Um plano curto, ajustável e com espaço para descanso." action={<Link href="/settings/notifications" className="secondary-button"><CalendarClock size={18} /> Agenda</Link>}>
    <Notice message={error} tone="danger" />
    {runConnection && <section className="app-card mb-4 border-[rgba(255,107,61,0.28)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--coral)]">Run Pro conectado</p>
          <h2 className="mt-2 text-lg font-black text-white">{runConnection.planTitle}</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{runConnection.professionalName} acompanha apenas os dados autorizados por você.</p>
        </div>
        <Link href="/my-plan" className="secondary-button"><ShieldCheck size={18} /> Ver plano</Link>
      </div>
    </section>}
    {!loading && workouts.length > 0 && showPlanSettings && <section id="workout-plan-settings" className="mb-4 app-card p-4 sm:p-5" aria-label="Ajustes do plano de treino">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--coral)]">Ajuste do plano</p>
          <h2 className="mt-2 text-lg font-black text-white">Escolha foco e intensidade</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-muted)]">Para começar, use baixo impacto com intensidade leve. O LevelFit prioriza técnica, descanso e progressão sem cobrança tóxica.</p>
        </div>
        <Pill tone="cyan">{configuredWorkouts.length || focusedWorkouts.length} opções</Pill>
      </div>
      <WorkoutChoicePicker focus={focus} intensity={intensity} onFocusChange={(value) => { setFocus(value); setSelectedWorkoutId(null); }} onIntensityChange={(value) => { setIntensity(value); setSelectedWorkoutId(null); }} />
      {configuredWorkouts.length === 0 && focusedWorkouts.length > 0 && <p className="mt-3 rounded-[8px] border border-[var(--border)] bg-[rgba(255,214,10,0.06)] px-3 py-2 text-xs font-bold text-[var(--gold)]">Não encontrei esse foco nessa intensidade. Mostrando a opção mais próxima para você não ficar travado.</p>}
    </section>}
    {loading ? <LoadingCard /> : !workout ? <section className="app-card grid min-h-[240px] place-items-center p-6 text-center"><div><Dumbbell className="mx-auto text-[var(--text-dim)]" size={32} /><h2 className="mt-4 font-black text-white">Nenhum treino disponível</h2><p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">{error ? "Não conseguimos carregar sua biblioteca de treinos agora." : "A biblioteca de treinos ainda não foi carregada."}</p><button onClick={() => void load()} className="secondary-button mx-auto mt-5">Tentar novamente</button></div></section> : (
      <>
        <section className="app-card overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap gap-2"><Pill tone="coral"><Dumbbell size={14} /> {categoryLabel(workout.category).toUpperCase()}</Pill><Pill>{difficultyLabel(workout.difficulty).toUpperCase()}</Pill>{activeSessionForWorkout && <Pill tone="gold">{today.status === "in_progress" ? "EM ANDAMENTO" : today.status.toUpperCase()}</Pill>}</div>
              <h2 className="mt-5 text-2xl font-black text-white">{workout.title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">{workout.description ?? "Movimentos adaptáveis. Pare se sentir dor e reduza a intensidade quando necessário."}</p>
              <div className="mt-5 flex flex-wrap gap-5 text-sm font-bold text-[var(--text-muted)]"><span className="inline-flex items-center gap-2"><Clock3 size={18} /> {workout.estimatedMinutes} minutos</span><span className="inline-flex items-center gap-2"><Activity size={18} /> {workout.exercises.length} exercícios</span><span className="inline-flex items-center gap-2"><Zap size={18} /> 60 XP</span></div>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row"><button onClick={() => start(workout.id)} disabled={busyId === workout.id} className="primary-button bg-[var(--coral)] text-white disabled:opacity-60">{activeSessionForWorkout ? "Continuar treino" : "Começar treino"} <ArrowRight size={18} /></button><button type="button" onClick={() => { setShowPlanSettings((value) => !value); window.setTimeout(() => document.getElementById("workout-plan-settings")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} className="secondary-button"><SlidersHorizontal size={18} /> {showPlanSettings ? "Fechar ajuste" : "Ajustar plano"}</button></div>
            </div>
            <div className="border-t border-[var(--border)] bg-[var(--surface-elevated)] p-5 lg:border-l lg:border-t-0"><p className="eyebrow mb-3">Sequência do treino</p><div className="divide-y divide-[var(--border)]">{workout.exercises.map((exercise, index) => <div key={exercise.id} className="flex min-h-[64px] items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-[var(--surface-soft)] text-[var(--coral)]"><BicepsFlexed size={17} /></span><span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{exercise.exercise.name}</span><span className="text-xs font-bold text-[var(--text-muted)]">{formatExerciseTarget(exercise)}</span><span className="text-xs text-[var(--text-dim)]">{index + 1}</span></div>)}</div></div>
          </div>
        </section>
        {options.length > 0 && <>
          <div className="mb-3 mt-7 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-black text-white">Mais treinos desse foco</h2><p className="mt-1 text-xs font-bold text-[var(--text-muted)]">Toque para trocar a prévia antes de começar.</p></div></div>
          <div className="grid gap-4 md:grid-cols-3">
            {options.map((item) => <button key={item.id} type="button" onClick={() => setSelectedWorkoutId(item.id)} className="app-card flex min-h-[112px] items-center gap-4 p-4 text-left transition-transform hover:-translate-y-0.5"><span className="grid size-11 place-items-center rounded-[7px] bg-[rgba(34,211,238,0.12)] text-[var(--cyan)]"><Activity size={22} /></span><span className="flex-1"><strong className="block text-sm text-white">{item.title}</strong><span className="mt-1 block text-xs text-[var(--text-muted)]">{item.estimatedMinutes} min · {difficultyLabel(item.difficulty)}</span></span><ChevronRight size={18} className="text-[var(--text-dim)]" /></button>)}
          </div>
        </>}
      </>
    )}
  </Screen>;
}

export function WorkoutSessionLivePage() {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const today = await getTodayWorkout();
        let nextSession: WorkoutSession;
        if (isWorkoutSession(today)) nextSession = today;
        else {
          const workout = getWorkoutFromToday(today);
          if (!workout) throw new Error("NO_WORKOUT");
          nextSession = await startWorkoutSession(workout.id);
        }
        if (active) {
          setSession(nextSession);
          setDone(nextSession.exercises.filter((item) => item.status === "completed").map((item) => item.exerciseId));
        }
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => { if (!started) return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [started]);

  async function finish() {
    if (!session) return;
    if (!session.exercises.length) {
      setError("Esta sessão não tem exercícios. Volte para Treinos e escolha um novo plano.");
      return;
    }
    setStarted(false);
    setError(null);
    try {
      const completedExercises = session.exercises.map((item) => ({ ...item, setsCompleted: item.setsCompleted || 1 }));
      const updated = await finishWorkoutSession(session.id, completedExercises, 5);
      setSession(updated);
      setDone(updated.exercises.map((item) => item.exerciseId));
      setNotice(`Treino concluído e salvo. +${updated.xpAwarded} XP.`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const exercises = session?.exercises ?? [];
  const current = exercises.find((item) => !done.includes(item.exerciseId));
  const minutesLabel = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return <Screen title="Sessão de treino" description="Siga no seu ritmo. Você pode pausar, adaptar ou encerrar a qualquer momento." action={<Link href="/workouts" className="secondary-button"><ArrowLeft size={18} /> Sair</Link>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    {loading ? <LoadingCard /> : !session ? <EmptyState icon={Dumbbell} title="Treino indisponível" detail="Não foi possível iniciar uma sessão agora." /> : !exercises.length ? <EmptyState icon={Dumbbell} title="Sessão sem exercícios" detail="Essa sessão antiga não tem movimentos cadastrados. Volte para Treinos e comece um novo plano." /> : (
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="app-card flex min-h-[520px] flex-col items-center justify-center p-6 text-center">
          <Pill tone="coral">EXERCÍCIO {Math.min(done.length + 1, exercises.length)} DE {exercises.length}</Pill>
          <span className="mt-8 grid size-20 place-items-center rounded-[8px] bg-[rgba(255,107,61,0.12)] text-[var(--coral)]"><BicepsFlexed size={40} /></span>
          <h2 className="mt-6 text-2xl font-black text-white">{current?.exercise.name ?? "Treino concluído"}</h2>
          <p className="mt-2 text-[var(--text-muted)]">{current ? formatExerciseTarget(current) : "Todos os movimentos foram registrados."}</p>
          {current && <div className="mt-5 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
            <div className="subtle-card p-4"><p className="eyebrow text-[var(--coral)]">Como executar</p><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{current.exercise.instructions ?? "Faça em ritmo confortável, mantendo postura e respiração controladas."}</p></div>
            <div className="subtle-card p-4"><p className="eyebrow text-[var(--lime)]">Segurança</p><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{current.exercise.safetyNotes ?? "Pare se sentir dor aguda e ajuste carga, amplitude ou descanso."}</p></div>
          </div>}
          <div className="mt-8 font-mono text-5xl font-black text-white" aria-label={`Tempo ${minutesLabel}`}>{minutesLabel}</div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <button onClick={() => setStarted((value) => !value)} className="secondary-button"><Timer size={18} /> {started ? "Pausar" : seconds ? "Continuar" : "Iniciar"}</button>
            {current ? <button onClick={() => { setDone((items) => [...items, current.exerciseId]); setSeconds(0); setStarted(false); }} className="primary-button bg-[var(--coral)] text-white"><Check size={18} /> Concluir bloco</button> : <button onClick={finish} className="primary-button bg-[var(--coral)] text-white"><Check size={18} /> Salvar treino</button>}
          </div>
          <p className="mt-6 max-w-md text-xs leading-5 text-[var(--text-dim)]">Movimento controlado e respiração confortável. Dor aguda não faz parte do treino.</p>
        </section>
        <aside className="app-card p-5"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Progresso</p><p className="mt-2 font-black text-white">{done.length} de {exercises.length}</p></div><ProgressRing value={Math.round((done.length / Math.max(1, exercises.length)) * 100)} size={76} stroke={7} color="var(--coral)" label="Progresso do treino" /></div><div className="divide-y divide-[var(--border)]">{exercises.map((exercise) => <div key={exercise.id} className="flex min-h-[72px] items-center gap-3"><span className={`grid size-7 place-items-center rounded-[5px] border ${done.includes(exercise.exerciseId) ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--lime-ink)]" : current?.exerciseId === exercise.exerciseId ? "border-[var(--coral)] text-[var(--coral)]" : "border-[var(--border)] text-[var(--text-dim)]"}`}>{done.includes(exercise.exerciseId) ? <Check size={15} strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{exercise.exercise.name}</p><p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{formatExerciseTarget(exercise)} · {exercise.exercise.muscleGroup}{exercise.exercise.equipment ? ` · ${exercise.exercise.equipment}` : ""}</p></div></div>)}</div></aside>
      </div>
    )}
  </Screen>;
}

const checklist = [
  { id: "hasProtein", label: "Fonte de proteína", icon: BicepsFlexed },
  { id: "hasFruitOrVegetable", label: "Fruta, vegetal ou legume", icon: Apple },
  { id: "avoidedSkippingMeal", label: "Não pulei refeição importante", icon: Utensils },
  { id: "mindfulChoice", label: "Comi com atenção", icon: HeartPulse },
] as const;

type FoodLogInput = {
  description?: string;
  hasProtein?: boolean;
  hasFruitOrVegetable?: boolean;
  avoidedSkippingMeal?: boolean;
  mindfulChoice?: boolean;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

export function NutritionLivePage() {
  const [data, setData] = useState<NutritionToday | null>(null);
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [todayData, goalData] = await Promise.all([getNutritionToday(), getNutritionGoal()]);
      setData(todayData);
      setGoal(goalData);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  function optionalFormNumber(form: FormData, key: string) {
    const raw = String(form.get(key) ?? "").trim();
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  }

  async function saveFood(extra?: FoodLogInput) {
    if (saving) return;
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      const result = await addFoodLog({ description: description || extra?.description || "Checklist alimentar", ...extra });
      setNotice(result.xpAwarded ? `Registro salvo. +${result.xpAwarded} XP.` : "Registro salvo.");
      setDescription("");
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitFood(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await saveFood({
      description: String(form.get("description") ?? "").trim() || "Refeição registrada",
      hasProtein: form.get("hasProtein") === "on",
      hasFruitOrVegetable: form.get("hasFruitOrVegetable") === "on",
      avoidedSkippingMeal: form.get("avoidedSkippingMeal") === "on",
      mindfulChoice: form.get("mindfulChoice") === "on",
      calories: optionalFormNumber(form, "calories"),
      proteinG: optionalFormNumber(form, "proteinG"),
      carbsG: optionalFormNumber(form, "carbsG"),
      fatG: optionalFormNumber(form, "fatG"),
    });
    event.currentTarget.reset();
  }

  async function submitGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      const saved = await updateNutritionGoal({
        dailyCalories: optionalFormNumber(form, "dailyCalories"),
        proteinG: optionalFormNumber(form, "proteinG"),
        carbsG: optionalFormNumber(form, "carbsG"),
        fatG: optionalFormNumber(form, "fatG"),
        checklistGoalCount: optionalFormNumber(form, "checklistGoalCount"),
      });
      setGoal(saved);
      setShowGoal(false);
      setNotice("Metas alimentares salvas.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const logs = data?.data ?? [];
  const doneChecks = new Set<string>();
  logs.forEach((item) => {
    if (item.hasProtein) doneChecks.add("hasProtein");
    if (item.hasFruitOrVegetable) doneChecks.add("hasFruitOrVegetable");
    if (item.avoidedSkippingMeal) doneChecks.add("avoidedSkippingMeal");
    if (item.mindfulChoice) doneChecks.add("mindfulChoice");
  });
  const targetChecks = goal?.checklistGoalCount ?? 3;
  const checkPercent = Math.min(100, Math.round((doneChecks.size / Math.max(1, targetChecks)) * 100));

  return <Screen title="Alimentação" description="Registre refeições sem transformar comida em prêmio ou culpa." action={<div className="flex flex-wrap gap-2"><button onClick={() => setShowGoal(true)} disabled={saving} className="secondary-button disabled:opacity-60"><Target size={18} /> Editar metas</button><button onClick={() => setShowAdd(true)} disabled={saving} className="primary-button disabled:opacity-60"><Plus size={18} /> Registrar refeição</button></div>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    {showGoal && <form onSubmit={submitGoal} className="app-card mb-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[var(--green)]">Metas flexíveis</p><h2 className="mt-2 text-lg font-black text-white">Ajuste sem dieta extrema</h2><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Use só o que fizer sentido. Checklist é mais importante que número perfeito.</p></div><button type="button" onClick={() => setShowGoal(false)} className="ghost-button">Fechar</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label className="text-xs font-bold text-[var(--text-muted)]">Calorias opcionais<input className="field mt-2" name="dailyCalories" type="number" min={800} max={10000} defaultValue={goal?.dailyCalories ?? ""} placeholder="Ex: 2200" /></label><label className="text-xs font-bold text-[var(--text-muted)]">Proteína g<input className="field mt-2" name="proteinG" type="number" min={0} max={1000} step="0.1" defaultValue={goal?.proteinG ? Number(goal.proteinG) : ""} placeholder="Opcional" /></label><label className="text-xs font-bold text-[var(--text-muted)]">Carboidratos g<input className="field mt-2" name="carbsG" type="number" min={0} max={2000} step="0.1" defaultValue={goal?.carbsG ? Number(goal.carbsG) : ""} placeholder="Opcional" /></label><label className="text-xs font-bold text-[var(--text-muted)]">Gorduras g<input className="field mt-2" name="fatG" type="number" min={0} max={1000} step="0.1" defaultValue={goal?.fatG ? Number(goal.fatG) : ""} placeholder="Opcional" /></label><label className="text-xs font-bold text-[var(--text-muted)]">Itens do checklist<input className="field mt-2" name="checklistGoalCount" type="number" min={1} max={4} defaultValue={targetChecks} /></label></div><button disabled={saving} className="primary-button mt-4 bg-[var(--green)] text-[#052313] disabled:opacity-60">{saving ? "Salvando..." : "Salvar metas"}</button></form>}
    {showAdd && <form onSubmit={submitFood} className="app-card mb-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[var(--green)]">Nova refeição</p><h2 className="mt-2 text-lg font-black text-white">O que você quer registrar?</h2></div><button type="button" onClick={() => setShowAdd(false)} className="ghost-button">Fechar</button></div><textarea className="field mt-4 min-h-24 py-3" name="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex: almoço com arroz, feijão, frango e salada" /><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{checklist.map((item) => <label key={item.id} className="flex min-h-12 items-center gap-3 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold text-white"><input type="checkbox" name={item.id} className="size-4 accent-[var(--green)]" /> {item.label}</label>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input className="field" name="calories" type="number" min={0} max={10000} placeholder="Calorias opcional" /><input className="field" name="proteinG" type="number" min={0} max={1000} step="0.1" placeholder="Proteína g" /><input className="field" name="carbsG" type="number" min={0} max={2000} step="0.1" placeholder="Carboidratos g" /><input className="field" name="fatG" type="number" min={0} max={1000} step="0.1" placeholder="Gorduras g" /></div><button disabled={saving} className="primary-button mt-4 bg-[var(--green)] text-[#052313] disabled:opacity-60">{saving ? "Salvando..." : "Salvar refeição"}</button></form>}
    {loading ? <LoadingCard /> : (
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <section className="app-card p-5"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow text-[var(--green)]">Checklist de hoje</p><h2 className="mt-2 text-lg font-black text-white">Escolhas que sustentam energia</h2><p className="mt-1 max-w-md text-xs leading-5 text-[var(--text-muted)]">{doneChecks.size} de {targetChecks} itens para concluir sua meta flexível.</p></div><ProgressRing value={checkPercent} size={82} stroke={7} color="var(--green)" label="Checklist alimentar" /></div><div className="divide-y divide-[var(--border)]">{checklist.map((item) => { const Icon = item.icon; const done = doneChecks.has(item.id); return <button key={item.id} onClick={() => !done && saveFood({ [item.id]: true } as FoodLogInput)} disabled={done || saving} className="flex min-h-[72px] w-full items-center gap-3 text-left disabled:cursor-default disabled:opacity-70"><span className="grid size-10 place-items-center rounded-[7px] bg-[rgba(56,217,121,0.1)] text-[var(--green)]"><Icon size={20} /></span><span className={`flex-1 text-sm font-bold ${done ? "text-[var(--text-muted)]" : "text-white"}`}>{item.label}</span><span className={`grid size-8 place-items-center rounded-[6px] border ${done ? "border-[var(--green)] bg-[var(--green)] text-[#052313]" : "border-[var(--border-strong)] text-transparent"}`}><Check size={17} strokeWidth={3} /></span></button>; })}</div></section>
        <section className="app-card p-5"><p className="eyebrow">Refeições registradas</p><div className="mt-4 divide-y divide-[var(--border)]">{logs.length ? logs.map((item) => <div key={item.id} className="flex min-h-[84px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--green)]"><Utensils size={20} /></span><div className="min-w-0 flex-1"><p className="text-sm font-black text-white">{item.meal?.name ?? "Registro alimentar"}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{item.description || "Checklist salvo"}</p>{item.calories ? <p className="mt-1 text-xs font-bold text-[var(--green)]">{item.calories} kcal{item.proteinG ? ` · ${item.proteinG}g proteína` : ""}</p> : null}</div><span className="text-xs font-bold text-[var(--text-dim)]">{new Date(item.loggedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>) : <p className="py-8 text-sm text-[var(--text-muted)]">Nenhuma refeição registrada hoje.</p>}</div><div className="mt-4 border-l-2 border-[var(--green)] bg-[rgba(56,217,121,0.06)] p-4"><p className="text-sm font-bold text-white">Sem contagem obrigatória</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Calorias e macros continuam opcionais. O foco é regularidade e bem-estar.</p></div></section>
      </div>
    )}
  </Screen>;
}

export function HydrationLivePage() {
  const [data, setData] = useState<HydrationToday | null>(null);
  const [showGoal, setShowGoal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await getHydrationToday());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  async function add(amount: number) {
    setError(null);
    try {
      const result = await addWaterLog(amount);
      setNotice(result.xpAwarded ? `${amount} ml salvos. Meta concluída: +${result.xpAwarded} XP.` : `${amount} ml salvos.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function saveGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const goalMl = Number(form.get("dailyGoalMl"));
    if (!Number.isFinite(goalMl)) return;
    setError(null);
    try {
      setData(await updateHydrationGoal(goalMl));
      setShowGoal(false);
      setNotice("Meta de água atualizada.");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function addCustom() {
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount < 25) {
      setError("Informe pelo menos 25 ml.");
      return;
    }
    await add(amount);
    setCustomAmount("");
  }

  const consumed = data?.consumedMl ?? 0;
  const goal = data?.goalMl ?? 2000;
  const percent = data?.percentage ?? 0;

  return <Screen title="Hidratação" description="Pequenas pausas ao longo do dia, sem transformar a meta em obrigação." action={<div className="flex flex-wrap gap-2"><button onClick={() => setShowGoal(true)} className="secondary-button"><Target size={18} /> Editar meta</button><Link href="/settings/notifications" className="secondary-button"><Bell size={18} /> Lembretes</Link></div>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    {showGoal && <form onSubmit={saveGoal} className="app-card mb-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[var(--cyan)]">Meta diária</p><h2 className="mt-2 text-lg font-black text-white">Ajuste para sua rotina</h2><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Use uma referência confortável. A meta não deve substituir orientação profissional.</p></div><button type="button" onClick={() => setShowGoal(false)} className="ghost-button">Fechar</button></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><input className="field" name="dailyGoalMl" type="number" min={500} max={6000} step={50} defaultValue={goal} aria-label="Meta diária em ml" /><button className="primary-button">Salvar meta</button></div></form>}
    {loading ? <LoadingCard /> : (
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="app-card flex min-h-[360px] flex-col items-center justify-center p-6 text-center"><ProgressRing value={percent} size={164} stroke={13} color="var(--cyan)" label="Meta de hidratação" /><h2 className="mt-6 text-2xl font-black text-white">{consumed.toLocaleString("pt-BR")} <span className="text-base text-[var(--text-muted)]">/ {goal.toLocaleString("pt-BR")} ml</span></h2><p className="mt-2 text-sm text-[var(--text-muted)]">{percent >= 100 ? "Meta alcançada. Continue ouvindo seu corpo." : `Faltam ${Math.max(0, goal - consumed).toLocaleString("pt-BR")} ml, no seu ritmo.`}</p><div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2">{[250, 350, 500].map((amount) => <button key={amount} onClick={() => add(amount)} className="secondary-button px-2"><Plus size={16} /> {amount}</button>)}</div><div className="mt-3 flex w-full max-w-sm gap-2"><input className="field min-w-0" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} inputMode="numeric" placeholder="Outro valor ml" /><button onClick={addCustom} className="secondary-button shrink-0">Adicionar</button></div></section>
        <section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow text-[var(--cyan)]">Hoje</p><h2 className="mt-2 text-lg font-black text-white">Registros de água</h2></div><Pill tone="cyan"><GlassWater size={14} /> {data?.logs.length ?? 0} REGISTROS</Pill></div><div className="mt-5 divide-y divide-[var(--border)]">{data?.logs.length ? data.logs.map((item) => <div key={item.id} className="flex min-h-[68px] items-center gap-3"><span className="grid size-9 place-items-center rounded-[7px] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]"><GlassWater size={18} /></span><div className="flex-1"><p className="text-sm font-black text-white">{item.amountMl} ml</p><p className="mt-0.5 text-xs text-[var(--text-muted)]">Registro de água</p></div><span className="text-xs font-bold text-[var(--text-dim)]">{new Date(item.loggedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>) : <p className="py-8 text-sm text-[var(--text-muted)]">Nenhum copo registrado hoje.</p>}</div><div className="mt-5 bg-[var(--surface-elevated)] p-4"><div className="flex items-center gap-2 text-sm font-bold text-white"><Info size={17} className="text-[var(--cyan)]" /> Lembretes ficam nas preferências</div><p className="mt-1.5 text-xs text-[var(--text-muted)]">Respeitamos horário silencioso e opt-out.</p></div></section>
      </div>
    )}
  </Screen>;
}

function SettingsRow({ href, icon: Icon, title, detail, color = "var(--text-muted)" }: { href: string; icon: LucideIcon; title: string; detail: string; color?: string }) {
  return <Link href={href} className="flex min-h-[78px] items-center gap-4 border-b border-[var(--border)] py-3 last:border-0"><span className="grid size-10 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)]" style={{ color }}><Icon size={20} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-white">{title}</strong><span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{detail}</span></span><ChevronRight size={18} className="text-[var(--text-dim)]" /></Link>;
}

export function SettingsLivePage() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    await logoutUser();
    router.push("/login");
  }

  async function exportData() {
    setError(null);
    try {
      const result = await requestDataExport(false);
      setNotice(`Exportação solicitada. Protocolo: ${result.exportRequestId.slice(0, 8)}.`);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return <Screen title="Configurações" description="Controle sua conta, privacidade, metas e notificações.">
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
      <section className="app-card min-w-0 px-5">
        <SettingsRow href="/profile" icon={UserRound} title="Perfil e objetivos" detail="Nome, gênero opcional, avatar e ranking" />
        <SettingsRow href="/settings/security" icon={ShieldCheck} title="Segurança da conta" detail="Sessão atual, eventos e logout global" color="var(--cyan)" />
        <SettingsRow href="/settings/notifications" icon={Bell} title="Notificações" detail="E-mail, lembretes e horário silencioso" color="var(--gold)" />
      </section>
      <section className="app-card min-w-0 px-5">
        <SettingsRow href="/hydration" icon={GlassWater} title="Meta de água" detail="Editar meta diária e registrar consumo" color="var(--cyan)" />
        <SettingsRow href="/nutrition" icon={Salad} title="Metas alimentares" detail="Checklist, calorias e macros opcionais" color="var(--green)" />
        <SettingsRow href="/progress" icon={Activity} title="Progresso privado" detail="Medidas opcionais e fotos pendentes de storage" color="var(--coral)" />
      </section>
    </div>
    <section className="mt-4 grid gap-4 lg:grid-cols-2">
      <div className="app-card p-5"><p className="eyebrow">Dados e privacidade</p><h2 className="mt-2 text-lg font-black text-white">Exportação de dados</h2><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Gera uma solicitação auditada. Fotos ficam fora do banco quando o storage seguro for ativado.</p><button onClick={exportData} className="secondary-button mt-4"><Download size={18} /> Solicitar exportação</button></div>
      <div className="app-card p-5"><p className="eyebrow text-[var(--danger)]">Sessão</p><h2 className="mt-2 text-lg font-black text-white">Encerrar acesso neste navegador</h2><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Você pode entrar novamente quando quiser.</p><button onClick={signOut} className="secondary-button mt-4"><LogOut size={18} /> Sair</button></div>
    </section>
  </Screen>;
}

export function NotificationsLivePage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listNotifications();
      setItems(data.items);
      setUnread(data.unreadCount);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  async function read(id: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item));
    setUnread((count) => Math.max(0, count - 1));
    try {
      await markNotificationRead(id);
    } catch {
      await load();
    }
  }

  async function readAll() {
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    setUnread(0);
    try {
      await markAllNotificationsRead();
    } catch {
      await load();
    }
  }

  return <Screen title="Notificações" description="Atualizações importantes, sem excesso." action={<button onClick={readAll} className="secondary-button" disabled={!unread}><CheckCircle2 size={18} /> Marcar todas</button>}>
    <Notice message={error} tone="danger" />
    {loading ? <LoadingCard /> : items.length ? <section className="app-card px-5"><div className="divide-y divide-[var(--border)]">{items.map((notification) => { const isRead = Boolean(notification.readAt); return <button key={notification.id} onClick={() => !isRead && read(notification.id)} className="flex min-h-[92px] w-full items-center gap-4 text-left"><span className="relative grid size-11 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--lime)]"><Bell size={21} />{!isRead && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--coral)]" />}</span><div className="min-w-0 flex-1"><p className={`text-sm font-black ${isRead ? "text-[var(--text-muted)]" : "text-white"}`}>{notification.title}</p><p className="mt-1 truncate text-sm text-[var(--text-muted)]">{notification.body}</p></div><span className="shrink-0 text-xs text-[var(--text-dim)]">{new Date(notification.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span></button>; })}</div></section> : <EmptyState icon={Bell} title="Tudo em dia" detail="Quando houver lembretes ou conquistas importantes, eles aparecem aqui." />}
  </Screen>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" onClick={onChange} role="switch" aria-checked={checked} aria-label={label} className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${checked ? "border-[var(--lime)] bg-[var(--lime)]" : "border-[var(--border-strong)] bg-[var(--surface-soft)]"}`}><span className={`absolute top-1 size-[18px] rounded-full transition-transform ${checked ? "left-1 translate-x-5 bg-[var(--lime-ink)]" : "left-1 translate-x-0 bg-[var(--text-muted)]"}`} /></button>;
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function NotificationPreferencesLivePage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pushNotice, setPushNotice] = useState<string | null>(null);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getNotificationPreferences();
        if (active) setPrefs(data);
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  function updateLocal(key: keyof NotificationPreferences, value: boolean | string | number | number[]) {
    setPrefs((current) => current ? { ...current, [key]: value } : current);
  }

  async function save() {
    if (!prefs) return;
    setError(null);
    setNotice(null);
    try {
      const preferredWorkoutTime = timeValue(prefs.preferredWorkoutTime);
      const streakRiskTime = timeValue(prefs.streakRiskTime);
      const quietHoursStart = timeValue(prefs.quietHoursStart);
      const quietHoursEnd = timeValue(prefs.quietHoursEnd);
      const saved = await updateNotificationPreferences({
        emailEnabled: prefs.emailEnabled,
        pushEnabled: prefs.pushEnabled,
        waterRemindersEnabled: prefs.waterRemindersEnabled,
        workoutRemindersEnabled: prefs.workoutRemindersEnabled,
        nutritionRemindersEnabled: prefs.nutritionRemindersEnabled,
        professionalMessagesEnabled: prefs.professionalMessagesEnabled,
        nutritionProMessagesEnabled: prefs.nutritionProMessagesEnabled,
        runProMessagesEnabled: prefs.runProMessagesEnabled,
        streakRemindersEnabled: prefs.streakRemindersEnabled,
        weeklySummaryEnabled: prefs.weeklySummaryEnabled,
        preferredWorkoutTime: preferredWorkoutTime || undefined,
        waterReminderIntervalMinutes: prefs.waterReminderIntervalMinutes,
        streakRiskTime: streakRiskTime || undefined,
        quietHoursStart: quietHoursStart || undefined,
        quietHoursEnd: quietHoursEnd || undefined,
        silentDays: prefs.silentDays ?? [],
        timezone: prefs.timezone,
      });
      setPrefs(saved);
      setNotice("Preferências salvas.");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function enableBrowserPush() {
    if (!prefs) return;
    setPushNotice(null);
    setError(null);
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPushNotice("Este navegador ainda nao suporta Web Push. O sino interno continua funcionando.");
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setPushNotice("Web Push esta preparado, mas falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY no deploy.");
      return;
    }
    setPushBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushNotice("Permissao nao concedida. O sino interno continua funcionando.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const payload = subscription.toJSON();
      if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys?.auth) throw new Error("Subscription incompleta.");
      await subscribePush({ endpoint: payload.endpoint, keys: { p256dh: payload.keys.p256dh, auth: payload.keys.auth } });
      const saved = await updateNotificationPreferences({ pushEnabled: true });
      setPrefs(saved);
      setPushNotice("Push ativado neste navegador. As notificacoes internas continuam como historico.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPushBusy(false);
    }
  }

  async function disableBrowserPush() {
    if (!prefs) return;
    setPushBusy(true);
    setPushNotice(null);
    setError(null);
    try {
      const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration("/sw.js") : null;
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription?.endpoint) await unsubscribePush(subscription.endpoint);
      await subscription?.unsubscribe();
      const saved = await updateNotificationPreferences({ pushEnabled: false });
      setPrefs(saved);
      setPushNotice("Push desativado neste navegador. O sino interno segue ativo.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPushBusy(false);
    }
  }

  const rows: { key: keyof NotificationPreferences; title: string; detail: string; icon: LucideIcon; color: string }[] = [
    { key: "emailEnabled", title: "E-mails do produto", detail: "Controla lembretes e resumos, não segurança.", icon: Mail, color: "var(--cyan)" },
    { key: "workoutRemindersEnabled", title: "Lembrete de treino", detail: "No horário escolhido por você.", icon: Dumbbell, color: "var(--coral)" },
    { key: "waterRemindersEnabled", title: "Lembrete de água", detail: "Gentil e configurável.", icon: GlassWater, color: "var(--cyan)" },
    { key: "nutritionRemindersEnabled", title: "Checklist de alimentação", detail: "Uma lembrança sem cobrança.", icon: Salad, color: "var(--green)" },
    { key: "professionalMessagesEnabled", title: "Toques Pro", detail: "Permite lembretes internos de profissionais conectados.", icon: Bell, color: "var(--lime)" },
    { key: "nutritionProMessagesEnabled", title: "Nutri Pro", detail: "Mensagens internas do nutricionista conectado.", icon: Apple, color: "var(--green)" },
    { key: "runProMessagesEnabled", title: "Run Pro", detail: "Mensagens internas do coach conectado.", icon: Activity, color: "var(--cyan)" },
    { key: "streakRemindersEnabled", title: "Streak em risco", detail: "No máximo uma vez por dia.", icon: Flame, color: "var(--gold)" },
    { key: "weeklySummaryEnabled", title: "Resumo semanal", detail: "Resumo de constância.", icon: TrendingUp, color: "var(--lime)" },
  ];

  const pushControl = prefs ? <section className="app-card mb-4 flex min-w-0 flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><p className="eyebrow">Web Push</p><h2 className="mt-2 text-xl font-black text-white">Permissao explicita no navegador</h2><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Ative apenas se quiser receber avisos fora do app. Se nao ativar, o sino interno continua funcionando normalmente.</p></div><button type="button" onClick={() => prefs.pushEnabled ? void disableBrowserPush() : void enableBrowserPush()} disabled={pushBusy} className={prefs.pushEnabled ? "secondary-button justify-center disabled:opacity-60" : "primary-button justify-center disabled:opacity-60"}><Bell size={18} /> {pushBusy ? "Processando..." : prefs.pushEnabled ? "Desativar push" : "Ativar push"}</button></section> : null;

  return <Screen title="Preferências de notificação" description="Escolha o que ajuda. Todas as opções de produto podem ser desligadas." action={<Link href="/settings" className="secondary-button"><ArrowLeft size={18} /> Configurações</Link>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    <Notice message={pushNotice} />
    {pushControl}
    {loading || !prefs ? <LoadingCard /> : <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_380px]"><section className="app-card min-w-0 px-5">{rows.map(({ key, title, detail, icon: Icon, color }) => <div key={key} className="flex min-h-[82px] min-w-0 items-center gap-3 border-b border-[var(--border)] last:border-0"><span className="grid size-10 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)]" style={{ color }}><Icon size={20} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{title}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{detail}</p></div><Toggle checked={Boolean(prefs[key])} onChange={() => updateLocal(key, !prefs[key])} label={title} /></div>)}</section><aside className="min-w-0 space-y-4"><section className="app-card p-5"><p className="eyebrow">Horário silencioso</p><div className="mt-4 grid grid-cols-2 gap-3"><label className="min-w-0 text-xs font-bold text-[var(--text-muted)]">Início<input className="field mt-2 min-w-0" type="time" value={timeValue(prefs.quietHoursStart) || "22:00"} onChange={(event) => updateLocal("quietHoursStart", event.target.value)} /></label><label className="min-w-0 text-xs font-bold text-[var(--text-muted)]">Fim<input className="field mt-2 min-w-0" type="time" value={timeValue(prefs.quietHoursEnd) || "08:00"} onChange={(event) => updateLocal("quietHoursEnd", event.target.value)} /></label></div><label className="mt-4 block text-xs font-bold text-[var(--text-muted)]">Treino<input className="field mt-2" type="time" value={timeValue(prefs.preferredWorkoutTime) || "18:30"} onChange={(event) => updateLocal("preferredWorkoutTime", event.target.value)} /></label></section><section className="app-card p-5"><p className="eyebrow">Timezone</p><select className="field mt-4" value={prefs.timezone} onChange={(event) => updateLocal("timezone", event.target.value)} aria-label="Timezone"><option value="America/Sao_Paulo">America/Sao_Paulo</option><option value="America/Manaus">America/Manaus</option><option value="America/Recife">America/Recife</option><option value="UTC">UTC</option></select><button onClick={save} className="primary-button mt-4 w-full">Salvar preferências</button></section></aside></div>}
  </Screen>;
}

const eventLabel: Record<string, string> = {
  login_success: "Login reconhecido",
  login_failed: "Tentativa de login falhou",
  suspicious_login: "Login suspeito",
  password_changed: "Senha alterada",
  sessions_revoked: "Sessões encerradas",
  data_export_requested: "Exportação solicitada",
};

export function SecurityLivePage() {
  const router = useRouter();
  const session = useAuthSession();
  const [events, setEvents] = useState<Array<{ id: string; type: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await listSecurityEvents();
        if (active) setEvents(data.data);
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function revokeAll() {
    setError(null);
    try {
      await logoutAllDevices();
      clearSession();
      router.push("/login");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return <Screen title="Segurança da conta" description="Revise acessos e mantenha seus dados protegidos." action={<Link href="/settings" className="secondary-button"><ArrowLeft size={18} /> Configurações</Link>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    <div className="grid gap-4 lg:grid-cols-2"><section className="app-card p-5"><p className="eyebrow">Credenciais</p><div className="mt-4 divide-y divide-[var(--border)]"><div className="flex min-h-[76px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--lime)]"><KeyRound size={20} /></span><div className="flex-1"><p className="text-sm font-bold text-white">Senha</p><p className="mt-1 text-xs text-[var(--text-muted)]">Use recuperação segura para trocar a senha.</p></div><Link href="/login" className="ghost-button">Recuperar</Link></div><div className="flex min-h-[76px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--cyan)]"><Smartphone size={20} /></span><div className="flex-1"><p className="text-sm font-bold text-white">Autenticação em duas etapas</p><p className="mt-1 text-xs text-[var(--text-muted)]">Backend ainda não liberado para produção.</p></div><button onClick={() => setNotice("2FA está bloqueado até a implementação segura no backend.")} className="secondary-button">Ver status</button></div></div></section><section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Dispositivo atual</p><h2 className="mt-2 text-lg font-black text-white">Sessão ativa</h2></div><button onClick={revokeAll} className="ghost-button text-[var(--danger)]">Sair de todos</button></div><div className="mt-4 flex min-h-[72px] items-center gap-3 border-t border-[var(--border)]"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--text-muted)]"><Smartphone size={20} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">LevelFit Web</p><p className="mt-1 text-xs text-[var(--text-muted)]">{session.user?.email}</p></div><Pill>ATUAL</Pill></div></section></div>
    <section className="mt-4 app-card p-5"><p className="eyebrow">Eventos recentes</p>{loading ? <p className="mt-4 text-sm text-[var(--text-muted)]">Carregando eventos...</p> : <div className="mt-4 divide-y divide-[var(--border)]">{events.length ? events.map((event) => <div key={event.id} className="flex min-h-[68px] items-center gap-3"><ShieldCheck size={19} className="text-[var(--lime)]" /><div className="flex-1"><p className="text-sm font-bold text-white">{eventLabel[event.type] ?? event.type}</p><p className="mt-1 text-xs text-[var(--text-muted)]">Registrado com dados sensíveis minimizados.</p></div><span className="text-xs text-[var(--text-dim)]">{new Date(event.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span></div>) : <p className="py-6 text-sm text-[var(--text-muted)]">Nenhum evento recente.</p>}</div>}</section>
  </Screen>;
}

const rarityTone: Record<string, "lime" | "cyan" | "coral" | "green" | "gold" | "violet"> = {
  common: "lime",
  uncommon: "cyan",
  rare: "gold",
  epic: "violet",
};

export function AchievementsLivePage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      try {
        const result = await listAchievements();
        setItems(result.data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return <Screen title="Conquistas" description="Badges conquistados por constância, não por extremos.">
    <Notice message={error} tone="danger" />
    {loading ? <LoadingCard /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((achievement, index) => {
      const tone = rarityTone[achievement.rarity] ?? "lime";
      return <motion.article key={achievement.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`app-card min-h-[190px] p-5 ${achievement.unlocked ? "" : "opacity-55"}`}><div className="flex items-start justify-between"><span className="grid size-14 place-items-center rounded-[8px] border border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.1)] text-[var(--gold)]"><Trophy size={28} /></span>{achievement.unlocked ? <Pill tone={tone}>DESBLOQUEADA</Pill> : <LockKeyhole size={18} className="text-[var(--text-dim)]" />}</div><h2 className="mt-5 font-black text-white">{achievement.name}</h2><p className="mt-1.5 text-sm leading-5 text-[var(--text-muted)]">{achievement.description}</p><p className="mt-4 text-xs font-black text-[var(--gold)]">+{achievement.xpReward} XP</p></motion.article>;
    })}</div>}
  </Screen>;
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function sessionMinutes(session: WorkoutSession) {
  if (session.startedAt && session.completedAt) {
    const started = new Date(session.startedAt).getTime();
    const completed = new Date(session.completedAt).getTime();
    if (Number.isFinite(started) && Number.isFinite(completed) && completed > started) {
      return Math.max(1, Math.round((completed - started) / 60000));
    }
  }

  return session.workout.estimatedMinutes;
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponivel";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

function completedExerciseNames(session: WorkoutSession) {
  return session.exercises
    .filter((item) => item.status === "completed")
    .map((item) => item.exercise.name)
    .slice(0, 3);
}

export function ProgressLivePage() {
  const [items, setItems] = useState<BodyMeasurement[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [measurementResult, sessionsResult] = await Promise.all([listMeasurements(), listWorkoutSessions()]);
      setItems(measurementResult.data);
      setWorkoutHistory(sessionsResult.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await addMeasurement({
        weightKg: numberValue(form.get("weightKg")),
        waistCm: numberValue(form.get("waistCm")),
        hipCm: numberValue(form.get("hipCm")),
        chestCm: numberValue(form.get("chestCm")),
        notes: String(form.get("notes") ?? ""),
      });
      setShowForm(false);
      setNotice("Check-in privado salvo.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function preparePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const result = await createProgressPhotoMetadata({ contentType: file.type, sizeBytes: file.size, pose: "check-in" });
      setNotice(result.upload.url ? "Foto pronta para envio seguro." : result.upload.note ?? "Metadados da foto salvos. Falta ativar storage seguro.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      event.target.value = "";
    }
  }

  const latest = items[0];
  const completedWorkouts = workoutHistory.filter((session) => session.status === "completed");
  const totalWorkoutMinutes = completedWorkouts.reduce((sum, session) => sum + sessionMinutes(session), 0);
  const totalWorkoutXp = completedWorkouts.reduce((sum, session) => sum + session.xpAwarded, 0);
  const lastWorkout = completedWorkouts[0] ?? workoutHistory[0];

  return <Screen title="Seu progresso" description="Observe tendências amplas. Um número isolado nunca define sua evolução." action={<button onClick={() => setShowForm(true)} className="secondary-button"><Plus size={18} /> Novo check-in</button>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    {showForm && <form onSubmit={submit} className="app-card mb-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Check-in privado</p><h2 className="mt-2 text-lg font-black text-white">Registre somente o que fizer sentido</h2></div><button type="button" onClick={() => setShowForm(false)} className="ghost-button">Fechar</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input className="field" name="weightKg" type="number" step="0.1" placeholder="Peso kg" /><input className="field" name="waistCm" type="number" step="0.1" placeholder="Cintura cm" /><input className="field" name="hipCm" type="number" step="0.1" placeholder="Quadril cm" /><input className="field" name="chestCm" type="number" step="0.1" placeholder="Peito cm" /></div><textarea className="field mt-3 min-h-20" name="notes" placeholder="Notas opcionais" /><button className="primary-button mt-3">Salvar check-in</button></form>}
    {loading ? <LoadingCard /> : <div className="grid gap-4 lg:grid-cols-2"><section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Medidas privadas</p><h2 className="mt-2 text-lg font-black text-white">Último check-in</h2></div><LockKeyhole size={20} className="text-[var(--text-dim)]" /></div>{latest ? <div className="mt-5 grid grid-cols-2 gap-3">{[{ label: "Peso", value: latest.weightKg ? `${latest.weightKg} kg` : "-" }, { label: "Cintura", value: latest.waistCm ? `${latest.waistCm} cm` : "-" }, { label: "Quadril", value: latest.hipCm ? `${latest.hipCm} cm` : "-" }, { label: "Peito", value: latest.chestCm ? `${latest.chestCm} cm` : "-" }].map((item) => <div key={item.label} className="subtle-card p-4"><p className="text-xs font-bold text-[var(--text-muted)]">{item.label}</p><p className="mt-2 font-black text-white">{item.value}</p></div>)}</div> : <p className="mt-5 text-sm text-[var(--text-muted)]">Nenhum check-in registrado ainda.</p>}<p className="mt-4 text-xs leading-5 text-[var(--text-dim)]">Visível somente para você. Medidas são opcionais e não afetam XP.</p></section><section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Fotos de progresso</p><h2 className="mt-2 text-lg font-black text-white">Registro visual privado</h2></div><Camera size={20} className="text-[var(--text-dim)]" /></div><label className="mt-5 grid min-h-[180px] cursor-pointer place-items-center border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center transition-colors hover:border-[var(--cyan)]"><input className="screen-reader-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={preparePhoto} /><span><Camera className="mx-auto text-[var(--text-dim)]" size={30} /><span className="mt-3 block text-sm font-bold text-white">Selecionar foto privada</span><span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">Hoje o app registra metadados seguros. O envio final será ativado quando o storage S3/R2 estiver configurado.</span></span></label></section></div>}
    {!loading && <section className="mt-4 app-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--coral)]">Historico de treinos</p>
          <h2 className="mt-2 text-lg font-black text-white">O que voce treinou</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Acompanhe sessoes concluidas, tempo, XP e movimentos recentes sem transformar progresso em cobranca.</p>
        </div>
        <Pill tone="coral"><Dumbbell size={14} /> {completedWorkouts.length} treinos</Pill>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="subtle-card p-4"><p className="eyebrow">Treinos concluidos</p><p className="mt-2 text-xl font-black text-white">{completedWorkouts.length}</p></div>
        <div className="subtle-card p-4"><p className="eyebrow">Tempo treinando</p><p className="mt-2 text-xl font-black text-white">{totalWorkoutMinutes} min</p></div>
        <div className="subtle-card p-4"><p className="eyebrow">XP de treino</p><p className="mt-2 text-xl font-black text-white">{totalWorkoutXp} XP</p></div>
      </div>

      {lastWorkout ? <div className="mt-4 rounded-[8px] border border-[rgba(255,107,61,0.28)] bg-[rgba(255,107,61,0.07)] p-4">
        <p className="text-xs font-black uppercase text-[var(--coral)]">Ultima sessao</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-black text-white">{lastWorkout.workout.title}</p>
            <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{shortDate(lastWorkout.completedAt ?? lastWorkout.startedAt)} - {sessionMinutes(lastWorkout)} min - {lastWorkout.exercises.length} exercicios</p>
          </div>
          <span className="text-sm font-black text-[var(--gold)]">+{lastWorkout.xpAwarded} XP</span>
        </div>
      </div> : <div className="mt-4 rounded-[8px] border border-dashed border-[var(--border-strong)] p-5 text-center">
        <Dumbbell className="mx-auto text-[var(--text-dim)]" size={28} />
        <p className="mt-3 text-sm font-black text-white">Nenhum treino salvo ainda</p>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Quando voce concluir uma sessao, ela aparece aqui com exercicios, tempo e XP.</p>
        <Link href="/workouts" className="secondary-button mx-auto mt-4">Escolher treino</Link>
      </div>}

      {completedWorkouts.length > 0 && <div className="mt-4 divide-y divide-[var(--border)]">
        {completedWorkouts.slice(0, 5).map((session) => {
          const names = completedExerciseNames(session);
          return <article key={session.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[rgba(255,107,61,0.12)] text-[var(--coral)]"><BicepsFlexed size={22} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-white">{session.workout.title}</h3><Pill tone={session.status === "completed" ? "lime" : "gold"}>{session.status === "completed" ? "CONCLUIDO" : "EM ANDAMENTO"}</Pill></div>
              <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{shortDate(session.completedAt ?? session.startedAt)} - {sessionMinutes(session)} min - {session.exercises.length} exercicios</p>
              <p className="mt-2 truncate text-xs text-[var(--text-dim)]">{names.length ? names.join(", ") : "Movimentos registrados aparecerao aqui."}</p>
            </div>
            <span className="text-sm font-black text-[var(--gold)]">+{session.xpAwarded} XP</span>
          </article>;
        })}
      </div>}
    </section>}
  </Screen>;
}

export function RankingLivePage() {
  const [items, setItems] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const result = await listRanking();
      setItems(result.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  async function joinRanking() {
    setError(null);
    try {
      await updateMe({ rankingOptIn: true });
      setNotice("Participação no ranking ativada. Só nome abreviado, XP, nível e streak aparecem.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const podium = items.slice(0, 3);

  return <Screen title="Ranking geral" description="Competição saudável apenas entre pessoas que aceitaram aparecer publicamente." action={<button onClick={joinRanking} className="secondary-button"><ShieldCheck size={18} /> Participação opt-in</button>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    {loading ? <LoadingCard /> : <section className="mb-4 grid gap-4 lg:grid-cols-[1fr_360px]"><div className="app-card p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow text-[var(--gold)]">Top da semana</p><h2 className="mt-2 text-lg font-black text-white">XP conquistado com constância</h2></div><Pill tone="gold"><Trophy size={14} /> RANKING REAL</Pill></div>{podium.length ? <div className="mt-5 grid gap-3 md:grid-cols-3">{podium.map((person) => <article key={person.userId} className={`subtle-card p-4 ${person.rank === 1 ? "border-[rgba(250,204,21,0.45)]" : ""}`}><div className="flex items-center justify-between"><span className={`grid size-11 place-items-center rounded-[7px] ${person.rank === 1 ? "bg-[rgba(250,204,21,0.16)] text-[var(--gold)]" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}><Medal size={22} /></span><span className="text-xs font-black text-[var(--text-dim)]">#{person.rank}</span></div><h3 className="mt-4 font-black text-white">{person.displayName}</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Nível {person.level} · {person.streak} dias</p><p className="mt-4 text-xl font-black text-[var(--lime)]">{person.totalXp.toLocaleString("pt-BR")} XP</p></article>)}</div> : <p className="mt-6 text-sm text-[var(--text-muted)]">Ainda não há participantes opt-in no ranking.</p>}</div><aside className="app-card p-5"><p className="eyebrow text-[var(--cyan)]">Sua privacidade</p><h2 className="mt-2 text-lg font-black text-white">Você controla se aparece</h2><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Ranking é desligado por padrão. Ao participar, o app mostra apenas nome abreviado, XP, nível e streak.</p><div className="mt-5 border-l-2 border-[var(--lime)] bg-[rgba(183,255,42,0.06)] p-4"><p className="text-sm font-black text-white">Dados nunca exibidos</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Peso, medidas, fotos, refeições detalhadas e informações sensíveis de saúde.</p></div><button onClick={joinRanking} className="primary-button mt-5 w-full"><UsersRound size={18} /> Entrar no ranking</button></aside></section>}
    {!loading && items.length > 0 && <section className="app-card px-5"><div className="divide-y divide-[var(--border)]">{items.map((person) => <div key={person.userId} className="flex min-h-[78px] items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-sm font-black text-white">#{person.rank}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-white">{person.displayName}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">Nível {person.level}</p></div><span className="hidden text-xs font-black text-[var(--gold)] sm:inline">{person.streak} dias</span><span className="text-sm font-black text-[var(--lime)]">{person.totalXp.toLocaleString("pt-BR")} XP</span></div>)}</div></section>}
  </Screen>;
}

export function ProfileLivePage() {
  const session = useAuthSession();
  const progress = getUserProgress(session.user);
  const avatarStage = getCurrentAvatarStage(progress.level);
  const nextAvatarStage = getNextAvatarStage(progress.level);
  const displayName = session.user?.displayName || fallbackUser.name;
  const email = session.user?.email || fallbackUser.email;
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await updateMe({
        displayName: String(form.get("displayName") ?? displayName),
        gender: (String(form.get("gender") || "") || null) as "male_cis" | "female_cis" | "male_trans" | "female_trans" | null,
        fitnessGoal: String(form.get("fitnessGoal") || "consistency"),
        activityLevel: String(form.get("activityLevel") || "beginner"),
        heightCm: Number(form.get("heightCm")) || undefined,
      });
      setEditing(false);
      setNotice("Perfil salvo. Recarregue a página se quiser ver o nome atualizado imediatamente.");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return <Screen title="Perfil" description="Sua identidade e preferências principais no LevelFit." action={<button onClick={() => setEditing(true)} className="secondary-button"><Pencil size={18} /> Editar perfil</button>}>
    <Notice message={notice} />
    <Notice message={error} tone="danger" />
    {editing && <form onSubmit={submit} className="app-card mb-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Perfil</p><h2 className="mt-2 text-lg font-black text-white">Atualize seus dados básicos</h2><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Esses dados ajudam a personalizar o app, mas nada disso aparece no ranking.</p></div><button type="button" onClick={() => setEditing(false)} className="ghost-button">Fechar</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><input className="field" name="displayName" defaultValue={displayName} minLength={2} maxLength={80} aria-label="Nome de exibição" /><select className="field" name="gender" defaultValue="" aria-label="Gênero"><option value="">Prefiro não informar</option><option value="male_cis">Homem cis</option><option value="female_cis">Mulher cis</option><option value="male_trans">Homem trans</option><option value="female_trans">Mulher trans</option></select><select className="field" name="fitnessGoal" defaultValue="consistency" aria-label="Objetivo"><option value="consistency">Consistência</option><option value="strength">Força</option><option value="conditioning">Condicionamento</option><option value="weight_management">Controle de peso</option><option value="hydration">Hidratação</option><option value="nutrition">Alimentação</option></select><select className="field" name="activityLevel" defaultValue="beginner" aria-label="Nível de atividade"><option value="beginner">Começando</option><option value="returning">Voltando</option><option value="occasional">Às vezes</option><option value="active">Ativo</option></select><input className="field" name="heightCm" type="number" min={80} max={250} step="0.1" placeholder="Altura cm" aria-label="Altura em centímetros" /></div><button className="primary-button mt-3">Salvar perfil</button></form>}
    <section className="app-card overflow-hidden"><div className="grid md:grid-cols-[280px_1fr]"><PulseAvatar stage={avatarStage} alt={`${avatarStage.name}, avatar atual`} className="min-h-[320px]" imageClassName="p-4" /><div className="p-5 sm:p-7"><div className="flex flex-wrap items-center gap-2"><Pill><Zap size={14} /> NÍVEL {progress.level}</Pill><Pill tone="gold"><Flame size={14} /> {progress.streak} DIAS</Pill><Pill tone="cyan"><Sparkles size={14} /> {avatarStage.name}</Pill></div><h2 className="mt-5 text-2xl font-black text-white">{displayName}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{email}</p><p className="mt-5 max-w-xl text-sm leading-6 text-[var(--text-muted)]">Construindo força e constância com uma rotina flexível. O Pulse evolui com XP, missões concluídas e retomadas saudáveis.</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="subtle-card p-4"><p className="eyebrow">XP total</p><p className="mt-2 text-lg font-black text-white">{progress.totalXp.toLocaleString("pt-BR")}</p></div><div className="subtle-card p-4"><p className="eyebrow">Nível</p><p className="mt-2 text-lg font-black text-white">{progress.level}</p></div><div className="subtle-card p-4"><p className="eyebrow">Streak</p><p className="mt-2 text-lg font-black text-white">{progress.streak}</p></div></div></div></div></section>
    <section className="mt-4 app-card p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow text-[var(--cyan)]">Evolução do Pulse</p><h2 className="mt-2 text-lg font-black text-white">Seu companheiro melhora com o tempo</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-muted)]">Pausas não removem upgrades. Elas só adiam o próximo desbloqueio até você voltar para o seu ritmo.</p></div>{nextAvatarStage && <Pill tone="gold"><Sparkles size={14} /> PRÓXIMO: NÍVEL {nextAvatarStage.levelRequired}</Pill>}</div><div className="mt-5 grid gap-3 md:grid-cols-5">{avatarStages.map((stage) => { const unlocked = progress.level >= stage.levelRequired; const current = avatarStage.id === stage.id; return <article key={stage.id} className={`subtle-card min-h-[250px] overflow-hidden p-4 ${unlocked ? "" : "opacity-55"}`}><div className="flex items-center justify-between gap-2"><span className={`grid size-9 place-items-center rounded-[7px] ${current ? "bg-[var(--lime)] text-[var(--lime-ink)]" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}>{unlocked ? <Check size={17} strokeWidth={3} /> : <LockKeyhole size={16} />}</span><span className="text-xs font-black text-[var(--text-dim)]">NÍVEL {stage.levelRequired}</span></div><PulseAvatar stage={stage} alt={`${stage.name}, estágio do Pulse`} locked={!unlocked} className="mt-4 h-[104px] rounded-[7px] border border-[var(--border)]" imageClassName="p-2" /><h3 className="mt-4 text-sm font-black text-white">{stage.name}</h3><p className="mt-1 text-xs font-bold" style={{ color: stage.accent }}>{stage.personality}</p><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{stage.activeBenefit}</p>{current && <p className="mt-3 text-xs font-black text-[var(--lime)]">ATUAL</p>}</article>; })}</div></section>
    <div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="app-card p-5"><p className="eyebrow">Objetivos atuais</p><div className="mt-4 flex flex-wrap gap-2"><Pill><Target size={14} /> CONSISTÊNCIA</Pill><Pill tone="coral"><Dumbbell size={14} /> FORÇA</Pill><Pill tone="cyan"><GlassWater size={14} /> HIDRATAÇÃO</Pill></div></section><section className="app-card p-5"><p className="eyebrow">Privacidade social</p><div className="mt-4 flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-white">Ranking opt-in</p><p className="mt-1 text-xs text-[var(--text-muted)]">Você decide aparecer ou não no ranking público.</p></div><Link href="/ranking" className="secondary-button"><UserRound size={18} /> Ver ranking</Link></div></section></div>
  </Screen>;
}
