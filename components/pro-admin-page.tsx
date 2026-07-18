"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LockKeyhole,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAdminOverview, type AdminOverview } from "@/lib/level-fit-api";
import {
  adminStats,
  adminTimeline,
  ownerChecklist,
  productWorkspaces,
  workspaceStatusLabel,
  type WorkspaceStatus,
} from "@/lib/pro-admin-mock-data";
import { AnimatedNumber, AnimatedProgressFill, RevealGroup } from "./premium-motion";

const toneClass = {
  lime: "text-[var(--lime)] bg-[rgba(183,255,42,0.1)]",
  cyan: "text-[var(--cyan)] bg-[rgba(34,211,238,0.1)]",
  green: "text-[var(--green)] bg-[rgba(56,217,121,0.1)]",
  gold: "text-[var(--gold)] bg-[rgba(250,204,21,0.1)]",
  violet: "text-[var(--violet)] bg-[rgba(167,139,250,0.1)]",
  coral: "text-[var(--coral)] bg-[rgba(255,107,61,0.1)]",
} as const;

type AdminStatUi = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: keyof typeof toneClass;
};

type AdminTimelineUi = {
  icon: LucideIcon;
  tone: keyof typeof toneClass;
  title: string;
  detail: string;
};

const statIcons = [UsersRound, BarChart3, ShieldCheck, LockKeyhole];
const timelineIcons = [CheckCircle2, BarChart3, LockKeyhole, ShieldCheck];

