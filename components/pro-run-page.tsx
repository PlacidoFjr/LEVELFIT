"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarClock,
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
  UsersRound,
} from "lucide-react";
import { useState } from "react";
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

type RunNotice = {
  tone: keyof typeof toneClass;
  title: string;
  message: string;
};

function RunNoticeBanner({ notice }: { notice: RunNotice | null }) {
  if (!notice) return null;

  return (
    <div className={`mb-5 rounded-[8px] border border-[var(--border)] p-4 ${toneClass[notice.tone]}`} role="status" aria-live="polite">
      <p className="text-sm font-black text-white">{notice.title}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{notice.message}</p>
    </div>
  );
}

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
        <div className="grid shrink-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap [&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto">
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
        {action && <div className="grid shrink-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap [&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto">{action}</div>}
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
    <Link href={`/pro/run/athletes/${athlete.id}`} className="grid gap-3 border-b border-[var(--border)] px-4 py-4 transition-colors last:border-0 hover:bg-[rgba(255,255,255,0.035)] md:grid-cols-[minmax(220px,1fr)_118px_170px_120px_170px_32px] md:items-center" data-reveal>
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
    </Link>
  );
}

function SessionCard({ session, onEdit }: { session: RunSession; onEdit?: (session: RunSession) => void }) {
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
      <button type="button" onClick={() => onEdit?.(session)} className="secondary-button mt-5 w-full">Editar bloco <ArrowRight size={17} /></button>
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

function TafTemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: (typeof tafPlanTemplates)[number];
  selected: boolean;
  onSelect: (template: (typeof tafPlanTemplates)[number]) => void;
}) {
  return (
    <article className={`rounded-[9px] border p-4 transition ${selected ? "border-[rgba(183,255,42,0.7)] bg-[rgba(183,255,42,0.08)]" : "border-[var(--border)] bg-[rgba(8,11,15,0.28)] hover:border-[rgba(183,255,42,0.4)] hover:bg-[rgba(183,255,42,0.05)]"}`}>
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
      <button type="button" onClick={() => onSelect(template)} className="secondary-button mt-4 w-full">
        {selected ? "Modelo selecionado" : "Usar modelo"} <ArrowRight size={17} />
      </button>
    </article>
  );
}

function TafManualBuilder({
  selectedTemplate,
  editorOpen,
  onEdit,
}: {
  selectedTemplate: string;
  editorOpen: boolean;
  onEdit: () => void;
}) {
  return (
    <section className="app-card premium-card p-5" data-reveal>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--lime)]">Criar manualmente</p>
          <h2 className="mt-2 text-xl font-black text-white">{selectedTemplate}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">O coach escreve a rotina dentro do painel, ajustando volume, descanso e observações por atleta.</p>
        </div>
        <button type="button" onClick={onEdit} className="secondary-button shrink-0"><ListChecks size={18} /> Editar estrutura</button>
      </div>

      {editorOpen && (
        <div className="mt-5 grid gap-3 rounded-[9px] border border-[rgba(183,255,42,0.32)] bg-[rgba(183,255,42,0.06)] p-4 md:grid-cols-3">
          <MiniMetric label="Duração" value="8 semanas" />
          <MiniMetric label="Frequência" value="5 dias/semana" />
          <MiniMetric label="Foco" value="2 km + força" />
        </div>
      )}

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

