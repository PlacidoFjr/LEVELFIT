import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Flag,
  Gauge,
  Plus,
  Route,
  ShieldCheck,
  Timer,
} from "lucide-react";
import {
  runActivity,
  runAthletes,
  runProgramBlocks,
  runSessions,
  runStats,
  runStatusLabel,
  type RunAthlete,
  type RunAthleteStatus,
  type RunSession,
} from "@/lib/pro-run-mock-data";
import { AnimatedNumber, AnimatedProgressFill, RevealGroup } from "./premium-motion";

const toneClass = {
  lime: "text-[var(--lime)] bg-[rgba(183,255,42,0.1)]",
  cyan: "text-[var(--cyan)] bg-[rgba(34,211,238,0.1)]",
  green: "text-[var(--green)] bg-[rgba(56,217,121,0.1)]",
  gold: "text-[var(--gold)] bg-[rgba(250,204,21,0.1)]",
  violet: "text-[var(--violet)] bg-[rgba(167,139,250,0.1)]",
  coral: "text-[var(--coral)] bg-[rgba(255,107,61,0.1)]",
} as const;

function RunPageHeader() {
  return (
    <header className="mb-6 overflow-hidden rounded-[10px] border border-[rgba(34,211,238,0.2)] bg-[linear-gradient(135deg,rgba(34,211,238,0.11),rgba(16,22,29,0.9)_36%,rgba(255,107,61,0.1))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.26)] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-[var(--cyan)]">LevelFit Run Pro</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">Corrida, TAF e performance</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            Painel para acompanhar atletas, montar treinos de corrida, controlar carga e preparar simulados sem usar GPS nesta fase.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button className="secondary-button"><ClipboardList size={18} /> Novo simulado</button>
          <button className="primary-button"><Plus size={18} /> Publicar treino</button>
        </div>
      </div>
    </header>
  );
}

function RunMetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: LucideIcon; tone: keyof typeof toneClass }) {
  const numericValue = Number(value.replace(/\D/g, ""));
  return (
    <section className="app-card premium-card relative overflow-hidden p-4" data-reveal>
      <span className={`absolute inset-x-0 top-0 h-1 ${tone === "lime" ? "bg-[var(--lime)]" : tone === "cyan" ? "bg-[var(--cyan)]" : tone === "green" ? "bg-[var(--green)]" : tone === "gold" ? "bg-[var(--gold)]" : tone === "violet" ? "bg-[var(--violet)]" : "bg-[var(--coral)]"}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="mt-3 text-2xl font-black text-white">
            {Number.isFinite(numericValue) ? <AnimatedNumber value={numericValue} /> : value}
          </p>
          <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{detail}</p>
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-[7px] ${toneClass[tone]}`}>
          <Icon size={21} />
        </span>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: RunAthleteStatus }) {
  const className = {
    ready: "border-[rgba(56,217,121,0.28)] bg-[rgba(56,217,121,0.1)] text-[var(--green)]",
    attention: "border-[rgba(255,107,61,0.34)] bg-[rgba(255,107,61,0.1)] text-[var(--coral)]",
    building: "border-[rgba(34,211,238,0.32)] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]",
    new: "border-[rgba(250,204,21,0.32)] bg-[rgba(250,204,21,0.1)] text-[var(--gold)]",
  }[status];
  return <span className={`rounded-[5px] border px-2 py-1 text-[0.68rem] font-black uppercase ${className}`}>{runStatusLabel(status)}</span>;
}

function AthleteAvatar({ athlete }: { athlete: RunAthlete }) {
  const tone = athlete.status === "ready" ? "green" : athlete.status === "attention" ? "coral" : athlete.status === "new" ? "gold" : "cyan";
  return <span className={`grid size-11 shrink-0 place-items-center rounded-[8px] text-sm font-black ${toneClass[tone]}`}>{athlete.initials}</span>;
}

function ReadinessBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-[var(--green)]" : value >= 60 ? "bg-[var(--cyan)]" : value >= 40 ? "bg-[var(--gold)]" : "bg-[var(--coral)]";
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
        <span>Prontidão</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <AnimatedProgressFill value={value} className={`progress-fill ${color}`} />
      </div>
    </div>
  );
}

function AthleteRow({ athlete }: { athlete: RunAthlete }) {
  return (
    <article className="grid gap-3 border-b border-[var(--border)] px-4 py-4 last:border-0 md:grid-cols-[minmax(220px,1fr)_118px_170px_120px_170px_32px] md:items-center" data-reveal>
      <div className="flex min-w-0 items-center gap-3">
        <AthleteAvatar athlete={athlete} />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{athlete.name}</p>
          <p className="mt-1 truncate text-xs font-bold text-[var(--text-muted)]">{athlete.objective}</p>
        </div>
      </div>
      <StatusPill status={athlete.status} />
      <ReadinessBar value={athlete.readiness} />
      <div>
        <p className="text-xs font-black uppercase text-[var(--text-dim)]">2 km</p>
        <p className="mt-1 text-sm font-black text-white">{athlete.bestTwoKm}</p>
      </div>
      <p className="text-xs font-bold text-[var(--text-muted)]">{athlete.nextSession}</p>
      <ChevronRight className="hidden text-[var(--text-dim)] md:block" size={18} />
    </article>
  );
}

