import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  FileSpreadsheet,
  Flag,
  Gauge,
  ListChecks,
  Plus,
  Route,
  Send,
  ShieldCheck,
  Target,
  Timer,
  Upload,
} from "lucide-react";
import {
  runActivity,
  runAthletes,
  runProgramBlocks,
  runSessions,
  runStats,
  runStatusLabel,
  runTimeline,
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

const tafPlanTemplates = [
  { title: "TAF 2 km - iniciante", detail: "Base aeróbica, técnica e progressão sem excesso.", weeks: "8 semanas", level: "Iniciante", focus: "Corrida" },
  { title: "TAF completo PM", detail: "Corrida, flexão, abdominal, barra e mobilidade.", weeks: "12 semanas", level: "Intermediário", focus: "Completo" },
  { title: "Polimento pré-prova", detail: "Redução de carga, ritmo-alvo e confiança.", weeks: "4 semanas", level: "Avançado", focus: "Reta final" },
  { title: "Força para TAF", detail: "Flexão, barra, core e estabilidade para corrida.", weeks: "6 semanas", level: "Todos", focus: "Força" },
] as const;

const tafPlanDays = [
  { day: "Seg", title: "Corrida base", blocks: ["Aquecimento 8 min", "Rodagem leve 30 min", "Mobilidade 6 min"], tone: "cyan" },
  { day: "Ter", title: "Força TAF", blocks: ["Flexão 4 x 8", "Barra assistida 5 x 3", "Abdominal 4 x 20"], tone: "lime" },
  { day: "Qua", title: "Intervalado 2 km", blocks: ["6 x 400 m", "Pausa completa", "Ritmo controlado"], tone: "coral" },
  { day: "Qui", title: "Recuperação", blocks: ["Caminhada leve", "Mobilidade", "Respiração"], tone: "green" },
  { day: "Sex", title: "Avaliação TAF", blocks: ["Aquecimento", "2 km referência", "Registro de tempo"], tone: "gold" },
] as const;

const tafImportRows = [
  { semana: "1", dia: "Segunda", bloco: "Corrida base", volume: "30 min", status: "ok" },
  { semana: "1", dia: "Terça", bloco: "Flexão + abdominal", volume: "4 séries", status: "ok" },
  { semana: "1", dia: "Quarta", bloco: "Intervalado", volume: "6 x 400 m", status: "revisar descanso" },
] as const;

const tafAssignmentTargets = [
  { label: "Grupo TAF PM", value: "12 atletas", detail: "Publicar plano de 8 semanas" },
  { label: "Reta final", value: "5 atletas", detail: "Bloco de 4 semanas" },
  { label: "Iniciantes", value: "7 atletas", detail: "Base e técnica primeiro" },
] as const;

function RunPageHeader() {
  return (
    <header className="mb-6 overflow-hidden rounded-[10px] border border-[rgba(34,211,238,0.2)] bg-[linear-gradient(135deg,rgba(34,211,238,0.11),rgba(16,22,29,0.9)_36%,rgba(255,107,61,0.1))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.26)] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-[var(--cyan)]">LevelFit Run Pro</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">Corrida, TAF e performance</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            Painel para acompanhar atletas, montar planos TAF, controlar carga e preparar avaliações com visão profissional.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/pro/run/agenda" className="secondary-button"><ClipboardList size={18} /> Avaliação TAF</Link>
          <Link href="/pro/run/plans" className="primary-button"><Plus size={18} /> Publicar plano</Link>
        </div>
      </div>
    </header>
  );
}

function RunSubPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 overflow-hidden rounded-[10px] border border-[rgba(34,211,238,0.2)] bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(16,22,29,0.9)_38%,rgba(255,107,61,0.08))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-[var(--cyan)]">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
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
          <h2 className="mt-2 text-xl font-black text-white">Bloco de performance</h2>
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

function TafTemplateCard({ template }: { template: (typeof tafPlanTemplates)[number] }) {
  return (
    <article className="rounded-[9px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-4 transition hover:border-[rgba(183,255,42,0.4)] hover:bg-[rgba(183,255,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[7px] bg-[rgba(183,255,42,0.1)] text-[var(--lime)]">
          <Target size={20} />
        </span>
        <span className="rounded-[5px] bg-[rgba(34,211,238,0.1)] px-2 py-1 text-[0.68rem] font-black uppercase text-[var(--cyan)]">{template.weeks}</span>
      </div>
      <h3 className="mt-4 text-base font-black text-white">{template.title}</h3>
      <p className="mt-2 min-h-10 text-xs leading-5 text-[var(--text-muted)]">{template.detail}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-[5px] bg-[rgba(255,107,61,0.1)] px-2 py-1 text-[0.68rem] font-black uppercase text-[var(--coral)]">{template.level}</span>
        <span className="rounded-[5px] bg-[rgba(250,204,21,0.1)] px-2 py-1 text-[0.68rem] font-black uppercase text-[var(--gold)]">{template.focus}</span>
      </div>
    </article>
  );
}