function TafSpreadsheetImport({ imported, onImport }: { imported: boolean; onImport: () => void }) {
  return (
    <section className="app-card premium-card p-5" data-reveal>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="eyebrow text-[var(--cyan)]">Importar planilha</p>
          <h2 className="mt-2 text-xl font-black text-white">Prévia antes de publicar</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Fluxo preparado para Excel/CSV: o coach importa, revisa inconsistências e só depois publica.</p>
        </div>
        <button type="button" onClick={onImport} className="primary-button shrink-0"><Upload size={18} /> {imported ? "Planilha importada" : "Importar Excel"}</button>
      </div>

      {imported && (
        <div className="mt-5 rounded-[8px] border border-[rgba(56,217,121,0.28)] bg-[rgba(56,217,121,0.08)] p-3">
          <p className="text-sm font-black text-white">Arquivo validado: taf_semana_01.xlsx</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">3 linhas reconhecidas, 1 ponto para revisar e nenhum bloqueio para publicação.</p>
        </div>
      )}

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

function TafAssignmentPanel({
  selectedTemplate,
  published,
  onPublish,
}: {
  selectedTemplate: string;
  published: boolean;
  onPublish: () => void;
}) {
  return (
    <section className="app-card premium-card h-fit p-5" data-reveal>
      <p className="eyebrow text-[var(--gold)]">Publicar para atletas</p>
      <h2 className="mt-2 text-xl font-black text-white">Atribuição rápida</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Depois de criar ou importar, o plano pode ir para grupo, atleta individual ou turma de preparação.</p>
      <div className="mt-5 space-y-3">
        <article className="rounded-[8px] border border-[rgba(34,211,238,0.26)] bg-[rgba(34,211,238,0.08)] p-3">
          <p className="text-xs font-black uppercase text-[var(--cyan)]">Plano selecionado</p>
          <p className="mt-1 text-sm font-black text-white">{selectedTemplate}</p>
        </article>
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
      <button type="button" onClick={onPublish} className="primary-button mt-5 w-full"><Send size={18} /> {published ? "Plano publicado" : "Publicar plano TAF"}</button>
      {published && <p className="mt-3 text-xs font-bold leading-5 text-[var(--green)]">Mock: plano enviado para os grupos selecionados e pronto para aparecer no app do atleta.</p>}
    </section>
  );
}

export function ProRunPage() {
  const [notice, setNotice] = useState<RunNotice | null>(null);

  return (
    <>
      <RunPageHeader />
      <RunNoticeBanner notice={notice} />
      <RevealGroup>
        <section className="hidden">
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

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="app-card premium-card p-5" data-reveal>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="eyebrow text-[var(--cyan)]">Painel do coach</p>
                <h2 className="mt-2 text-2xl font-black text-white">TAF sem poluir a tela</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Resumo para decidir rápido. Carteira, agenda e planilhas continuam separadas nas abas do Run Pro.</p>
              </div>
              <Link href="/pro/run/plans" className="primary-button shrink-0"><Plus size={18} /> Montar plano</Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {runAthletes.filter((athlete) => athlete.status === "attention" || athlete.status === "new").slice(0, 3).map((athlete) => (
                <Link key={athlete.id} href={`/pro/run/athletes/${athlete.id}`} className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-4 transition hover:border-[rgba(34,211,238,0.45)]">
                  <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-black text-white">{athlete.name}</p><StatusPill status={athlete.status} /></div>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{athlete.risk ?? athlete.nextSession}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="app-card premium-card p-5" data-reveal>
            <p className="eyebrow text-[var(--gold)]">Hoje</p>
            <h2 className="mt-2 text-xl font-black text-white">Próximo treino</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{runTimeline[0]?.title ?? "Sem treino"} - {runTimeline[0]?.detail ?? "Organize a agenda Run."}</p>
            <Link href="/pro/run/agenda" className="secondary-button mt-5 w-full"><CalendarClock size={18} /> Abrir agenda</Link>
          </section>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/pro/run/athletes", title: "Atletas", detail: "Carteira e perfil", icon: UsersRound, tone: "lime" as const },
            { href: "/pro/run/plans", title: "Planos TAF", detail: "Planilhas e blocos", icon: FileSpreadsheet, tone: "cyan" as const },
            { href: "/pro/run/agenda", title: "Agenda", detail: "Treinos e avaliações", icon: CalendarClock, tone: "gold" as const },
            { href: "/pro/run/messages", title: "Mensagens", detail: "Toques do coach", icon: Send, tone: "coral" as const },
          ].map(({ href, title, detail, icon: Icon, tone }) => (
            <Link key={href} href={href} className="app-card premium-card p-5 transition hover:-translate-y-0.5 hover:border-[rgba(34,211,238,0.45)]" data-reveal>
              <span className={`grid size-11 place-items-center rounded-[7px] ${toneClass[tone]}`}><Icon size={21} /></span>
              <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
              <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">{detail}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--cyan)]">Abrir <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>

        <div className="hidden">
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

        <div className="hidden">
          <WeekProgram />
        </div>

        <div className="hidden">
          {runSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={(selectedSession) => setNotice({
                tone: "cyan",
                title: "Bloco aberto para edição",
                message: `${selectedSession.title} foi carregado no editor mockado. No backend real, aqui salvaremos volume, descanso e observações do coach.`,
              })}
            />
          ))}
        </div>
      </RevealGroup>
    </>
  );
}

export function ProRunAthletesPage() {
  const [notice, setNotice] = useState<RunNotice | null>(null);
  const attentionAthletes = runAthletes.filter((athlete) => athlete.status === "attention" || athlete.status === "new");

  return (
    <>
      <RunSubPageHeader
        eyebrow="Carteira Run"
        title="Atletas e alunos"
        description="Acompanhamento de objetivos, prontidão, carga semanal e próximos treinos de corrida ou TAF."
        action={
          <>
            <button type="button" onClick={() => setNotice({ tone: "lime", title: "Convite Run Pro pronto", message: "Envie o código LF-TAF-284. O aluno aceita em Profissionais conectados, escolhe as permissões e o evento aparece na Gestão." })} className="secondary-button"><Plus size={18} /> Convidar atleta</button>
            <Link href="/pro/run/agenda" className="primary-button"><Plus size={18} /> Agendar avaliação</Link>
          </>
        }
      />
      <RunNoticeBanner notice={notice} />
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
            <div className="hidden">
              <p className="eyebrow text-[var(--cyan)]">Convite Run Pro</p>
              <h3 className="mt-2 text-lg font-black text-white">Código do coach</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                Use esse fluxo para conectar aluno/atleta ao Run Pro. O aluno confirma no app, escolhe permissões e a Gestão acompanha o evento.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="rounded-[7px] border border-[var(--border)] bg-[rgba(8,11,15,0.48)] px-3 py-2 text-sm font-black text-[var(--cyan)]">LF-TAF-284</code>
                <button type="button" onClick={() => setNotice({ tone: "lime", title: "Convite Run Pro pronto", message: "Envie o código LF-TAF-284. O aluno aceita em Profissionais conectados, escolhe as permissões e o evento aparece na Gestão." })} className="secondary-button justify-center">
                  <Send size={17} /> Preparar convite
                </button>
              </div>
            </div>
          </section>
        </div>
      </RevealGroup>
    </>
  );
}

export function ProRunAthleteDetailPage({ athleteId }: { athleteId: string }) {
  const [notice, setNotice] = useState<RunNotice | null>(null);
  const athlete = runAthletes.find((item) => item.id === athleteId) ?? runAthletes[0];

  return (
    <>
      <RunSubPageHeader
        eyebrow="Perfil do atleta"
        title={athlete.name}
        description={`${athlete.objective}. Fase atual: ${athlete.phase}.`}
        action={
          <>
            <button type="button" onClick={() => setNotice({ tone: "cyan", title: "Mensagem preparada", message: `Mock: toque curto pronto para ${athlete.name}.` })} className="secondary-button"><Send size={18} /> Enviar toque</button>
            <button type="button" onClick={() => setNotice({ tone: "lime", title: "Treino ajustado", message: `Mock: rotina de ${athlete.name} aberta para ajustar volume, descanso e observacoes.` })} className="primary-button"><ListChecks size={18} /> Ajustar treino</button>
          </>
        }
      />
      <RunNoticeBanner notice={notice} />
      <RevealGroup>
        <section className="app-card premium-card p-5" data-reveal>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <AthleteAvatar athlete={athlete} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><StatusPill status={athlete.status} />{athlete.risk && <span className="rounded-[5px] bg-[rgba(255,107,61,0.12)] px-2 py-1 text-[0.68rem] font-black uppercase text-[var(--coral)]">{athlete.risk}</span>}</div>
                <h2 className="mt-3 text-2xl font-black text-white">{athlete.nextSession}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Ultimo check-in: {athlete.lastCheckin}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[520px]">
              <MiniMetric label="Prontidao" value={`${athlete.readiness}%`} />
              <MiniMetric label="Carga semanal" value={athlete.weeklyLoad} />
              <MiniMetric label="Melhor 2 km" value={athlete.bestTwoKm} />
              <MiniMetric label="Fase" value={athlete.phase} />
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
          <section className="app-card premium-card p-5" data-reveal>
            <p className="eyebrow text-[var(--cyan)]">Evolucao semanal</p>
            <h2 className="mt-2 text-xl font-black text-white">Prontidao e constancia</h2>
            <div className="mt-6 flex h-44 items-end gap-3">
              {athlete.week.map((value, index) => (
                <div key={`${value}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end rounded-t-[6px] bg-[var(--surface-soft)]">
                    <div className="w-full rounded-t-[6px] bg-[var(--cyan)]" style={{ height: `${value}%` }} />
                  </div>
                  <span className="text-[0.68rem] font-bold text-[var(--text-muted)]">{["S", "T", "Q", "Q", "S", "S", "D"][index]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="app-card premium-card p-5" data-reveal>
            <p className="eyebrow text-[var(--gold)]">Proxima acao</p>
            <h2 className="mt-2 text-xl font-black text-white">{athlete.status === "attention" ? "Reduzir carga" : athlete.status === "new" ? "Fazer triagem" : "Manter progressao"}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {athlete.status === "attention"
                ? "Troque intensidade por base leve e acompanhe sintomas antes de novo bloco forte."
                : athlete.status === "new"
                  ? "Coletar objetivo, historico e disponibilidade antes de publicar a primeira semana."
                  : "Manter plano atual e revisar evolucao no proximo check-in."}
            </p>
          </section>
        </div>

        <section className="app-card premium-card mt-5 p-5" data-reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[var(--lime)]">Plano TAF</p>
              <h2 className="mt-2 text-xl font-black text-white">Semana publicada</h2>
            </div>
            <Link href="/pro/run/plans" className="secondary-button"><FileSpreadsheet size={18} /> Abrir modelos</Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {runProgramBlocks.map((block) => (
              <article key={block.label} className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
                <p className="text-xs font-black uppercase text-[var(--text-dim)]">{block.label}</p>
                <p className="mt-3 text-sm font-black text-white">{block.title}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{block.detail}</p>
              </article>
            ))}
          </div>
        </section>
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>(tafPlanTemplates[0].title);
  const [editorOpen, setEditorOpen] = useState(false);
  const [imported, setImported] = useState(false);
  const [published, setPublished] = useState(false);
  const [notice, setNotice] = useState<RunNotice | null>(null);

  function selectTemplate(template: (typeof tafPlanTemplates)[number]) {
    setSelectedTemplate(template.title);
    setEditorOpen(true);
    setPublished(false);
    setNotice({
      tone: "lime",
      title: "Modelo carregado",
      message: `${template.title} foi aplicado ao editor manual. Agora o coach pode ajustar dias, volume e observações.`,
    });
  }

  function createNewPlan() {
    setSelectedTemplate("Novo plano TAF personalizado");
    setEditorOpen(true);
    setPublished(false);
    setNotice({
      tone: "cyan",
      title: "Novo plano iniciado",
      message: "Estrutura mockada aberta para o coach montar a rotina TAF do zero.",
    });
  }

  function importSpreadsheet() {
    setImported(true);
    setEditorOpen(true);
    setPublished(false);
    setNotice({
      tone: "green",
      title: "Planilha importada",
      message: "Prévia carregada com validação de semanas, blocos e volumes. No backend real, aqui entra o parser Excel/CSV.",
    });
  }

  function publishPlan() {
    setPublished(true);
    setNotice({
      tone: "gold",
      title: "Plano publicado em mock",
      message: `${selectedTemplate} foi atribuído aos grupos selecionados para demonstração.`,
    });
  }

  return (
    <>
      <RunSubPageHeader
        eyebrow="Treinos Run"
        title="Planos TAF"
        description="Crie planos manuais, importe planilhas do coach e publique blocos TAF para atletas ou grupos."
        action={
          <>
            <button type="button" onClick={importSpreadsheet} className="secondary-button"><FileSpreadsheet size={18} /> Importar planilha</button>
            <button type="button" onClick={createNewPlan} className="primary-button"><Plus size={18} /> Novo plano</button>
          </>
        }
      />
      <RunNoticeBanner notice={notice} />
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
            {tafPlanTemplates.map((template) => (
              <TafTemplateCard
                key={template.title}
                template={template}
                selected={selectedTemplate === template.title}
                onSelect={selectTemplate}
              />
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <TafManualBuilder
              selectedTemplate={selectedTemplate}
              editorOpen={editorOpen}
              onEdit={() => {
                setEditorOpen((open) => !open);
                setNotice({
                  tone: "cyan",
                  title: editorOpen ? "Editor compacto" : "Editor expandido",
                  message: editorOpen ? "Os parâmetros foram recolhidos para leitura rápida." : "Parâmetros principais abertos para ajuste visual do plano.",
                });
              }}
            />
            <TafSpreadsheetImport imported={imported} onImport={importSpreadsheet} />
          </div>
          <TafAssignmentPanel selectedTemplate={selectedTemplate} published={published} onPublish={publishPlan} />
        </div>
      </RevealGroup>
    </>
  );
}