function SessionCard({ session }: { session: RunSession }) {
  const iconConfig = {
    base: { icon: Route, tone: "cyan" },
    interval: { icon: Timer, tone: "coral" },
    strength: { icon: Gauge, tone: "lime" },
    test: { icon: Flag, tone: "gold" },
    recovery: { icon: ShieldCheck, tone: "green" },
  } as const;
  const config = iconConfig[session.type];
  const Icon = config.icon;

  return (
    <section className="app-card premium-card flex min-h-full flex-col p-5" data-reveal>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-11 place-items-center rounded-[7px] ${toneClass[config.tone]}`}>
          <Icon size={21} />
        </span>
        <span className="rounded-[5px] bg-[rgba(183,255,42,0.1)] px-2 py-1 text-[0.68rem] font-black uppercase text-[var(--lime)]">
          {session.athletes} atletas
        </span>
      </div>
      <h2 className="mt-5 text-lg font-black text-white">{session.title}</h2>
      <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">{session.target}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniMetric label="Duração" value={session.duration} />
        <MiniMetric label="Intensidade" value={session.intensity} />
      </div>
      <button className="secondary-button mt-5 w-full">Editar bloco <ArrowRight size={17} /></button>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function WeekProgram() {
  return (
    <section className="app-card premium-card p-5" data-reveal>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-[var(--cyan)]">Semana de treino</p>
          <h2 className="mt-2 text-xl font-black text-white">Bloco TAF sem GPS</h2>
        </div>
        <span className="rounded-[5px] bg-[rgba(34,211,238,0.1)] px-2 py-1 text-xs font-black text-[var(--cyan)]">5 dias</span>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {runProgramBlocks.map((block) => (
          <article key={block.label} className={`min-h-[150px] rounded-[8px] border p-3 ${block.done ? "border-[rgba(183,255,42,0.28)] bg-[rgba(183,255,42,0.06)]" : "border-[var(--border)] bg-[rgba(8,11,15,0.28)]"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[var(--text-dim)]">{block.label}</span>
              {block.done ? <CheckCircle2 className="text-[var(--lime)]" size={18} /> : <span className="size-2 rounded-full bg-[var(--border-strong)]" />}
            </div>
            <p className="mt-5 text-sm font-black text-white">{block.title}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{block.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProRunPage() {
  return (
    <>
      <RunPageHeader />
      <RevealGroup>
        <section className="mb-5 grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
          <div className="app-card premium-card border-[rgba(34,211,238,0.24)] p-4" data-reveal>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-[var(--cyan)]">Operação Run</p>
                <h2 className="mt-2 text-lg font-black text-white">Preparacao TAF em ritmo controlado</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Foco em consistência, recuperação e evolução por bloco. Sem pressão tóxica e sem prometer resultado.</p>
              </div>
              <span className="grid size-14 place-items-center rounded-[8px] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]">
                <Route size={25} />
              </span>
            </div>
          </div>
          <div className="app-card premium-card p-4" data-reveal>
            <p className="eyebrow">Próxima decisão</p>
            <p className="mt-2 text-lg font-black text-white">Rafael Costa</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Reduzir impacto e trocar intervalado por rodagem leve.</p>
          </div>
          <div className="app-card premium-card p-4" data-reveal>
            <p className="eyebrow">Janela do dia</p>
            <p className="mt-2 text-lg font-black text-white">18:30</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Treino principal do grupo TAF publicado para hoje.</p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {runStats.map((stat) => <RunMetricCard key={stat.label} {...stat} />)}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_390px]">
          <section className="app-card overflow-hidden" data-reveal>
            <div className="border-b border-[var(--border)] p-5">
              <p className="eyebrow">Carteira Run</p>
              <h2 className="mt-2 text-xl font-black text-white">Atletas e alunos</h2>
            </div>
            {runAthletes.map((athlete) => <AthleteRow key={athlete.id} athlete={athlete} />)}
          </section>

          <section className="app-card premium-card p-5" data-reveal>
            <p className="eyebrow text-[var(--gold)]">Linha do dia</p>
            <h2 className="mt-2 text-xl font-black text-white">Prioridades</h2>
            <div className="mt-4 space-y-3">
              {runActivity.map(({ icon: Icon, tone, title, detail }) => (
                <div key={title} className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.26)] p-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-[7px] ${toneClass[tone]}`}><Icon size={18} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5">
          <WeekProgram />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {runSessions.map((session) => <SessionCard key={session.id} session={session} />)}
        </div>
      </RevealGroup>
    </>
  );
}