function AdminNotice({ message, title = "Relatório preparado" }: { message: string | null; title?: string }) {
  if (!message) return null;

  return (
    <div className="mb-5 rounded-[8px] border border-[rgba(167,139,250,0.24)] bg-[rgba(167,139,250,0.08)] p-4" role="status" aria-live="polite">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

function AdminHeader({ loading, onRefresh }: { loading: boolean; onRefresh: () => void }) {
  return (
    <header className="mb-6 overflow-hidden rounded-[10px] border border-[rgba(167,139,250,0.2)] bg-[linear-gradient(135deg,rgba(167,139,250,0.12),rgba(16,22,29,0.9)_34%,rgba(183,255,42,0.08))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.26)] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-[var(--violet)]">LevelFit Owner</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">Gestão geral do produto</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            Visão para acompanhar uso, profissionais, pilotos e pendências antes de abrir o produto para mais clientes.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={onRefresh} disabled={loading} className="secondary-button disabled:opacity-60"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Atualizar dados</button>
          <Link href="/pro" className="secondary-button"><ShieldCheck size={18} /> Nutri Pro</Link>
          <Link href="/pro/run" className="primary-button"><Plus size={18} /> Run Pro</Link>
        </div>
      </div>
    </header>
  );
}

function AdminMetricCard({ label, value, detail, icon: Icon, tone }: AdminStatUi) {
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

function StatusPill({ status }: { status: WorkspaceStatus }) {
  const className = {
    healthy: "border-[rgba(56,217,121,0.28)] bg-[rgba(56,217,121,0.1)] text-[var(--green)]",
    attention: "border-[rgba(250,204,21,0.32)] bg-[rgba(250,204,21,0.1)] text-[var(--gold)]",
    setup: "border-[rgba(34,211,238,0.32)] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]",
  }[status];
  return <span className={`rounded-[5px] border px-2 py-1 text-[0.68rem] font-black uppercase ${className}`}>{workspaceStatusLabel(status)}</span>;
}

function WorkspaceCard({ workspace }: { workspace: AdminOverview["workspaces"][number] | (typeof productWorkspaces)[number] }) {
  return (
    <section className="app-card premium-card p-5" data-reveal>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <StatusPill status={workspace.status} />
          <h2 className="mt-4 text-xl font-black text-white">{workspace.title}</h2>
          <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{workspace.owner}</p>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-[rgba(167,139,250,0.1)] text-[var(--violet)]">
          <Sparkles size={22} />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniMetric label="Usuários" value={`${workspace.users}`} />
        <MiniMetric label="Hoje" value={`${workspace.activeToday}`} />
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
          <span>Retenção piloto</span>
          <span>{workspace.retention}%</span>
        </div>
        <div className="progress-track">
          <AnimatedProgressFill value={workspace.retention} className="progress-fill bg-[var(--lime)]" />
        </div>
      </div>

      <div className="mt-5 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
        <p className="text-xs font-black uppercase text-[var(--text-dim)]">Monetização</p>
        <p className="mt-2 text-sm font-black text-white">{workspace.revenueState}</p>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{workspace.nextStep}</p>
      </div>
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

export function ProAdminPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTitle, setNoticeTitle] = useState("Relatório preparado");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadOverview(showSuccess = false) {
    setLoading(true);
    try {
      const data = await getAdminOverview();
      setOverview(data);
      if (showSuccess) {
        setNoticeTitle("Dados atualizados");
        setNotice(`API de gestão sincronizada em ${new Date(data.meta.generatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`);
      }
    } catch {
      if (showSuccess) {
        setNoticeTitle("API de gestão bloqueada");
        setNotice("Configure OWNER_EMAILS no backend para liberar a Gestão em produção. Mantive os dados visuais como fallback.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => void loadOverview(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const stats: AdminStatUi[] = useMemo(() => {
    if (!overview) return [...adminStats];
    return overview.stats.map((stat, index) => ({ ...stat, icon: statIcons[index] ?? BarChart3 }));
  }, [overview]);
  const workspaces = overview?.workspaces ?? productWorkspaces;
  const checklist = overview?.checklist ?? ownerChecklist;
  const timeline: AdminTimelineUi[] = useMemo(() => {
    if (!overview) return [...adminTimeline];
    return overview.timeline.map((item, index) => ({ ...item, icon: timelineIcons[index] ?? Sparkles }));
  }, [overview]);

  return (
    <>
      <AdminHeader loading={loading} onRefresh={() => void loadOverview(true)} />
      <AdminNotice message={notice} title={noticeTitle} />
      <RevealGroup>
        <section className="mb-5 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="app-card premium-card border-[rgba(167,139,250,0.22)] p-5" data-reveal>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-[var(--violet)]">Controle por login</p>
                <h2 className="mt-2 text-xl font-black text-white">Cada profissional com sua própria carteira</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  A interface já separa Nutri Pro e Run Pro. O próximo passo técnico é RBAC no backend para limitar dados por perfil e profissional.
                </p>
              </div>
              <span className="grid size-14 shrink-0 place-items-center rounded-[8px] bg-[rgba(167,139,250,0.1)] text-[var(--violet)]">
                <LockKeyhole size={25} />
              </span>
            </div>
          </div>
          <div className="app-card premium-card p-5" data-reveal>
            <p className="eyebrow">Venda piloto</p>
            <h2 className="mt-2 text-xl font-black text-white">Começar com 2 profissionais</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Nutricionista e Run/TAF testam com carteiras pequenas. Você acompanha uso e ajusta antes de escalar.</p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <AdminMetricCard key={stat.label} {...stat} />)}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-4 md:grid-cols-2">
            {workspaces.map((workspace) => <WorkspaceCard key={workspace.id} workspace={workspace} />)}
          </div>

          <section className="app-card premium-card p-5" data-reveal>
            <p className="eyebrow text-[var(--lime)]">Checklist do dono</p>
            <h2 className="mt-2 text-xl font-black text-white">Antes de vender maior</h2>
            <div className="mt-4 space-y-3">
              {checklist.map((item) => (
                <article key={item.title} className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
                  <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-[6px] ${item.done ? "bg-[var(--lime)] text-[var(--lime-ink)]" : "bg-[var(--surface-soft)] text-[var(--text-dim)]"}`}>
                    {item.done ? <CheckCircle2 size={16} /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-white">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{item.detail}</span>
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="app-card premium-card mt-5 p-5" data-reveal>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Linha de produto</p>
              <h2 className="mt-2 text-xl font-black text-white">O que está acontecendo agora</h2>
            </div>
            <button type="button" onClick={() => { setNoticeTitle("Relatório preparado"); setNotice(overview ? `Relatório da API: ${stats[0]?.value ?? "0"} usuários, ${stats[1]?.value ?? "0"} ativos hoje e ${overview.catalog.publicWorkouts} treinos públicos no catálogo.` : "Relatório visual: configure OWNER_EMAILS para puxar métricas reais da API em produção."); }} className="ghost-button">Abrir relatório <ArrowRight size={16} /></button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {timeline.map(({ icon: Icon, tone, title, detail }) => (
              <article key={title} className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-4">
                <span className={`grid size-10 place-items-center rounded-[7px] ${toneClass[tone]}`}><Icon size={19} /></span>
                <p className="mt-4 text-sm font-black text-white">{title}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{detail}</p>
              </article>
            ))}
          </div>
        </section>
      </RevealGroup>
    </>
  );
}
