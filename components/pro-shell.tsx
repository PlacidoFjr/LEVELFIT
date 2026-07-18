"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Route,
  Search,
  Settings,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { LevelFitLogo } from "@/components/level-fit-logo";

const nutriNav = [
  { href: "/pro", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pro/clients", label: "Clientes", icon: UsersRound },
  { href: "/pro/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pro/plans", label: "Planos", icon: ClipboardList },
  { href: "/pro/checkins", label: "Check-ins", icon: CheckSquare },
  { href: "/pro/alerts", label: "Alertas", icon: AlertTriangle },
  { href: "/pro/admin", label: "Gestão", icon: ShieldCheck },
];

const runNav = [
  { href: "/pro/run", label: "Dashboard Run", icon: Route },
  { href: "/pro/run/athletes", label: "Atletas", icon: UsersRound },
  { href: "/pro/run/agenda", label: "Agenda Run", icon: CalendarDays },
  { href: "/pro/run/plans", label: "Treinos", icon: ClipboardList },
  { href: "/pro/admin", label: "Gestão", icon: ShieldCheck },
];

const ownerNav = [
  { href: "/pro/admin", label: "Gestão", icon: ShieldCheck },
  { href: "/pro", label: "Nutri Pro", icon: LayoutDashboard },
  { href: "/pro/run", label: "Run Pro", icon: Route },
];

type ProNavItem = (typeof nutriNav)[number] | (typeof runNav)[number] | (typeof ownerNav)[number];
type ProContext = "nutri" | "run" | "owner";

const profileByContext = {
  nutri: {
    name: "Dr. Rafael Martins",
    role: "Nutrição esportiva",
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
    settingsLabel: "Configurações",
  },
  run: {
    name: "Coach TAF",
    role: "Corrida e testes físicos",
    firstLabel: "Carteira",
    firstValue: "24 atletas",
    secondLabel: "Hoje",
    secondValue: "6 sessões",
    primaryHref: "/pro/run/athletes",
    primaryLabel: "Adicionar atleta",
    quickHref: "/pro/run/agenda",
    quickLabel: "Agenda Run",
    actionHref: "/pro/run/plans",
    actionLabel: "Treino",
    search: "Buscar atleta, treino ou simulado",
    settingsHref: "/pro/run/plans",
    settingsLabel: "Modelos Run",
  },
  owner: {
    name: "Placido",
    role: "Dono do produto",
    firstLabel: "Produtos",
    firstValue: "2 produtos",
    secondLabel: "Base",
    secondValue: "62 usuários",
    primaryHref: "/pro/admin",
    primaryLabel: "Ver gestão",
    quickHref: "/pro",
    quickLabel: "Nutri Pro",
    actionHref: "/pro/run",
    actionLabel: "Run Pro",
    search: "Buscar produto, profissional ou piloto",
    settingsHref: "/pro/settings",
    settingsLabel: "Configurações",
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

export function ProShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const context = getContext(pathname);
  const nav = getNav(context);
  const profile = profileByContext[context];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.07),transparent_34%),radial-gradient(circle_at_top_left,rgba(183,255,42,0.07),transparent_28%)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[var(--border)] bg-[rgba(8,11,15,0.96)] px-4 py-5 backdrop-blur lg:flex lg:flex-col">
        <Link href={context === "run" ? "/pro/run" : context === "owner" ? "/pro/admin" : "/pro"} className="flex min-h-11 items-center gap-3 px-2 text-white" aria-label="LevelFit Pro">
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

        <nav className="mt-6 flex flex-col gap-1" aria-label="LevelFit Pro">
          {nav.map((item) => <ProNavLink key={item.href} {...item} />)}
        </nav>

        <div className="mt-auto space-y-3">
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
          <Link href={context === "run" ? "/pro/run" : context === "owner" ? "/pro/admin" : "/pro"} className="lg:hidden">
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
          <div className="ml-auto flex h-full w-[min(88vw,360px)] flex-col border-l border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between">
              <Link href={context === "run" ? "/pro/run" : context === "owner" ? "/pro/admin" : "/pro"} onClick={() => setMenuOpen(false)}><LevelFitLogo /></Link>
              <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {nav.map((item) => <ProNavLink key={item.href} {...item} onClick={() => setMenuOpen(false)} />)}
            </nav>
          </div>
        </div>
      )}

      <main className="px-4 py-5 lg:ml-[280px] lg:px-8 lg:py-7">
        {children}
      </main>
    </div>
  );
}
