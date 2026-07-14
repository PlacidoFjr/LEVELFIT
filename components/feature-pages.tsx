"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  ArrowLeft,
  ArrowRight,
  Bell,
  BicepsFlexed,
  CalendarDays,
  Camera,
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
  Minus,
  MoonStar,
  MoreHorizontal,
  Pencil,
  Plus,
  Salad,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  UserRound,
  Utensils,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { achievements, avatarStages, getCurrentAvatarStage, getNextAvatarStage, getTodaysNutritionPlan, missions, notifications as initialNotifications, progressData, user, workoutExercises } from "@/lib/mock-data";
import { PageHeader } from "./page-header";
import { ProgressRing } from "./progress-ring";

function Screen({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><PageHeader title={title} description={description} action={action} />{children}</div>;
}

function Pill({ children, tone = "lime" }: { children: React.ReactNode; tone?: "lime" | "cyan" | "coral" | "green" | "gold" | "violet" }) {
  const colors = { lime: "var(--lime)", cyan: "var(--cyan)", coral: "var(--coral)", green: "var(--green)", gold: "var(--gold)", violet: "var(--violet)" };
  return <span className="inline-flex min-h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-black" style={{ color: colors[tone], background: `color-mix(in srgb, ${colors[tone]} 12%, transparent)` }}>{children}</span>;
}

function Stat({ label, value, detail, icon: Icon, color = "var(--lime)" }: { label: string; value: string; detail: string; icon: LucideIcon; color?: string }) {
  return <div className="app-card flex min-h-[132px] items-start gap-4 p-4 sm:p-5"><span className="grid size-11 shrink-0 place-items-center rounded-[7px]" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}><Icon size={22} /></span><div className="min-w-0"><p className="eyebrow">{label}</p><p className="mt-2 text-xl font-black text-white">{value}</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{detail}</p></div></div>;
}

