"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  LockKeyhole,
  Menu,
  Route,
  Search,
  Settings,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LevelFitLogo } from "@/components/level-fit-logo";
import { WorkspaceSwitcherPanel } from "@/components/workspace-switcher-panel";
import { getDefaultRoute, useAuthSession } from "@/lib/auth-client";
import type { AuthUser } from "@/lib/auth-client";

const nutriNav = [
  { href: "/pro", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pro/clients", label: "Clientes", icon: UsersRound },
  { href: "/pro/messages", label: "Toques", icon: MessageSquareText },
  { href: "/pro/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pro/plans", label: "Planos", icon: ClipboardList },
  { href: "/pro/checkins", label: "Check-ins", icon: CheckSquare },
  { href: "/pro/alerts", label: "Alertas", icon: AlertTriangle },
];

const runNav = [
  { href: "/pro/run", label: "Dashboard Run", icon: Route },
  { href: "/pro/run/athletes", label: "Atletas", icon: UsersRound },
  { href: "/pro/run/messages", label: "Toques", icon: MessageSquareText },
  { href: "/pro/run/agenda", label: "Agenda Run", icon: CalendarDays },
  { href: "/pro/run/plans", label: "Treinos", icon: ClipboardList },
];

const ownerNav = [
  { href: "/pro/admin", label: "Visao geral", icon: ShieldCheck, section: "Gestao" },
  { href: "/pro/admin/products", label: "Produtos", icon: LayoutDashboard, section: "Gestao" },
  { href: "/pro/admin/users", label: "Usuarios", icon: UsersRound, section: "Acessos" },
  { href: "/pro/admin/professionals", label: "Profissionais", icon: BriefcaseBusiness, section: "Acessos" },
  { href: "/pro/admin/roles", label: "Papeis", icon: LockKeyhole, section: "Acessos" },
  { href: "/pro/admin/security", label: "Auditoria", icon: ShieldCheck, section: "Tecnico" },
  { href: "/pro/admin/settings", label: "Configuracao", icon: Settings, section: "Tecnico" },
  { href: "/pro", label: "Nutri Pro", icon: ClipboardList, section: "Ambientes Pro" },
  { href: "/pro/run", label: "Run Pro", icon: Route, section: "Ambientes Pro" },
];

type ProNavItem = (typeof nutriNav)[number] | (typeof runNav)[number] | (typeof ownerNav)[number];
type ProContext = "nutri" | "run" | "owner";

const profileByContext = {
  nutri: {
    name: "Dr. Rafael Martins",
    role: "Nutricao esportiva",
    firstLabel: "Carteira",
    firstValue: "38 ativos",
    secondLabel: "Hoje",
    secondValue: "4 retornos",
    primaryHref: "/pro/clients",
    primaryLabel: "Convidar cliente",
    quickHref: "/pro/agenda",
    quickLabel: "Novo retorno",
    actionHref: "/pro/clients",
    actionLabel: "Cliente",
    search: "Buscar cliente, retorno ou plano",
    settingsHref: "/pro/settings",
    settingsLabel: "Configuracoes",
  },
  run: {
    name: "Coach TAF",
    role: "Corrida e testes fisicos",
    firstLabel: "Carteira",
    firstValue: "24 atletas",
    secondLabel: "Hoje",
    secondValue: "6 sessoes",
    primaryHref: "/pro/run/athletes",
    primaryLabel: "Adicionar atleta",
    quickHref: "/pro/run/agenda",
    quickLabel: "Agenda Run",
    actionHref: "/pro/run/plans",
    actionLabel: "Treino",
    search: "Buscar atleta, treino ou avaliacao TAF",
    settingsHref: "/pro/run/plans",
    settingsLabel: "Modelos Run",
  },
  owner: {
    name: "Placido",
    role: "Dono do produto",
    firstLabel: "Escopo",
    firstValue: "3 areas",
    secondLabel: "Acesso",
    secondValue: "Owner",
    primaryHref: "/pro/admin/roles",
    primaryLabel: "Gerir acessos",
    quickHref: "/pro/admin/products",
    quickLabel: "Produtos",
    actionHref: "/pro/admin/roles",
    actionLabel: "Papel",
    search: "Buscar usuario, produto ou profissional",
    settingsHref: "/pro/admin/settings",
    settingsLabel: "Configuracao",
  },
} satisfies Record<ProContext, Record<string, string>>;

function getContext(pathname: string): ProContext {
  if (pathname.startsWith("/pro/run")) return "run";
  if (pathname.startsWith("/pro/admin")) return "owner";
  return "nutri";
}

function getNav(context: ProContext) {
  if (context === "run") return runNav;
  if (context === "owner") return ownerNav;
  return nutriNav;
}

function contextWorkspaceType(context: ProContext) {
  return context === "owner" ? "owner" : context;
}

function hasContextAccess(user: AuthUser | null | undefined, context: ProContext) {
  const workspaceType = contextWorkspaceType(context);
  return user?.availableWorkspaces?.some((workspace) => workspace.type === workspaceType) ?? false;
}

function isActive(pathname: string, href: string) {
  if (href === "/pro" || href === "/pro/run" || href === "/pro/admin") return pathname === href;
  return pathname.startsWith(href);
}

function ProNavLink({ href, label, icon: Icon, onClick }: ProNavItem & { onClick?: () => void }) {
  const pathname = usePathname();
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-[7px] px-3 text-sm font-bold transition-colors ${
        active
          ? "bg-[rgba(183,255,42,0.12)] text-[var(--lime)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-white"
      }`}
    >
      <Icon size={19} />
      <span>{label}</span>
      {active && <span className="ml-auto size-1.5 rounded-full bg-[var(--lime)]" aria-hidden="true" />}
    </Link>
  );
}

function ProNavList({ context, nav, onClick }: { context: ProContext; nav: ProNavItem[]; onClick?: () => void }) {
  if (context !== "owner") return <>{nav.map((item) => <ProNavLink key={item.href} {...item} onClick={onClick} />)}</>;

  const grouped = new Map<string, ProNavItem[]>();
  nav.forEach((item) => {
    const section = "section" in item ? item.section : "Menu";
    grouped.set(section, [...(grouped.get(section) ?? []), item]);
  });

  return (
    <>
      {Array.from(grouped.entries()).map(([section, items]) => (
        <div key={section} className="space-y-1">
          <p className="px-3 pt-3 text-[0.63rem] font-black uppercase tracking-[0.08em] text-[var(--text-dim)]">{section}</p>
          {items.map((item) => <ProNavLink key={item.href} {...item} onClick={onClick} />)}
        </div>
      ))}
    </>
  );
}

export function ProShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthSession();
  const context = getContext(pathname);
  const nav = useMemo(() => getNav(context), [context]);
  const profile = profileByContext[context];
  const allowed = hasContextAccess(session.user, context);

  useEffect(() => {
    if (session.loading) return;
    if (!session.authenticated) {
      router.replace("/login");
      return;
    }
    if (!allowed) router.replace(getDefaultRoute(session.user));
  }, [allowed, router, session.authenticated, session.loading, session.user]);

  if (session.loading || !session.authenticated || !allowed) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <LevelFitLogo className="justify-center text-xl" />
          <p className="mt-5 text-sm font-bold text-[var(--text-muted)]">Verificando acesso...</p>
        </div>
      </main>
    );
  }

  const homeHref = context === "run" ? "/pro/run" : context === "owner" ? "/pro/admin" : "/pro";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.07),transparent_34%),radial-gradient(circle_at_top_left,rgba(183,255,42,0.07),transparent_28%)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[var(--border)] bg-[rgba(8,11,15,0.96)] px-4 py-5 backdrop-blur lg:flex lg:flex-col">
        <Link href={homeHref} className="flex min-h-11 items-center gap-3 px-2 text-white" aria-label="LevelFit Pro">
          <LevelFitLogo className="pulse-idle text-[1.12rem]" />
          <span className="rounded-[5px] border border-[rgba(183,255,42,0.28)] bg-[rgba(183,255,42,0.1)] px-2 py-1 text-[0.66rem] font-black uppercase text-[var(--lime)]">
            {context === "run" ? "Run" : context === "owner" ? "Owner" : "Pro"}
          </span>
        </Link>

        <div className="mt-6 rounded-[8px] border border-[rgba(183,255,42,0.22)] bg-[linear-gradient(145deg,rgba(183,255,42,0.1),rgba(16,22,29,0.96)_44%,rgba(34,211,238,0.08))] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">{profile.name}</p>
              <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{profile.role}</p>
            </div>
            <span className="rounded-[5px] bg-[rgba(56,217,121,0.12)] px-2 py-1 text-[0.64rem] font-black uppercase text-[var(--green)]">
              Online
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[6px] border border-[var(--border)] bg-[rgba(8,11,15,0.42)] p-2">
              <p className="text-[0.65rem] font-black uppercase text-[var(--text-dim)]">{profile.firstLabel}</p>
              <p className="mt-1 text-sm font-black text-white">{profile.firstValue}</p>
            </div>
            <div className="rounded-[6px] border border-[var(--border)] bg-[rgba(8,11,15,0.42)] p-2">
              <p className="text-[0.65rem] font-black uppercase text-[var(--text-dim)]">{profile.secondLabel}</p>
              <p className="mt-1 text-sm font-black text-white">{profile.secondValue}</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-1 overflow-y-auto pb-4" aria-label="LevelFit Pro">
          <ProNavList context={context} nav={nav} />
        </nav>

        <div className="mt-auto space-y-3">
          <WorkspaceSwitcherPanel workspaces={session.user?.availableWorkspaces ?? []} activeType={contextWorkspaceType(context)} />
          <Link href={profile.primaryHref} className="primary-button w-full">
            <UserPlus size={18} /> {profile.primaryLabel}
          </Link>
          <Link href={profile.settingsHref} className="flex min-h-11 items-center gap-3 rounded-[7px] px-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-white">
            <Settings size={18} /> {profile.settingsLabel} <ChevronRight className="ml-auto" size={17} />
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-[var(--border)] bg-[rgba(8,11,15,0.92)] px-4 backdrop-blur lg:ml-[280px]">
        <div className="flex min-w-0 items-center gap-3">
          <button className="icon-button lg:!hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <Link href={homeHref} className="lg:hidden">
            <LevelFitLogo compact className="pulse-idle" />
          </Link>
          <div className="hidden min-w-0 items-center gap-2 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)] md:flex lg:w-[360px]">
            <Search size={17} />
            <span>{profile.search}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={profile.quickHref} className="secondary-button !hidden sm:!inline-flex">
            <CalendarDays size={18} /> {profile.quickLabel}
          </Link>
          <Link href={profile.actionHref} className="primary-button max-[420px]:size-11 max-[420px]:px-0" aria-label={profile.actionLabel}>
            <UserPlus size={18} /> <span className="max-[420px]:sr-only">{profile.actionLabel}</span>
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.72)] backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true" aria-label="Menu LevelFit Pro">
          <div className="ml-auto flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto border-l border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between">
              <Link href={homeHref} onClick={() => setMenuOpen(false)}><LevelFitLogo /></Link>
              <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              <ProNavList context={context} nav={nav} onClick={() => setMenuOpen(false)} />
            </nav>
            <div className="mt-5">
              <WorkspaceSwitcherPanel workspaces={session.user?.availableWorkspaces ?? []} activeType={contextWorkspaceType(context)} onClick={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-5 lg:ml-[280px] lg:px-8 lg:py-7">
        {children}
      </main>
    </div>
  );
}