function TafManualBuilder() {
  return (
    <section className="app-card premium-card p-5" data-reveal>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--lime)]">Criar manualmente</p>
          <h2 className="mt-2 text-xl font-black text-white">Plano TAF de 8 semanas</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">O coach escreve a rotina dentro do painel, ajustando volume, descanso e observações por atleta.</p>
        </div>
        <button className="secondary-button shrink-0"><ListChecks size={18} /> Editar estrutura</button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {tafPlanDays.map((day) => (
          <article key={day.day} className="min-h-[190px] rounded-[9px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-[var(--text-dim)]">{day.day}</span>
              <span className={`grid size-8 place-items-center rounded-[7px] ${toneClass[day.tone]}`}>
                {day.tone === "lime" ? <Dumbbell size={16} /> : day.tone === "gold" ? <Flag size={16} /> : <Route size={16} />}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-black text-white">{day.title}</h3>
            <div className="mt-3 space-y-2">
              {day.blocks.map((block) => (
                <p key={block} className="rounded-[6px] border border-[var(--border)] bg-[rgba(16,22,29,0.72)] px-2 py-2 text-xs font-bold leading-4 text-[var(--text-muted)]">{block}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TafSpreadsheetImport() {
  return (
    <section className="app-card premium-card p-5" data-reveal>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="eyebrow text-[var(--cyan)]">Importar planilha</p>
          <h2 className="mt-2 text-xl font-black text-white">Prévia antes de publicar</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Fluxo preparado para Excel/CSV: o coach importa, revisa inconsistências e só depois publica.</p>
        </div>
        <button className="primary-button shrink-0"><Upload size={18} /> Importar Excel</button>
      </div>

      <div className="mt-5 overflow-hidden rounded-[9px] border border-[var(--border)]">
        <div className="grid grid-cols-[70px_1fr_1.2fr_100px_120px] gap-3 border-b border-[var(--border)] bg-[rgba(34,211,238,0.06)] px-4 py-3 text-xs font-black uppercase text-[var(--text-dim)] max-md:hidden">
          <span>Semana</span><span>Dia</span><span>Bloco</span><span>Volume</span><span>Status</span>
        </div>
        {tafImportRows.map((row) => (
          <article key={`${row.semana}-${row.dia}-${row.bloco}`} className="grid gap-2 border-b border-[var(--border)] px-4 py-3 last:border-0 md:grid-cols-[70px_1fr_1.2fr_100px_120px] md:items-center">
            <span className="text-sm font-black text-white">S{row.semana}</span>
            <span className="text-sm font-bold text-[var(--text-muted)]">{row.dia}</span>
            <span className="text-sm font-black text-white">{row.bloco}</span>
            <span className="text-sm font-bold text-[var(--text-muted)]">{row.volume}</span>
            <span className={`w-fit rounded-[5px] px-2 py-1 text-[0.68rem] font-black uppercase ${row.status === "ok" ? toneClass.green : toneClass.gold}`}>{row.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function TafAssignmentPanel() {
  return (
    <section className="app-card premium-card h-fit p-5" data-reveal>
      <p className="eyebrow text-[var(--gold)]">Publicar para atletas</p>
      <h2 className="mt-2 text-xl font-black text-white">Atribuição rápida</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Depois de criar ou importar, o plano pode ir para grupo, atleta individual ou turma de preparação.</p>
      <div className="mt-5 space-y-3">
        {tafAssignmentTargets.map((target) => (
          <article key={target.label} className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">{target.label}</p>
              <span className="text-xs font-black text-[var(--lime)]">{target.value}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{target.detail}</p>
          </article>
        ))}
      </div>
      <button className="primary-button mt-5 w-full"><Send size={18} /> Publicar plano TAF</button>
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
                <h2 className="mt-2 text-lg font-black text-white">Preparação TAF em ritmo controlado</h2>
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

export function ProRunAthletesPage() {
  const attentionAthletes = runAthletes.filter((athlete) => athlete.status === "attention" || athlete.status === "new");

  return (
    <>
      <RunSubPageHeader
        eyebrow="Carteira Run"
        title="Atletas e alunos"
        description="Acompanhamento de objetivos, prontidão, carga semanal e próximos treinos de corrida ou TAF."
        action={<Link href="/pro/run/agenda" className="primary-button"><Plus size={18} /> Agendar avaliação</Link>}
      />
      <RevealGroup>
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="app-card overflow-hidden" data-reveal>
            <div className="grid gap-3 border-b border-[var(--border)] px-4 py-3 text-xs font-black uppercase text-[var(--text-dim)] md:grid-cols-[minmax(220px,1fr)_118px_170px_120px_170px_32px]">
              <span>Atleta</span><span>Status</span><span>Prontidão</span><span>Melhor 2 km</span><span>Próximo treino</span><span />
            </div>
            {runAthletes.map((athlete) => <AthleteRow key={athlete.id} athlete={athlete} />)}
          </section>

          <section className="app-card premium-card h-fit p-5" data-reveal>
            <p className="eyebrow text-[var(--coral)]">Atenção hoje</p>
            <h2 className="mt-2 text-xl font-black text-white">Ajustes recomendados</h2>
            <div className="mt-4 space-y-3">
              {attentionAthletes.map((athlete) => (
                <article key={athlete.id} className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
                  <div className="flex items-center justify-between gap-2"><p className="text-sm font-black text-white">{athlete.name}</p><StatusPill status={athlete.status} /></div>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{athlete.risk ?? "Criar avaliação inicial e liberar primeiro bloco."}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </RevealGroup>
    </>
  );
}

export function ProRunAgendaPage() {
  return (
    <>
      <RunSubPageHeader
        eyebrow="Agenda Run"
        title="Sessões e avaliações TAF"
        description="Organize treinos presenciais, avaliações TAF e ajustes de carga sem misturar com agendas de outros produtos."
        action={<Link href="/pro/run/plans" className="primary-button"><Plus size={18} /> Criar plano TAF</Link>}
      />
      <RevealGroup className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="app-card overflow-hidden" data-reveal>
          <div className="border-b border-[var(--border)] p-5">
            <p className="eyebrow">Próximos horários</p>
            <h2 className="mt-2 text-xl font-black text-white">Linha do tempo Run</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {runTimeline.map((item) => (
              <article key={`${item.time}-${item.title}`} className="flex min-h-[88px] items-center gap-3 px-4 py-3">
                <span className="grid w-14 shrink-0 place-items-center rounded-[7px] border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-2 text-sm font-black text-white">{item.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-white">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{item.detail}</span>
                </span>
                <span className={`hidden rounded-[5px] px-2 py-1 text-[0.68rem] font-black uppercase sm:inline-flex ${toneClass[item.tone]}`}>Run</span>
              </article>
            ))}
          </div>
        </section>

        <section className="app-card premium-card h-fit p-5" data-reveal>
          <p className="eyebrow text-[var(--cyan)]">Hoje</p>
          <h2 className="mt-2 text-xl font-black text-white">Sessões publicadas</h2>
          <div className="mt-4 space-y-3">
            {runSessions.slice(0, 3).map((session) => (
              <article key={session.id} className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
                <p className="text-sm font-black text-white">{session.title}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{session.duration} · {session.intensity} · {session.athletes} atletas</p>
              </article>
            ))}
          </div>
        </section>
      </RevealGroup>
    </>
  );
}

export function ProRunPlansPage() {
  return (
    <>
      <RunSubPageHeader
        eyebrow="Treinos Run"
        title="Planos TAF"
        description="Crie planos manuais, importe planilhas do coach e publique blocos TAF para atletas ou grupos."
        action={
          <>
            <button className="secondary-button"><FileSpreadsheet size={18} /> Importar planilha</button>
            <button className="primary-button"><Plus size={18} /> Novo plano</button>
          </>
        }
      />
      <RevealGroup className="space-y-5">
        <section className="app-card premium-card p-5" data-reveal>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-[var(--cyan)]">Biblioteca TAF</p>
              <h2 className="mt-2 text-xl font-black text-white">Modelos por objetivo</h2>
            </div>
            <span className="w-fit rounded-[5px] bg-[rgba(34,211,238,0.1)] px-2 py-1 text-xs font-black text-[var(--cyan)]">4 bases prontas</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {tafPlanTemplates.map((template) => <TafTemplateCard key={template.title} template={template} />)}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <TafManualBuilder />
            <TafSpreadsheetImport />
          </div>
          <TafAssignmentPanel />
        </div>
      </RevealGroup>
    </>
  );
}