export function MissionsPage() {
  const [done, setDone] = useState<string[]>(["recovery"]);
  return <Screen title="Missões do dia" description="Quatro oportunidades de cuidar de você. Complete o que fizer sentido; pausar também conta.">
    <div className="mb-4 grid gap-4 sm:grid-cols-3">
      <Stat label="Concluídas" value={`${done.length} de ${missions.length}`} detail="O dia não precisa ser perfeito." icon={CheckCircle2} />
      <Stat label="XP possível" value={`${missions.filter((m) => !done.includes(m.id)).reduce((sum, m) => sum + m.xp, 0)} XP`} detail="Sem XP negativo ou punição." icon={Zap} color="var(--gold)" />
      <Stat label="Sequência" value={`${user.streak} dias`} detail="Um dia leve pode salvar seu ritmo." icon={Flame} color="var(--coral)" />
    </div>
    <section className="app-card p-4 sm:p-5">
      <div className="divide-y divide-[var(--border)]">
        {missions.map((mission, index) => { const Icon = mission.icon; const complete = done.includes(mission.id); return <motion.div key={mission.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
          <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-[var(--surface-soft)] text-[var(--lime)]"><Icon size={23} /></span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className={`font-black ${complete ? "text-[var(--text-dim)] line-through" : "text-white"}`}>{mission.title}</h2><Pill tone="gold">+{mission.xp} XP</Pill></div><p className="mt-1.5 text-sm text-[var(--text-muted)]">{mission.detail}</p></div>
          <button onClick={() => setDone((items) => complete ? items.filter((id) => id !== mission.id) : [...items, mission.id])} className={complete ? "secondary-button border-[rgba(183,255,42,0.3)] text-[var(--lime)]" : "primary-button"}>{complete ? <><Check size={18} /> Concluída</> : <>Concluir <ArrowRight size={18} /></>}</button>
        </motion.div>; })}
      </div>
    </section>
    <section className="mt-4 flex flex-col gap-4 border-l-2 border-[var(--violet)] bg-[rgba(167,139,250,0.06)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-black text-white">Hoje ficou pesado?</p><p className="mt-1 text-sm text-[var(--text-muted)]">Troque uma missão por 5 minutos de mobilidade ou respiracao. Seu progresso continua valido.</p></div><button className="secondary-button shrink-0"><MoonStar size={18} /> Escolher modo leve</button>
    </section>
  </Screen>;
}

export function WorkoutsPage() {
  return <Screen title="Treino do dia" description="Um plano curto, ajustável e com espaço para descanso." action={<button className="secondary-button"><CalendarDays size={18} /> Agenda</button>}>
    <section className="app-card overflow-hidden">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-5 sm:p-7"><div className="flex flex-wrap gap-2"><Pill tone="coral"><Dumbbell size={14} /> CORPO INTEIRO</Pill><Pill>MODERADO</Pill></div><h2 className="mt-5 text-2xl font-black text-white">Essencial 28</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">Movimentos fundamentais para força e mobilidade. Pare se sentir dor e adapte qualquer exercicio.</p><div className="mt-5 flex flex-wrap gap-5 text-sm font-bold text-[var(--text-muted)]"><span className="inline-flex items-center gap-2"><Clock3 size={18} /> 28 minutos</span><span className="inline-flex items-center gap-2"><Activity size={18} /> 5 exercícios</span><span className="inline-flex items-center gap-2"><Zap size={18} /> 60 XP</span></div><div className="mt-7 flex flex-col gap-2 sm:flex-row"><Link href="/workouts/session" className="primary-button bg-[var(--coral)] text-white">Começar treino <ArrowRight size={18} /></Link><button className="secondary-button">Ajustar intensidade</button></div></div>
        <div className="border-t border-[var(--border)] bg-[var(--surface-elevated)] p-5 lg:border-l lg:border-t-0"><p className="eyebrow mb-3">Sequência do treino</p><div className="divide-y divide-[var(--border)]">{workoutExercises.map((exercise, index) => { const Icon = exercise.icon; return <div key={exercise.id} className="flex min-h-[64px] items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-[var(--surface-soft)] text-[var(--coral)]"><Icon size={17} /></span><span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{exercise.name}</span><span className="text-xs font-bold text-[var(--text-muted)]">{exercise.meta}</span><span className="text-xs text-[var(--text-dim)]">{index + 1}</span></div>; })}</div></div>
      </div>
    </section>
    <h2 className="mb-3 mt-7 text-lg font-black text-white">Outras opções</h2>
    <div className="grid gap-4 md:grid-cols-3">
      {[{ name: "Mobilidade para coluna", meta: "12 min", color: "var(--violet)", icon: HeartPulse }, { name: "Cardio sem impacto", meta: "20 min", color: "var(--cyan)", icon: Activity }, { name: "Recuperação guiada", meta: "8 min", color: "var(--green)", icon: MoonStar }].map(({ name, meta, color, icon: Icon }) => <button key={name} className="app-card flex min-h-[112px] items-center gap-4 p-4 text-left transition-transform hover:-translate-y-0.5"><span className="grid size-11 place-items-center rounded-[7px]" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}><Icon size={22} /></span><span className="flex-1"><strong className="block text-sm text-white">{name}</strong><span className="mt-1 block text-xs text-[var(--text-muted)]">{meta}</span></span><ChevronRight size={18} className="text-[var(--text-dim)]" /></button>)}
    </div>
  </Screen>;
}

