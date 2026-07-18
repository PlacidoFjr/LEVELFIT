"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Utensils,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import {
  appointmentStatusLabel,
  appointments,
  getClient,
  planTemplates,
  proActivity,
  proAlerts,
  proClients,
  proStats,
  statusLabel,
  type AlertPriority,
  type AppointmentStatus,
  type ProClient,
  type ProClientStatus,
} from "@/lib/pro-mock-data";
import { AnimatedNumber, AnimatedProgressFill, RevealGroup } from "./premium-motion";

const toneClass = {
  lime: "text-[var(--lime)] bg-[rgba(183,255,42,0.1)]",
  cyan: "text-[var(--cyan)] bg-[rgba(34,211,238,0.1)]",
  green: "text-[var(--green)] bg-[rgba(56,217,121,0.1)]",
  gold: "text-[var(--gold)] bg-[rgba(250,204,21,0.1)]",
  violet: "text-[var(--violet)] bg-[rgba(167,139,250,0.1)]",
  coral: "text-[var(--coral)] bg-[rgba(255,107,61,0.1)]",
} as const;

type ProNotice = {
  tone: keyof typeof toneClass;
  title: string;
  message: string;
};

function ProNoticeBanner({ notice }: { notice: ProNotice | null }) {
  if (!notice) return null;

  return (
    <div className={`mb-5 rounded-[8px] border border-[var(--border)] p-4 ${toneClass[notice.tone]}`} role="status" aria-live="polite">
      <p className="text-sm font-black text-white">{notice.title}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{notice.message}</p>
    </div>
  );
}

function ProPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 rounded-[10px] border border-[rgba(183,255,42,0.16)] bg-[linear-gradient(135deg,rgba(183,255,42,0.09),rgba(16,22,29,0.82)_34%,rgba(34,211,238,0.08))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2 xl:min-w-[300px] xl:justify-end">{action}</div>}
      </div>
    </header>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: LucideIcon; tone: keyof typeof toneClass }) {
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

function ProOperatingStrip() {
  return (
    <section className="mb-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
      <div className="app-card premium-card border-[rgba(183,255,42,0.22)] p-4" data-reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-[var(--lime)]">Ritmo do consultório</p>
            <h2 className="mt-2 text-lg font-black text-white">Aderência média em 74%</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">A carteira está saudável, mas três clientes precisam de contato curto hoje.</p>
          </div>
          <span className="grid size-14 place-items-center rounded-[8px] bg-[rgba(183,255,42,0.12)] text-[var(--lime)]">
            <BarChart3 size={25} />
          </span>
        </div>
      </div>
      <div className="app-card premium-card p-4" data-reveal>
        <p className="eyebrow">Próxima ação</p>
        <p className="mt-2 text-lg font-black text-white">João Lima</p>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Enviar mensagem antes do retorno das 10:30.</p>
      </div>
      <div className="app-card premium-card p-4" data-reveal>
        <p className="eyebrow">Janela crítica</p>
        <p className="mt-2 text-lg font-black text-white">até 18h</p>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Check-ins pendentes devem ser revisados antes do fim do expediente.</p>
      </div>
    </section>
  );
}

function ClientActionCard({ client }: { client: ProClient }) {
  return (
    <section className="app-card premium-card border-[rgba(34,211,238,0.2)] p-5" data-reveal>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-[var(--cyan)]">Próxima ação</p>
          <h2 className="mt-2 text-xl font-black text-white">
            {client.status === "attention" ? "Intervenção leve" : client.status === "new" ? "Criar primeiro plano" : "Reforço positivo"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {client.status === "attention"
              ? "Responder com orientação curta, sem cobrança. O objetivo é remover atrito e retomar registro."
              : client.status === "new"
                ? "Montar plano inicial e liberar checklist simples antes da próxima consulta."
                : "Registrar nota de evolução e enviar reconhecimento pelo bom ritmo da semana."}
          </p>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]">
          <Send size={22} />
        </span>
      </div>
    </section>
  );
}

const planMeals = {
  "base-performance": ["Café reforçado", "Almoço base", "Lanche proteico", "Jantar leve", "Ceia opcional"],
  "rotina-flexivel": ["Café simples", "Almoço livre guiado", "Lanche prático", "Jantar flexível"],
  saciedade: ["Café com proteína", "Almoço completo", "Lanche de saciedade", "Jantar ajustado", "Ceia anti-fome"],
  "corrida-nutricao": ["Pré-treino", "Pós-treino", "Almoço de recuperação", "Lanche energético", "Jantar equilibrado"],
} as const;

function PlanPreviewCard({ plan }: { plan: (typeof planTemplates)[number] }) {
  const meals = planMeals[plan.id as keyof typeof planMeals] ?? ["Café", "Almoço", "Lanche", "Jantar"];
  return (
    <section className="app-card premium-card flex min-h-full flex-col p-5" data-reveal>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-[7px] bg-[rgba(56,217,121,0.1)] text-[var(--green)]">
          <Utensils size={21} />
        </span>
        <span className="rounded-[5px] bg-[rgba(183,255,42,0.1)] px-2 py-1 text-[0.68rem] font-black uppercase text-[var(--lime)]">
          {plan.clients} clientes
        </span>
      </div>
      <h2 className="mt-5 text-lg font-black text-white">{plan.title}</h2>
      <p className="mt-2 text-sm leading-5 text-[var(--text-muted)]">{plan.target}</p>
      <div className="mt-5 space-y-2">
        {meals.map((meal) => (
          <div key={meal} className="flex min-h-10 items-center gap-2 rounded-[7px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] px-3">
            <span className="size-1.5 rounded-full bg-[var(--green)]" />
            <span className="truncate text-xs font-bold text-[var(--text-muted)]">{meal}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-5">
        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="Refeições" value={`${plan.meals}`} />
          <MiniMetric label="Uso" value={`${plan.clients}`} />
        </div>
        <p className="mt-4 text-xs font-bold text-[var(--text-dim)]">{plan.updatedAt}</p>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: ProClientStatus }) {
  const className = {
    active: "border-[rgba(56,217,121,0.28)] bg-[rgba(56,217,121,0.1)] text-[var(--green)]",
    attention: "border-[rgba(250,204,21,0.32)] bg-[rgba(250,204,21,0.1)] text-[var(--gold)]",
    new: "border-[rgba(34,211,238,0.32)] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]",
    paused: "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]",
  }[status];
  return <span className={`rounded-[5px] border px-2 py-1 text-[0.68rem] font-black uppercase ${className}`}>{statusLabel(status)}</span>;
}

function AppointmentPill({ status }: { status: AppointmentStatus }) {
  const className = {
    confirmed: "text-[var(--green)] bg-[rgba(56,217,121,0.1)]",
    pending: "text-[var(--gold)] bg-[rgba(250,204,21,0.1)]",
    done: "text-[var(--cyan)] bg-[rgba(34,211,238,0.1)]",
    cancelled: "text-[var(--danger)] bg-[rgba(244,63,94,0.1)]",
  }[status];
  return <span className={`rounded-[5px] px-2 py-1 text-[0.68rem] font-black uppercase ${className}`}>{appointmentStatusLabel(status)}</span>;
}

function PriorityPill({ priority }: { priority: AlertPriority }) {
  const label = { high: "Alta", medium: "Média", low: "Baixa" }[priority];
  const className = {
    high: "text-[var(--danger)] bg-[rgba(244,63,94,0.12)]",
    medium: "text-[var(--gold)] bg-[rgba(250,204,21,0.12)]",
    low: "text-[var(--cyan)] bg-[rgba(34,211,238,0.12)]",
  }[priority];
  return <span className={`rounded-[5px] px-2 py-1 text-[0.68rem] font-black uppercase ${className}`}>{label}</span>;
}

function ClientAvatar({ client, size = "md" }: { client: ProClient; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-9 text-xs", md: "size-11 text-sm", lg: "size-14 text-base" };
  return <span className={`grid shrink-0 place-items-center rounded-[8px] font-black ${sizes[size]} ${toneClass[client.avatarTone]}`}>{client.initials}</span>;
}

function AdherenceBar({ value, tone = "lime" }: { value: number; tone?: "lime" | "cyan" | "green" | "gold" | "coral" }) {
  const color = {
    lime: "bg-[var(--lime)]",
    cyan: "bg-[var(--cyan)]",
    green: "bg-[var(--green)]",
    gold: "bg-[var(--gold)]",
    coral: "bg-[var(--coral)]",
  }[tone];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
        <span>Aderência</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <AnimatedProgressFill value={value} className={`progress-fill ${color}`} />
      </div>
    </div>
  );
}

function ClientRow({ client }: { client: ProClient }) {
  return (
    <Link href={`/pro/clients/${client.id}`} className="grid gap-3 border-b border-[var(--border)] px-4 py-4 transition-colors last:border-0 hover:bg-[rgba(255,255,255,0.035)] md:grid-cols-[minmax(220px,1.2fr)_120px_170px_120px_150px_36px] md:items-center" data-reveal>
      <div className="flex min-w-0 items-center gap-3">
        <ClientAvatar client={client} />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{client.name}</p>
          <p className="mt-1 truncate text-xs font-bold text-[var(--text-muted)]">{client.goal}</p>
        </div>
      </div>
      <StatusPill status={client.status} />
      <div className="min-w-0"><AdherenceBar value={client.adherence} tone={client.status === "attention" ? "gold" : "lime"} /></div>
      <p className="text-xs font-bold text-[var(--text-muted)]">{client.checkins}</p>
      <p className="text-xs font-bold text-[var(--text-muted)]">{client.lastRecord}</p>
      <ChevronRight className="hidden text-[var(--text-dim)] md:block" size={18} />
    </Link>
  );
}

function AppointmentList({ compact = false }: { compact?: boolean }) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {appointments.map((item) => (
        <Link key={item.id} href={`/pro/clients/${item.clientId}`} className={`flex min-w-0 items-center gap-3 py-3 ${compact ? "" : "px-4"} hover:bg-[rgba(255,255,255,0.025)]`}>
          <span className="grid w-14 shrink-0 place-items-center rounded-[7px] border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-2 text-sm font-black text-white">{item.time}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-black text-white">{item.clientName}</span>
            <span className="mt-1 block truncate text-xs font-bold text-[var(--text-muted)]">{item.dateLabel} · {item.type} · {item.mode}</span>
          </span>
          <AppointmentPill status={item.status} />
        </Link>
      ))}
    </div>
  );
}

function AlertList({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? proAlerts.slice(0, limit) : proAlerts;
  return (
    <div className="divide-y divide-[var(--border)]">
      {items.map((alert) => (
        <Link key={alert.id} href={`/pro/clients/${alert.clientId}`} className="flex min-w-0 items-start gap-3 py-4 hover:bg-[rgba(255,255,255,0.025)]">
          <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-[7px] bg-[rgba(244,63,94,0.1)] text-[var(--danger)]">
            <AlertTriangle size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2"><PriorityPill priority={alert.priority} /><span className="text-xs font-bold text-[var(--text-muted)]">{alert.clientName}</span></span>
            <span className="mt-2 block text-sm font-black text-white">{alert.title}</span>
            <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{alert.detail}</span>
          </span>
          <ChevronRight className="mt-2 shrink-0 text-[var(--text-dim)]" size={18} />
        </Link>
      ))}
    </div>
  );
}

export function ProDashboardPage() {
  const attentionClients = proClients.filter((client) => client.status === "attention" || client.status === "new");

  return (
    <>
      <ProPageHeader
        eyebrow="LevelFit Pro"
        title="Central do nutricionista"
        description="Carteira, retornos, alertas e aderência em um painel único para acompanhamento entre consultas."
        action={<><Link href="/pro/agenda" className="secondary-button"><CalendarClock size={18} /> Ver agenda</Link><Link href="/pro/clients" className="primary-button"><UsersRound size={18} /> Carteira</Link></>}
      />

      <RevealGroup>
        <ProOperatingStrip />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {proStats.map((stat) => <MetricCard key={stat.label} {...stat} />)}
        </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="app-card premium-card p-5" data-reveal>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><p className="eyebrow">Agenda de hoje</p><h2 className="mt-2 text-xl font-black text-white">Retornos e consultas</h2></div>
            <Link href="/pro/agenda" className="ghost-button">Abrir agenda <ArrowRight size={16} /></Link>
          </div>
          <AppointmentList compact />
        </section>

        <section className="app-card premium-card p-5" data-reveal>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><p className="eyebrow">Prioridade</p><h2 className="mt-2 text-xl font-black text-white">Ações recomendadas</h2></div>
            <Link href="/pro/alerts" className="ghost-button">Ver alertas <ArrowRight size={16} /></Link>
          </div>
          <AlertList limit={3} />
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="app-card overflow-hidden" data-reveal>
          <div className="border-b border-[var(--border)] p-5">
            <p className="eyebrow">Clientes em atenção</p>
            <h2 className="mt-2 text-xl font-black text-white">Quem precisa de ação</h2>
          </div>
          {attentionClients.map((client) => <ClientRow key={client.id} client={client} />)}
        </section>

        <section className="app-card premium-card p-5" data-reveal>
          <p className="eyebrow">Atividade recente</p>
          <div className="mt-4 space-y-4">
            {proActivity.map(({ icon: Icon, tone, title, detail }) => (
              <div key={title} className="flex gap-3">
                <span className={`grid size-9 shrink-0 place-items-center rounded-[7px] ${toneClass[tone]}`}><Icon size={18} /></span>
                <div><p className="text-sm font-black text-white">{title}</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>
      </RevealGroup>
    </>
  );
}

export function ProClientsPage() {
  const [notice, setNotice] = useState<ProNotice | null>(null);

  return (
    <>
      <ProPageHeader
        eyebrow="Carteira"
        title="Clientes do nutricionista"
        description="Visão operacional da carteira: status, aderência, último registro, check-ins e próximos retornos."
        action={
          <>
            <button type="button" onClick={() => setNotice({ tone: "cyan", title: "Filtros abertos", message: "Mock: status, aderência e retorno podem ser filtrados aqui." })} className="secondary-button"><MoreHorizontal size={18} /> Filtros</button>
            <button type="button" onClick={() => setNotice({ tone: "lime", title: "Convite Nutri Pro pronto", message: "Envie o código LF-NUTRI-382. O cliente aceita em Profissionais conectados, escolhe as permissões e o evento aparece na Gestão." })} className="primary-button"><Plus size={18} /> Convidar cliente</button>
          </>
        }
      />
      <ProNoticeBanner notice={notice} />
      <section className="app-card overflow-hidden">
        <div className="grid gap-3 border-b border-[var(--border)] px-4 py-3 text-xs font-black uppercase text-[var(--text-dim)] md:grid-cols-[minmax(220px,1.2fr)_120px_170px_120px_150px_36px]">
          <span>Cliente</span><span>Status</span><span>Aderência</span><span>Check-ins</span><span>Último registro</span><span />
        </div>
        {proClients.map((client) => <ClientRow key={client.id} client={client} />)}
      </section>
    </>
  );
}

export function ProClientDetailPage({ clientId }: { clientId: string }) {
  const [notice, setNotice] = useState<ProNotice | null>(null);
  const client = getClient(clientId) ?? proClients[0];
  const clientAppointments = appointments.filter((item) => item.clientId === client.id);

  return (
    <>
      <ProPageHeader
        eyebrow="Cliente"
        title={client.name}
        description={`${client.goal} · ${client.plan}. Dados visíveis conforme permissões autorizadas pelo cliente.`}
        action={
          <>
            <button type="button" onClick={() => setNotice({ tone: "cyan", title: "Nota profissional criada", message: `Mock: nova nota aberta para ${client.name}, sem salvar no banco ainda.` })} className="secondary-button"><MessageSquareText size={18} /> Adicionar nota</button>
            <button type="button" onClick={() => setNotice({ tone: "green", title: "Plano aberto para edição", message: `Mock: ${client.plan} carregado para ajuste de refeições e checklist.` })} className="primary-button"><FileText size={18} /> Editar plano</button>
          </>
        }
      />
      <ProNoticeBanner notice={notice} />

      <RevealGroup>
      <section className="app-card premium-card p-5" data-reveal>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <ClientAvatar client={client} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><StatusPill status={client.status} />{client.riskReason && <span className="rounded-[5px] bg-[rgba(250,204,21,0.1)] px-2 py-1 text-[0.68rem] font-black uppercase text-[var(--gold)]">{client.riskReason}</span>}</div>
              <h2 className="mt-3 text-2xl font-black text-white">{client.plan}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Próximo retorno: {client.nextAppointment}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <MiniMetric label="Aderência" value={`${client.adherence}%`} />
            <MiniMetric label="Água" value={`${client.hydration}%`} />
            <MiniMetric label="Check-ins" value={client.checkins} />
            <MiniMetric label="Sono" value={client.metrics.sleep} />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_390px]">
        <section className="app-card premium-card p-5" data-reveal>
          <p className="eyebrow">Semana</p>
          <h2 className="mt-2 text-xl font-black text-white">Aderência alimentar</h2>
          <div className="mt-6 flex h-44 items-end gap-3">
            {client.week.map((value, index) => (
              <div key={`${value}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end rounded-t-[6px] bg-[var(--surface-soft)]">
                  <div className="w-full rounded-t-[6px] bg-[var(--lime)]" style={{ height: `${value}%` }} />
                </div>
                <span className="text-[0.68rem] font-bold text-[var(--text-muted)]">{["S", "T", "Q", "Q", "S", "S", "D"][index]}</span>
              </div>
            ))}
          </div>
        </section>

        <ClientActionCard client={client} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_390px]">
        <section className="app-card premium-card p-5" data-reveal>
          <p className="eyebrow">Permissões</p>
          <h2 className="mt-2 text-xl font-black text-white">Dados compartilhados</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {client.permissions.map((permission) => <span key={permission} className="rounded-[5px] bg-[rgba(34,211,238,0.1)] px-2 py-1 text-xs font-black text-[var(--cyan)]">{permission}</span>)}
          </div>
          <div className="mt-5 border-l-2 border-[var(--lime)] bg-[rgba(183,255,42,0.06)] p-4">
            <p className="text-sm font-black text-white">Controle do cliente</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Fotos, medidas e registros sensíveis só aparecem se o cliente autorizar.</p>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="app-card premium-card p-5" data-reveal>
          <p className="eyebrow">Hoje</p>
          <h2 className="mt-2 text-xl font-black text-white">Refeições registradas</h2>
          <div className="mt-4 divide-y divide-[var(--border)]">
            {client.meals.map((meal) => <MealRow key={meal.name} {...meal} />)}
          </div>
        </section>

        <section className="app-card premium-card p-5" data-reveal>
          <p className="eyebrow">Histórico</p>
          <h2 className="mt-2 text-xl font-black text-white">Notas profissionais</h2>
          <div className="mt-4 space-y-3">
            {client.notes.map((note) => (
              <article key={`${note.date}-${note.title}`} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-white">{note.title}</p><span className="text-xs font-bold text-[var(--text-dim)]">{note.date}</span></div>
                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{note.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {clientAppointments.length > 0 && <section className="app-card premium-card mt-5 p-5" data-reveal><p className="eyebrow">Retornos</p><AppointmentList compact /></section>}
      </RevealGroup>
    </>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3"><p className="eyebrow">{label}</p><p className="mt-2 text-lg font-black text-white">{value}</p></div>;
}

function MealRow({ name, status, note }: ProClient["meals"][number]) {
  const config = {
    done: { label: "Feito", icon: CheckCircle2, className: "text-[var(--green)]" },
    partial: { label: "Parcial", icon: Sparkles, className: "text-[var(--gold)]" },
    missed: { label: "Ausente", icon: AlertTriangle, className: "text-[var(--danger)]" },
    pending: { label: "Pendente", icon: Clock3, className: "text-[var(--text-muted)]" },
  }[status];
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-3 py-3">
      <span className={`grid size-9 place-items-center rounded-[7px] bg-[var(--surface-soft)] ${config.className}`}><Icon size={18} /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-black text-white">{name}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{note}</p></div>
      <span className={`text-xs font-black uppercase ${config.className}`}>{config.label}</span>
    </div>
  );
}

export function ProAgendaPage() {
  const [notice, setNotice] = useState<ProNotice | null>(null);

  return (
    <>
      <ProPageHeader
        eyebrow="Agenda"
        title="Retornos e consultas"
        description="Agenda simples para organizar retorno presencial, atendimento online, primeira consulta e revisões de plano."
        action={<button type="button" onClick={() => setNotice({ tone: "lime", title: "Retorno criado", message: "Mock: novo horário reservado na agenda do nutricionista." })} className="primary-button"><Plus size={18} /> Novo retorno</button>}
      />
      <ProNoticeBanner notice={notice} />
      <section className="app-card overflow-hidden">
        <div className="border-b border-[var(--border)] p-5">
          <p className="eyebrow">Próximos horários</p>
          <h2 className="mt-2 text-xl font-black text-white">Linha do tempo</h2>
        </div>
        <AppointmentList />
      </section>
    </>
  );
}

export function ProPlansPage() {
  const [notice, setNotice] = useState<ProNotice | null>(null);

  return (
    <>
      <ProPageHeader
        eyebrow="Planos alimentares"
        title="Modelos e planos ativos"
        description="Base inicial para montar planos por refeição, objetivo, rotina e preferências do cliente."
        action={<button type="button" onClick={() => setNotice({ tone: "green", title: "Modelo alimentar iniciado", message: "Mock: estrutura de refeições aberta para criação de um novo modelo." })} className="primary-button"><Plus size={18} /> Novo modelo</button>}
      />
      <ProNoticeBanner notice={notice} />
      <RevealGroup className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-4 md:grid-cols-2">
          {planTemplates.map((plan) => <PlanPreviewCard key={plan.id} plan={plan} />)}
        </div>
        <aside className="app-card premium-card h-fit p-5" data-reveal>
          <p className="eyebrow text-[var(--green)]">Fluxo recomendado</p>
          <h2 className="mt-2 text-xl font-black text-white">Do modelo ao plano individual</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Escolher base", "Parte de um modelo por objetivo e rotina."],
              ["Ajustar restrições", "Preferências, horários, fome, treino e contexto."],
              ["Publicar para cliente", "Cliente recebe checklist e refeições no app."],
              ["Revisar por check-in", "Ajuste fino com dados da semana."],
            ].map(([title, detail], index) => (
              <div key={title} className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-[rgba(183,255,42,0.12)] text-xs font-black text-[var(--lime)]">{index + 1}</span>
                <div>
                  <p className="text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </RevealGroup>
    </>
  );
}

export function ProCheckinsPage() {
  const [notice, setNotice] = useState<ProNotice | null>(null);

  return (
    <>
      <ProPageHeader
        eyebrow="Check-ins"
        title="Respostas da semana"
        description="Fome, energia, sono, hidratação e observações curtas para ajustar planos sem depender de mensagens soltas."
        action={<button type="button" onClick={() => setNotice({ tone: "cyan", title: "Perguntas abertas", message: "Mock: questionário semanal pronto para editar fome, energia, sono e hidratação." })} className="secondary-button"><ClipboardList size={18} /> Configurar perguntas</button>}
      />
      <ProNoticeBanner notice={notice} />
      <section className="app-card overflow-hidden">
        {proClients.map((client) => (
          <Link key={client.id} href={`/pro/clients/${client.id}`} className="grid gap-3 border-b border-[var(--border)] p-4 last:border-0 hover:bg-[rgba(255,255,255,0.025)] md:grid-cols-[minmax(220px,1fr)_100px_100px_100px_130px_32px] md:items-center">
            <div className="flex items-center gap-3"><ClientAvatar client={client} /><div><p className="text-sm font-black text-white">{client.name}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{client.goal}</p></div></div>
            <MiniValue label="Energia" value={client.metrics.energy ? `${client.metrics.energy}/5` : "-"} />
            <MiniValue label="Fome" value={client.metrics.hunger ? `${client.metrics.hunger}/5` : "-"} />
            <MiniValue label="Sono" value={client.metrics.sleep} />
            <MiniValue label="Check-ins" value={client.checkins} />
            <ChevronRight className="hidden text-[var(--text-dim)] md:block" size={18} />
          </Link>
        ))}
      </section>
    </>
  );
}

function MiniValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[0.68rem] font-black uppercase text-[var(--text-dim)]">{label}</p><p className="mt-1 text-sm font-black text-white">{value}</p></div>;
}

export function ProAlertsPage() {
  const [notice, setNotice] = useState<ProNotice | null>(null);

  return (
    <>
      <ProPageHeader
        eyebrow="Alertas"
        title="Ações prioritárias"
        description="Alertas calculados a partir de ausência de registros, check-ins sensíveis, planos pendentes e oportunidades de reforço positivo."
        action={<button type="button" onClick={() => setNotice({ tone: "gold", title: "Regras de alerta abertas", message: "Mock: limites de ausência, queda de aderência e retorno pendente disponíveis para ajuste." })} className="secondary-button"><ShieldCheck size={18} /> Regras de alerta</button>}
      />
      <ProNoticeBanner notice={notice} />
      <section className="app-card p-5">
        <AlertList />
      </section>
    </>
  );
}

export function ProSettingsPage() {
  const [notice, setNotice] = useState<ProNotice | null>(null);

  return (
    <>
      <ProPageHeader
        eyebrow="Configurações"
        title="Preferências do consultório"
        description="Base para identidade profissional, permissões padrão, horários de atendimento e regras de acompanhamento."
        action={<button type="button" onClick={() => setNotice({ tone: "lime", title: "Alterações salvas em mock", message: "Preferências visuais atualizadas. Depois conectamos esse fluxo ao perfil profissional real." })} className="primary-button"><ShieldCheck size={18} /> Salvar alterações</button>}
      />
      <ProNoticeBanner notice={notice} />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="app-card p-5">
          <p className="eyebrow">Perfil profissional</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-black uppercase text-[var(--text-muted)]">Nome público<input className="field mt-2" defaultValue="Dr. Rafael Martins" /></label>
            <label className="text-xs font-black uppercase text-[var(--text-muted)]">Especialidade<input className="field mt-2" defaultValue="Nutrição esportiva" /></label>
            <label className="text-xs font-black uppercase text-[var(--text-muted)]">Cidade<input className="field mt-2" defaultValue="Sua cidade" /></label>
            <label className="text-xs font-black uppercase text-[var(--text-muted)]">Duração padrão do retorno<select className="field mt-2" defaultValue="45"><option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">60 minutos</option></select></label>
          </div>
        </section>
        <section className="app-card p-5">
          <p className="eyebrow">Permissões padrão</p>
          <div className="mt-4 space-y-3">
            {["Alimentação", "Hidratação", "Check-ins", "Medidas corporais", "Fotos privadas"].map((item, index) => (
              <label key={item} className="flex min-h-12 items-center justify-between gap-3 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3">
                <span className="text-sm font-bold text-white">{item}</span>
                <input type="checkbox" defaultChecked={index < 3} className="size-5 accent-[var(--lime)]" />
              </label>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
