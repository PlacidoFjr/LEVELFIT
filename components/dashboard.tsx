"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Plus,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useAuthSession } from "@/lib/auth-client";
import { getCurrentAvatarStage, getNextAvatarStage, getTodaysNutritionPlan, missions, user, weeklyActivity } from "@/lib/mock-data";
import { getUserProgress } from "@/lib/user-progress";
import { PageHeader } from "./page-header";
import { PulseAvatar } from "./pulse-avatar";
import { ProgressRing } from "./progress-ring";

const toneStyles: Record<string, { bg: string; color: string }> = {
  workout: { bg: "rgba(255,107,61,0.12)", color: "var(--coral)" },
  water: { bg: "rgba(34,211,238,0.12)", color: "var(--cyan)" },
  nutrition: { bg: "rgba(56,217,121,0.12)", color: "var(--green)" },
  recovery: { bg: "rgba(167,139,250,0.12)", color: "var(--violet)" },
};

export function Dashboard() {
  const session = useAuthSession();
  const nutritionPlan = useMemo(() => getTodaysNutritionPlan(), []);
  const progress = getUserProgress(session.user);
  const avatarStage = getCurrentAvatarStage(progress.level);
  const nextAvatarStage = getNextAvatarStage(progress.level);
  const displayName = session.user?.displayName || user.name;
  const [completed, setCompleted] = useState<string[]>(["recovery"]);
  const [water, setWater] = useState(1250);
  const [foodDone, setFoodDone] = useState(() => nutritionPlan.items.filter((item) => item.done).map((item) => item.id));
  const [toast, setToast] = useState<string | null>(null);
  const missionProgress = Math.round((completed.length / missions.length) * 100);
  const levelProgress = Math.round((progress.currentXp / progress.nextLevelXp) * 100);
  const waterProgress = Math.min(100, Math.round((water / 2000) * 100));
  const nutritionProgress = Math.round((foodDone.length / nutritionPlan.items.length) * 100);

  const earnedToday = useMemo(
    () => missions.filter((mission) => completed.includes(mission.id)).reduce((sum, mission) => sum + mission.xp, 0),
    [completed],
  );

  function completeMission(id: string, title: string) {
    if (completed.includes(id)) return;
    setCompleted((items) => [...items, id]);
    setToast(`${title} concluída. Bom trabalho.`);
    window.setTimeout(() => setToast(null), 2600);
  }

  function addWater(amount: number) {
    setWater((current) => Math.min(4000, current + amount));
    setToast(`${amount} ml registrados.`);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader title={`Bom dia, ${displayName}`} description="Seu plano está equilibrado. Escolha uma ação pequena e deixe o resto para depois." />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="fixed right-4 top-20 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-[8px] border border-[rgba(183,255,42,0.35)] bg-[#152015] px-4 py-3 text-sm font-bold text-white shadow-2xl lg:right-8 lg:top-8" role="status">
            <span className="grid size-7 place-items-center rounded-full bg-[var(--lime)] text-[var(--lime-ink)]"><Check size={16} strokeWidth={3} /></span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mb-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="app-card overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex min-h-7 items-center gap-1.5 rounded-[6px] bg-[rgba(183,255,42,0.12)] px-2.5 text-xs font-black text-[var(--lime)]"><Zap size={14} fill="currentColor" /> NIVEL {progress.level}</span>
                <span className="inline-flex min-h-7 items-center gap-1.5 rounded-[6px] bg-[rgba(250,204,21,0.1)] px-2.5 text-xs font-black text-[var(--gold)]"><Flame size={14} fill="currentColor" /> {progress.streak} DIAS</span>
              </div>
              <h2 className="text-xl font-black text-white sm:text-2xl">Ritmo forte, sem exagero.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">Você já ganhou <strong className="text-white">{earnedToday} XP</strong> hoje. Um treino curto ou mais um copo de água já deixa o dia completo.</p>
              <div className="mt-5 max-w-xl">
                <div className="mb-2 flex justify-between text-xs font-bold text-[var(--text-muted)]"><span>{progress.levelName}</span><span>{progress.currentXp} / {progress.nextLevelXp} XP</span></div>
                <div className="progress-track h-2.5"><motion.div className="progress-fill bg-[var(--lime)]" initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }} /></div>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <ProgressRing value={missionProgress} label="Missões do dia" />
              <p className="text-xs font-bold text-[var(--text-muted)]">{completed.length} de {missions.length} missões</p>
            </div>
          </div>
        </div>

        <div className="app-card relative min-h-[240px] overflow-hidden bg-[#080d12]">
          <PulseAvatar stage={avatarStage} alt={`${avatarStage.name}, companheiro de treino do LevelFit`} className="absolute inset-0" imageClassName="p-3" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b0f] via-[rgba(8,11,15,0.08)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow text-[var(--cyan)]">{avatarStage.name}</span>
              <span className="rounded-[5px] bg-[rgba(34,211,238,0.12)] px-2 py-1 text-[0.68rem] font-black text-[var(--cyan)]">{avatarStage.personality}</span>
            </div>
            <p className="mt-2 max-w-md text-sm font-bold leading-5 text-white">{avatarStage.activeBenefit}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {avatarStage.perks.slice(0, 2).map((perk) => <span key={perk} className="rounded-[5px] bg-[rgba(183,255,42,0.1)] px-2 py-1 text-[0.68rem] font-black text-[var(--lime)]">{perk}</span>)}
            </div>
            {nextAvatarStage && <p className="mt-3 text-xs font-bold text-[var(--text-muted)]">Próxima evolução no nível {nextAvatarStage.levelRequired}.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="app-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><p className="eyebrow">Missões de hoje</p><h2 className="mt-2 text-lg font-black text-white">Seu caminho mais curto</h2></div>
            <Link href="/missions" className="ghost-button">Ver todas <ChevronRight size={17} /></Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {missions.map((mission) => {
              const done = completed.includes(mission.id);
              const Icon = mission.icon;
              const style = toneStyles[mission.tone];
              return (
                <div key={mission.id} className="flex min-h-[76px] items-center gap-3 py-3 sm:gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[7px]" style={{ background: style.bg, color: style.color }}><Icon size={20} /></span>
                  <div className="min-w-0 flex-1"><p className={`text-sm font-extrabold ${done ? "text-[var(--text-dim)] line-through" : "text-white"}`}>{mission.title}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{mission.detail}</p></div>
                  <span className="hidden text-xs font-black text-[var(--gold)] sm:inline">+{mission.xp} XP</span>
                  <button onClick={() => completeMission(mission.id, mission.title)} disabled={done} className={`grid size-10 shrink-0 place-items-center rounded-[7px] border transition-colors ${done ? "border-[rgba(183,255,42,0.3)] bg-[rgba(183,255,42,0.12)] text-[var(--lime)]" : "border-[var(--border-strong)] text-[var(--text-muted)] hover:border-[var(--lime)] hover:text-[var(--lime)]"}`} aria-label={done ? `${mission.title} concluída` : `Concluir ${mission.title}`} title={done ? "Concluída" : "Marcar como concluída"}>
                    <Check size={18} strokeWidth={3} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="app-card flex flex-col p-5">
          <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-[var(--cyan)]">Hidratação</p><h2 className="mt-2 text-lg font-black text-white">{water.toLocaleString("pt-BR")} ml</h2></div><ProgressRing value={waterProgress} size={78} stroke={7} color="var(--cyan)" label="Meta de água" /></div>
          <div className="progress-track"><motion.div className="progress-fill bg-[var(--cyan)]" animate={{ width: `${waterProgress}%` }} /></div>
          <p className="mt-3 text-sm text-[var(--text-muted)]">Faltam {Math.max(0, 2000 - water).toLocaleString("pt-BR")} ml para sua meta flexivel.</p>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
            <button onClick={() => addWater(250)} className="secondary-button px-2"><Plus size={17} /> 250 ml</button>
            <button onClick={() => addWater(500)} className="secondary-button px-2"><Plus size={17} /> 500 ml</button>
          </div>
        </div>

        <div className="app-card overflow-hidden p-5 xl:col-span-2">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="eyebrow text-[var(--coral)]">Treino do dia</p><h2 className="mt-2 text-xl font-black text-white">Corpo inteiro essencial</h2><p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]"><span className="inline-flex items-center gap-1.5"><Clock3 size={16} /> 28 min</span><span className="inline-flex items-center gap-1.5"><Dumbbell size={16} /> Moderado</span><span>5 exercícios</span></p></div>
            <span className="inline-flex h-8 items-center rounded-[6px] bg-[rgba(255,107,61,0.12)] px-3 text-xs font-black text-[var(--coral)]">+60 XP</span>
          </div>
          <div className="mb-5 grid grid-cols-5 gap-1.5" aria-label="Cinco blocos do treino">
            {[0, 1, 2, 3, 4].map((item) => <span key={item} className={`h-2 rounded-[3px] ${item === 0 ? "bg-[var(--coral)]" : "bg-[#202a34]"}`} />)}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/workouts/session" className="primary-button flex-1 bg-[var(--coral)] text-white hover:bg-[#ff805b]">Começar treino <ArrowRight size={18} /></Link>
            <Link href="/workouts" className="secondary-button">Ver detalhes</Link>
          </div>
        </div>

        <div className="app-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><div className="min-w-0"><p className="eyebrow text-[var(--green)]">Alimentação</p><h2 className="mt-2 truncate text-lg font-black text-white">{nutritionPlan.title}</h2></div><span className="shrink-0 text-sm font-black text-[var(--green)]">{nutritionProgress}%</span></div>
          <div className="space-y-2">
            {nutritionPlan.items.map((item) => {
              const done = foodDone.includes(item.id);
              return <button key={item.id} onClick={() => setFoodDone((current) => done ? current.filter((id) => id !== item.id) : [...current, item.id])} className="flex min-h-10 w-full items-center gap-3 text-left text-sm"><span className={`grid size-6 shrink-0 place-items-center rounded-[5px] border ${done ? "border-[var(--green)] bg-[var(--green)] text-[#052313]" : "border-[var(--border-strong)] text-transparent"}`}><Check size={15} strokeWidth={3} /></span><span className={done ? "text-[var(--text-muted)]" : "text-white"}>{item.label}</span></button>;
            })}
          </div>
          <Link href="/nutrition" className="ghost-button mt-4 w-full">Abrir alimentação <ChevronRight size={17} /></Link>
        </div>

        <div className="app-card min-h-[300px] p-5 xl:col-span-2">
          <div className="mb-4 flex items-start justify-between"><div><p className="eyebrow">Ritmo semanal</p><h2 className="mt-2 text-lg font-black text-white">XP conquistado</h2></div><span className="inline-flex items-center gap-1.5 text-sm font-black text-[var(--lime)]"><Sparkles size={16} /> +14%</span></div>
          <div className="h-[215px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                <defs><linearGradient id="xpArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b7ff2a" stopOpacity={0.35} /><stop offset="100%" stopColor="#b7ff2a" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#26313c" strokeDasharray="3 6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#748291", fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ background: "#151d26", border: "1px solid #344251", borderRadius: 7, color: "#fff" }} labelStyle={{ color: "#aab6c2" }} />
                <Area type="monotone" dataKey="xp" stroke="#b7ff2a" strokeWidth={3} fill="url(#xpArea)" activeDot={{ r: 5, fill: "#b7ff2a", stroke: "#080b0f", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="app-card flex flex-col justify-between p-5">
          <div><p className="eyebrow text-[var(--gold)]">Próxima conquista</p><div className="mt-5 flex items-center gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-[8px] border border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.1)] text-[var(--gold)]"><Trophy size={28} /></span><div><h2 className="font-black text-white">Constância 20</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Faltam 2 dias ativos</p></div></div></div>
          <div className="mt-6"><div className="progress-track"><div className="progress-fill w-[90%] bg-[var(--gold)]" /></div><Link href="/achievements" className="ghost-button mt-3 w-full">Ver conquistas <ChevronRight size={17} /></Link></div>
        </div>
      </section>
    </div>
  );
}