export function WorkoutSessionPage() {
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { if (!started) return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [started]);
  const minutesLabel = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const current = workoutExercises.find((item) => !done.includes(item.id));
  return <Screen title="Sessão de treino" description="Siga no seu ritmo. Você pode pausar, adaptar ou encerrar a qualquer momento." action={<Link href="/workouts" className="secondary-button"><ArrowLeft size={18} /> Sair</Link>}>
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <section className="app-card flex min-h-[460px] flex-col items-center justify-center p-6 text-center">
        <Pill tone="coral">EXERCICIO {Math.min(done.length + 1, workoutExercises.length)} DE {workoutExercises.length}</Pill>
        <span className="mt-8 grid size-20 place-items-center rounded-[8px] bg-[rgba(255,107,61,0.12)] text-[var(--coral)]"><BicepsFlexed size={40} /></span>
        <h2 className="mt-6 text-2xl font-black text-white">{current?.name ?? "Treino concluído"}</h2>
        <p className="mt-2 text-[var(--text-muted)]">{current?.meta ?? "Todos os movimentos foram registrados."}</p>
        <div className="mt-8 font-mono text-5xl font-black text-white" aria-label={`Tempo ${minutesLabel}`}>{minutesLabel}</div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button onClick={() => setStarted((value) => !value)} className="secondary-button"><Timer size={18} /> {started ? "Pausar" : seconds ? "Continuar" : "Iniciar"}</button>
          {current && <button onClick={() => { setDone((items) => [...items, current.id]); setSeconds(0); setStarted(false); }} className="primary-button bg-[var(--coral)] text-white"><Check size={18} /> Concluir bloco</button>}
        </div>
        <p className="mt-6 max-w-md text-xs leading-5 text-[var(--text-dim)]">Movimento controlado e respiracao confortável. Dor aguda não faz parte do treino.</p>
      </section>
      <aside className="app-card p-5"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Progresso</p><p className="mt-2 font-black text-white">{done.length} de {workoutExercises.length}</p></div><ProgressRing value={Math.round((done.length / workoutExercises.length) * 100)} size={76} stroke={7} color="var(--coral)" label="Progresso do treino" /></div><div className="divide-y divide-[var(--border)]">{workoutExercises.map((exercise) => <div key={exercise.id} className="flex min-h-[60px] items-center gap-3"><span className={`grid size-7 place-items-center rounded-[5px] border ${done.includes(exercise.id) ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--lime-ink)]" : current?.id === exercise.id ? "border-[var(--coral)] text-[var(--coral)]" : "border-[var(--border)] text-[var(--text-dim)]"}`}>{done.includes(exercise.id) ? <Check size={15} strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{exercise.name}</p><p className="mt-0.5 text-xs text-[var(--text-muted)]">{exercise.meta}</p></div></div>)}</div></aside>
    </div>
  </Screen>;
}

export function NutritionPage() {
  const nutritionPlan = useMemo(() => getTodaysNutritionPlan(), []);
  const [checked, setChecked] = useState(() => nutritionPlan.items.filter((item) => item.done).map((item) => item.id));
  const [showAdd, setShowAdd] = useState(false);
  return <Screen title="Alimentação" description="Organize refeições sem classificar comida como prêmio ou culpa." action={<button onClick={() => setShowAdd(true)} className="primary-button"><Plus size={18} /> Registrar refeição</button>}>
    {showAdd && <div className="app-card mb-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[var(--green)]">Nova refeição</p><h2 className="mt-2 text-lg font-black text-white">O que você comeu?</h2></div><button onClick={() => setShowAdd(false)} className="ghost-button">Fechar</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><select className="field" aria-label="Tipo de refeição"><option>Almoço</option><option>Café da manhã</option><option>Lanche</option><option>Jantar</option></select><input className="field" placeholder="Descrição breve" aria-label="Descrição da refeição" /></div><button onClick={() => setShowAdd(false)} className="primary-button mt-3 bg-[var(--green)] text-[#052313]">Salvar registro</button></div>}
    <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <section className="app-card p-5"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow text-[var(--green)]">Checklist de hoje</p><h2 className="mt-2 text-lg font-black text-white">{nutritionPlan.title}</h2><p className="mt-1 max-w-md text-xs leading-5 text-[var(--text-muted)]">{nutritionPlan.description}</p></div><ProgressRing value={Math.round((checked.length / nutritionPlan.items.length) * 100)} size={82} stroke={7} color="var(--green)" label="Checklist alimentar" /></div><div className="divide-y divide-[var(--border)]">{nutritionPlan.items.map((item) => { const Icon = item.icon; const done = checked.includes(item.id); return <button key={item.id} onClick={() => setChecked((items) => done ? items.filter((id) => id !== item.id) : [...items, item.id])} className="flex min-h-[72px] w-full items-center gap-3 text-left"><span className="grid size-10 place-items-center rounded-[7px] bg-[rgba(56,217,121,0.1)] text-[var(--green)]"><Icon size={20} /></span><span className={`flex-1 text-sm font-bold ${done ? "text-[var(--text-muted)]" : "text-white"}`}>{item.label}</span><span className={`grid size-8 place-items-center rounded-[6px] border ${done ? "border-[var(--green)] bg-[var(--green)] text-[#052313]" : "border-[var(--border-strong)] text-transparent"}`}><Check size={17} strokeWidth={3} /></span></button>; })}</div></section>
      <section className="app-card p-5"><p className="eyebrow">Refeições registradas</p><div className="mt-4 divide-y divide-[var(--border)]">{[{ time: "08:10", type: "Café da manhã", detail: "Iogurte, fruta e aveia", icon: Apple }, { time: "12:35", type: "Almoço", detail: "Arroz, feijão, legumes e frango", icon: Utensils }].map(({ time, type, detail, icon: Icon }) => <div key={time} className="flex min-h-[84px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--green)]"><Icon size={20} /></span><div className="min-w-0 flex-1"><p className="text-sm font-black text-white">{type}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{detail}</p></div><span className="text-xs font-bold text-[var(--text-dim)]">{time}</span><button className="ghost-button px-2" aria-label={`Editar ${type}`} title="Editar"><Pencil size={16} /></button></div>)}</div><div className="mt-4 border-l-2 border-[var(--green)] bg-[rgba(56,217,121,0.06)] p-4"><p className="text-sm font-bold text-white">Sem contagem obrigatória</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Calorias e macros são opcionais. O checklist ajuda a criar variedade sem rigidez.</p></div></section>
    </div>
  </Screen>;
}

export function HydrationPage() {
  const [water, setWater] = useState(1250);
  const percent = Math.min(100, Math.round((water / 2000) * 100));
  const entries = [250, 300, 250, 450];
  return <Screen title="Hidratação" description="Pequenas pausas ao longo do dia, sem transformar a meta em obrigação." action={<button className="secondary-button"><Settings size={18} /> Ajustar meta</button>}>
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="app-card flex min-h-[360px] flex-col items-center justify-center p-6 text-center"><ProgressRing value={percent} size={164} stroke={13} color="var(--cyan)" label="Meta de hidratação" /><h2 className="mt-6 text-2xl font-black text-white">{water.toLocaleString("pt-BR")} <span className="text-base text-[var(--text-muted)]">/ 2.000 ml</span></h2><p className="mt-2 text-sm text-[var(--text-muted)]">{percent >= 100 ? "Meta alcançada. Continue ouvindo seu corpo." : `Faltam ${(2000 - water).toLocaleString("pt-BR")} ml, no seu ritmo.`}</p><div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2">{[250, 350, 500].map((amount) => <button key={amount} onClick={() => setWater((value) => Math.min(4000, value + amount))} className="secondary-button px-2"><Plus size={16} /> {amount}</button>)}</div><button onClick={() => setWater((value) => Math.max(0, value - 250))} className="ghost-button mt-3 text-xs"><Minus size={15} /> Desfazer último copo</button></section>
      <section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow text-[var(--cyan)]">Hoje</p><h2 className="mt-2 text-lg font-black text-white">Registros de água</h2></div><Pill tone="cyan"><GlassWater size={14} /> {entries.length} REGISTROS</Pill></div><div className="mt-5 divide-y divide-[var(--border)]">{entries.map((amount, index) => <div key={`${amount}-${index}`} className="flex min-h-[68px] items-center gap-3"><span className="grid size-9 place-items-center rounded-[7px] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]"><GlassWater size={18} /></span><div className="flex-1"><p className="text-sm font-black text-white">{amount} ml</p><p className="mt-0.5 text-xs text-[var(--text-muted)]">Copo de água</p></div><span className="text-xs font-bold text-[var(--text-dim)]">{["08:20", "10:35", "12:50", "15:10"][index]}</span><button className="ghost-button px-2" aria-label="Mais opções" title="Mais opções"><MoreHorizontal size={18} /></button></div>)}</div><div className="mt-5 bg-[var(--surface-elevated)] p-4"><div className="flex items-center gap-2 text-sm font-bold text-white"><Info size={17} className="text-[var(--cyan)]" /> Próximo lembrete as 17:10</div><p className="mt-1.5 text-xs text-[var(--text-muted)]">Horário silencioso ativo entre 22:00 e 08:00.</p></div></section>
    </div>
  </Screen>;
}

export function ProgressPage() {
  const [period, setPeriod] = useState("6 semanas");
  return <Screen title="Seu progresso" description="Observe tendências amplas. Um número isolado nunca define sua evolução." action={<button className="secondary-button"><Plus size={18} /> Novo check-in</button>}>
    <div className="mb-4 grid gap-4 sm:grid-cols-3"><Stat label="Consistência" value="84%" detail="+12% nas últimas 6 semanas" icon={TrendingUp} /><Stat label="Energia percebida" value="8 / 10" detail="Média dos últimos check-ins" icon={Zap} color="var(--gold)" /><Stat label="Treinos" value="14" detail="Com 4 dias de recuperação" icon={Dumbbell} color="var(--coral)" /></div>
    <section className="app-card p-5"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">Tendência</p><h2 className="mt-2 text-lg font-black text-white">Consistência e energia</h2></div><div className="flex rounded-[7px] border border-[var(--border)] bg-[var(--surface)] p-1">{["6 semanas", "3 meses", "1 ano"].map((item) => <button key={item} onClick={() => setPeriod(item)} className={`min-h-9 rounded-[5px] px-3 text-xs font-bold ${period === item ? "bg-[var(--surface-soft)] text-white" : "text-[var(--text-muted)]"}`}>{item}</button>)}</div></div><div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={progressData} margin={{ top: 8, right: 12, left: -28, bottom: 0 }}><CartesianGrid vertical={false} stroke="#26313c" strokeDasharray="3 6" /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#748291", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fill: "#748291", fontSize: 11 }} /><Tooltip contentStyle={{ background: "#151d26", border: "1px solid #344251", borderRadius: 7 }} /><Line type="monotone" dataKey="consistency" name="Consistência" stroke="#b7ff2a" strokeWidth={3} dot={{ fill: "#b7ff2a", r: 3 }} /><Line type="monotone" dataKey="energy" name="Energia" stroke="#22d3ee" strokeWidth={3} dot={{ fill: "#22d3ee", r: 3 }} /></LineChart></ResponsiveContainer></div></section>
    <div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Medidas privadas</p><h2 className="mt-2 text-lg font-black text-white">Último check-in</h2></div><LockKeyhole size={20} className="text-[var(--text-dim)]" /></div><div className="mt-5 grid grid-cols-2 gap-3">{[{ label: "Peso", value: "68,4 kg" }, { label: "Cintura", value: "78 cm" }, { label: "Energia", value: "8 / 10" }, { label: "Sono", value: "7 h 20" }].map((item) => <div key={item.label} className="subtle-card p-4"><p className="text-xs font-bold text-[var(--text-muted)]">{item.label}</p><p className="mt-2 font-black text-white">{item.value}</p></div>)}</div><p className="mt-4 text-xs leading-5 text-[var(--text-dim)]">Visível somente para você. Medidas são opcionais e não afetam XP.</p></section><section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Fotos de progresso</p><h2 className="mt-2 text-lg font-black text-white">Registro visual privado</h2></div><Camera size={20} className="text-[var(--text-dim)]" /></div><div className="mt-5 grid min-h-[180px] place-items-center border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center"><div><Camera className="mx-auto text-[var(--text-dim)]" size={30} /><p className="mt-3 text-sm font-bold text-white">Nenhuma foto neste período</p><p className="mt-1 text-xs text-[var(--text-muted)]">Fotos ficam em armazenamento privado e seguro.</p><button className="secondary-button mt-4"><Plus size={18} /> Adicionar foto</button></div></div></section></div>
  </Screen>;
}

export function AchievementsPage() {
  const unlocked = achievements.filter((item) => item.unlocked).length;
  const toneColor: Record<string, string> = { lime: "var(--lime)", gold: "var(--gold)", cyan: "var(--cyan)", coral: "var(--coral)", green: "var(--green)", violet: "var(--violet)" };
  return <Screen title="Conquistas" description="Marcos que celebram constância, recuperação e cuidado consigo.">
    <section className="mb-4 flex flex-col gap-5 border-y border-[var(--border)] py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow text-[var(--gold)]">Colecao</p><p className="mt-2 text-2xl font-black text-white">{unlocked} de {achievements.length} desbloqueadas</p></div><div className="w-full max-w-md"><div className="mb-2 flex justify-between text-xs font-bold text-[var(--text-muted)]"><span>Progresso geral</span><span>{Math.round((unlocked / achievements.length) * 100)}%</span></div><div className="progress-track"><div className="progress-fill bg-[var(--gold)]" style={{ width: `${(unlocked / achievements.length) * 100}%` }} /></div></div></section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{achievements.map((achievement, index) => { const Icon = achievement.icon; const color = toneColor[achievement.tone]; return <motion.article key={achievement.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`app-card min-h-[190px] p-5 ${achievement.unlocked ? "" : "opacity-55"}`}><div className="flex items-start justify-between"><span className="grid size-14 place-items-center rounded-[8px] border" style={{ color, background: `color-mix(in srgb, ${color} 11%, transparent)`, borderColor: `color-mix(in srgb, ${color} 28%, transparent)` }}><Icon size={28} /></span>{achievement.unlocked ? <Pill tone={achievement.tone as "lime"}>DESBLOQUEADA</Pill> : <LockKeyhole size={18} className="text-[var(--text-dim)]" />}</div><h2 className="mt-5 font-black text-white">{achievement.title}</h2><p className="mt-1.5 text-sm leading-5 text-[var(--text-muted)]">{achievement.detail}</p></motion.article>; })}</div>
  </Screen>;
}

export function ProfilePage() {
  const avatarStage = getCurrentAvatarStage(user.level);
  const nextAvatarStage = getNextAvatarStage(user.level);

  return <Screen title="Perfil" description="Sua identidade e preferências principais no LevelFit." action={<button className="secondary-button"><Pencil size={18} /> Editar perfil</button>}>
    <section className="app-card overflow-hidden"><div className="grid md:grid-cols-[280px_1fr]"><div className="relative min-h-[320px] bg-[#080d12]"><Image src={avatarStage.image} alt={`${avatarStage.name}, avatar atual`} fill priority sizes="280px" className="object-contain object-bottom p-4" /></div><div className="p-5 sm:p-7"><div className="flex flex-wrap items-center gap-2"><Pill><Zap size={14} /> NÍVEL {user.level}</Pill><Pill tone="gold"><Flame size={14} /> {user.streak} DIAS</Pill><Pill tone="cyan"><Sparkles size={14} /> {avatarStage.name}</Pill></div><h2 className="mt-5 text-2xl font-black text-white">{user.name}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{user.email}</p><p className="mt-5 max-w-xl text-sm leading-6 text-[var(--text-muted)]">Construindo força e consistência com uma rotina flexível. O Pulse evolui com XP, missões concluídas e retomadas saudáveis.</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="subtle-card p-4"><p className="eyebrow">XP total</p><p className="mt-2 text-lg font-black text-white">8.640</p></div><div className="subtle-card p-4"><p className="eyebrow">Treinos</p><p className="mt-2 text-lg font-black text-white">46</p></div><div className="subtle-card p-4"><p className="eyebrow">Conquistas</p><p className="mt-2 text-lg font-black text-white">4</p></div></div></div></div></section>

    <section className="mt-4 app-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow text-[var(--cyan)]">Evolução do Pulse</p><h2 className="mt-2 text-lg font-black text-white">Seu companheiro melhora com o tempo</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-muted)]">Pausas não removem upgrades. Elas só adiam o próximo desbloqueio até você voltar para o seu ritmo.</p></div>{nextAvatarStage && <Pill tone="gold"><Sparkles size={14} /> PRÓXIMO: NÍVEL {nextAvatarStage.levelRequired}</Pill>}</div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {avatarStages.map((stage) => {
          const unlocked = user.level >= stage.levelRequired;
          const current = avatarStage.id === stage.id;
          return <article key={stage.id} className={`subtle-card min-h-[150px] p-4 ${unlocked ? "" : "opacity-55"}`}><div className="flex items-center justify-between gap-2"><span className={`grid size-9 place-items-center rounded-[7px] ${current ? "bg-[var(--lime)] text-[var(--lime-ink)]" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}>{unlocked ? <Check size={17} strokeWidth={3} /> : <LockKeyhole size={16} />}</span><span className="text-xs font-black text-[var(--text-dim)]">NÍVEL {stage.levelRequired}</span></div><h3 className="mt-4 text-sm font-black text-white">{stage.name}</h3><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{stage.detail}</p>{current && <p className="mt-3 text-xs font-black text-[var(--lime)]">ATUAL</p>}</article>;
        })}
      </div>
    </section>

    <div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="app-card p-5"><p className="eyebrow">Objetivos atuais</p><div className="mt-4 flex flex-wrap gap-2"><Pill><Target size={14} /> CONSISTÊNCIA</Pill><Pill tone="coral"><Dumbbell size={14} /> FORÇA</Pill><Pill tone="cyan"><GlassWater size={14} /> HIDRATAÇÃO</Pill></div></section><section className="app-card p-5"><p className="eyebrow">Privacidade social</p><div className="mt-4 flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-white">Ranking desativado</p><p className="mt-1 text-xs text-[var(--text-muted)]">Seu progresso não aparece para outras pessoas.</p></div><ShieldCheck className="shrink-0 text-[var(--lime)]" /></div></section></div>
  </Screen>;
}

function SettingsRow({ href, icon: Icon, title, detail, color = "var(--text-muted)" }: { href: string; icon: LucideIcon; title: string; detail: string; color?: string }) {
  return <Link href={href} className="flex min-h-[78px] items-center gap-4 border-b border-[var(--border)] py-3 last:border-0"><span className="grid size-10 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)]" style={{ color }}><Icon size={20} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-white">{title}</strong><span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{detail}</span></span><ChevronRight size={18} className="text-[var(--text-dim)]" /></Link>;
}

export function SettingsPage() {
  return <Screen title="Configurações" description="Controle sua conta, privacidade, unidades e comunicacoes.">
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2"><section className="app-card min-w-0 px-5"><SettingsRow href="/profile" icon={UserRound} title="Perfil e objetivos" detail="Nome, metas, nível de atividade e avatar" /><SettingsRow href="/settings/security" icon={ShieldCheck} title="Segurança da conta" detail="Senha, sessoes e eventos de segurança" color="var(--cyan)" /><SettingsRow href="/settings/notifications" icon={Bell} title="Notificações" detail="Lembretes, resumo semanal e horário silencioso" color="var(--gold)" /></section><section className="app-card min-w-0 px-5"><SettingsRow href="#appearance" icon={Sparkles} title="Aparência" detail="Tema escuro e contraste" color="var(--violet)" /><SettingsRow href="#units" icon={Activity} title="Unidades e idioma" detail="Sistema metrico e portugues do Brasil" color="var(--green)" /><SettingsRow href="#data" icon={Download} title="Dados e privacidade" detail="Exportar dados ou excluir a conta" color="var(--coral)" /></section></div>
    <section className="mt-4 app-card p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-white">Encerrar sessão</p><p className="mt-1 text-sm text-[var(--text-muted)]">Você podera entrar novamente quando quiser.</p></div><Link href="/login" className="secondary-button"><LogOut size={18} /> Sair</Link></div></section>
  </Screen>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" onClick={onChange} role="switch" aria-checked={checked} aria-label={label} className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${checked ? "border-[var(--lime)] bg-[var(--lime)]" : "border-[var(--border-strong)] bg-[var(--surface-soft)]"}`}><span className={`absolute top-1 size-[18px] rounded-full transition-transform ${checked ? "left-1 translate-x-5 bg-[var(--lime-ink)]" : "left-1 translate-x-0 bg-[var(--text-muted)]"}`} /></button>;
}

export function SecurityPage() {
  return <Screen title="Segurança da conta" description="Revise acessos e mantenha seus dados protegidos." action={<Link href="/settings" className="secondary-button"><ArrowLeft size={18} /> Configurações</Link>}>
    <div className="grid gap-4 lg:grid-cols-2"><section className="app-card p-5"><p className="eyebrow">Credenciais</p><div className="mt-4 divide-y divide-[var(--border)]"><div className="flex min-h-[76px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--lime)]"><KeyRound size={20} /></span><div className="flex-1"><p className="text-sm font-bold text-white">Senha</p><p className="mt-1 text-xs text-[var(--text-muted)]">Alterada há 42 dias</p></div><button className="ghost-button">Alterar</button></div><div className="flex min-h-[76px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--cyan)]"><Smartphone size={20} /></span><div className="flex-1"><p className="text-sm font-bold text-white">Autenticação em duas etapas</p><p className="mt-1 text-xs text-[var(--text-muted)]">Protecao adicional opcional</p></div><button className="secondary-button">Ativar</button></div></div></section><section className="app-card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Dispositivos conectados</p><h2 className="mt-2 text-lg font-black text-white">2 sessoes</h2></div><button className="ghost-button text-[var(--danger)]">Sair de todos</button></div><div className="mt-4 divide-y divide-[var(--border)]">{[{ device: "Chrome no Windows", detail: "São Paulo, agora", current: true }, { device: "Safari no iPhone", detail: "São Paulo, há 2 dias", current: false }].map((session) => <div key={session.device} className="flex min-h-[72px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--text-muted)]"><Smartphone size={20} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{session.device}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{session.detail}</p></div>{session.current ? <Pill>ATUAL</Pill> : <button className="ghost-button px-2" aria-label={`Encerrar ${session.device}`} title="Encerrar sessão"><LogOut size={17} /></button>}</div>)}</div></section></div>
    <section className="mt-4 app-card p-5"><p className="eyebrow">Eventos recentes</p><div className="mt-4 divide-y divide-[var(--border)]">{[{ title: "Login reconhecido", detail: "Chrome no Windows", time: "Hoje, 09:12", icon: ShieldCheck, color: "var(--lime)" }, { title: "Senha confirmada", detail: "Verificação de segurança", time: "02 jul, 18:40", icon: LockKeyhole, color: "var(--cyan)" }].map((event) => { const Icon = event.icon; return <div key={event.title} className="flex min-h-[68px] items-center gap-3"><Icon size={19} style={{ color: event.color }} /><div className="flex-1"><p className="text-sm font-bold text-white">{event.title}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{event.detail}</p></div><span className="text-xs text-[var(--text-dim)]">{event.time}</span></div>; })}</div></section>
  </Screen>;
}

export function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState({ email: true, workout: true, water: false, nutrition: false, streak: true, weekly: true });
  function flip(key: keyof typeof prefs) { setPrefs((current) => ({ ...current, [key]: !current[key] })); }
  const rows: { key: keyof typeof prefs; title: string; detail: string; icon: LucideIcon; color: string }[] = [{ key: "email", title: "E-mails do produto", detail: "Controla lembretes e resumos, não segurança.", icon: Mail, color: "var(--cyan)" }, { key: "workout", title: "Lembrete de treino", detail: "No horário escolhido por você.", icon: Dumbbell, color: "var(--coral)" }, { key: "water", title: "Lembrete de água", detail: "Desativado até você definir uma rotina.", icon: GlassWater, color: "var(--cyan)" }, { key: "nutrition", title: "Checklist de alimentação", detail: "Uma lembrança gentil, sem cobrança.", icon: Salad, color: "var(--green)" }, { key: "streak", title: "Streak em risco", detail: "No máximo uma vez por dia.", icon: Flame, color: "var(--gold)" }, { key: "weekly", title: "Resumo semanal", detail: "Domingo às 18:00.", icon: TrendingUp, color: "var(--lime)" }];
  return <Screen title="Preferências de notificação" description="Escolha o que ajuda. Todas as opções de produto podem ser desligadas." action={<Link href="/settings" className="secondary-button"><ArrowLeft size={18} /> Configurações</Link>}>
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_380px]"><section className="app-card min-w-0 px-5">{rows.map(({ key, title, detail, icon: Icon, color }) => <div key={key} className="flex min-h-[82px] min-w-0 items-center gap-3 border-b border-[var(--border)] last:border-0"><span className="grid size-10 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)]" style={{ color }}><Icon size={20} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{title}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{detail}</p></div><Toggle checked={prefs[key]} onChange={() => flip(key)} label={title} /></div>)}</section><aside className="min-w-0 space-y-4"><section className="app-card p-5"><p className="eyebrow">Horário silencioso</p><div className="mt-4 grid grid-cols-2 gap-3"><label className="min-w-0 text-xs font-bold text-[var(--text-muted)]">Início<input className="field mt-2 min-w-0" type="time" defaultValue="22:00" /></label><label className="min-w-0 text-xs font-bold text-[var(--text-muted)]">Fim<input className="field mt-2 min-w-0" type="time" defaultValue="08:00" /></label></div><p className="mt-3 text-xs leading-5 text-[var(--text-dim)]">Lembretes de produto esperam a próxima janela permitida.</p></section><section className="app-card p-5"><p className="eyebrow">Timezone</p><select className="field mt-4" defaultValue="America/Sao_Paulo" aria-label="Timezone"><option value="America/Sao_Paulo">America/Sao_Paulo</option><option value="America/Manaus">America/Manaus</option><option value="America/Recife">America/Recife</option></select><button className="primary-button mt-4 w-full">Salvar preferências</button></section></aside></div>
  </Screen>;
}

export function NotificationsPage() {
  const [read, setRead] = useState(initialNotifications.filter((item) => !item.unread).map((item) => item.id));
  const allRead = read.length === initialNotifications.length;
  return <Screen title="Notificações" description="Atualizações importantes, sem excesso." action={<button onClick={() => setRead(initialNotifications.map((item) => item.id))} className="secondary-button" disabled={allRead}><CheckCircle2 size={18} /> Marcar todas</button>}>
    <section className="app-card px-5"><div className="divide-y divide-[var(--border)]">{initialNotifications.map((notification) => { const Icon = notification.icon; const isRead = read.includes(notification.id); return <button key={notification.id} onClick={() => setRead((items) => isRead ? items : [...items, notification.id])} className="flex min-h-[92px] w-full items-center gap-4 text-left"><span className="relative grid size-11 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--lime)]"><Icon size={21} />{!isRead && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--coral)]" />}</span><div className="min-w-0 flex-1"><p className={`text-sm font-black ${isRead ? "text-[var(--text-muted)]" : "text-white"}`}>{notification.title}</p><p className="mt-1 truncate text-sm text-[var(--text-muted)]">{notification.detail}</p></div><span className="shrink-0 text-xs text-[var(--text-dim)]">{notification.time}</span></button>; })}</div></section>
  </Screen>;
}
