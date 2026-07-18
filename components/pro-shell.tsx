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
  Search,
  Settings,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { LevelFitLogo } from "@/components/level-fit-logo";

const proNav = [
  { href: "/pro", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pro/clients", label: "Clientes", icon: UsersRound },
  { href: "/pro/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pro/plans", label: "Planos", icon: ClipboardList },
  { href: "/pro/checkins", label: "Check-ins", icon: CheckSquare },
  { href: "/pro/alerts", label: "Alertas", icon: AlertTriangle },
];

function isActive(pathname: string, href: string) {
  if (href === "/pro") return pathname === "/pro";
  return pathname.startsWith(href);
}

function ProNavLink({ href, label, icon: Icon, onClick }: (typeof proNav)[number] & { onClick?: () => void }) {
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.07),transparent_34%),radial-gradient(circle_at_top_left,rgba(183,255,42,0.07),transparent_28%)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-[var(--border)] bg-[rgba(8,11,15,0.96)] px-4 py-5 backdrop-blur lg:flex lg:flex-col">
        <Link href="/pro" className="flex min-h-11 items-center gap-3 px-2 text-white" aria-label="LevelFit Pro">
          <LevelFitLogo className="text-[1.12rem]" />
          <span className="rounded-[5px] border border-[rgba(183,255,42,0.28)] bg-[rgba(183,255,42,0.1)] px-2 py-1 text-[0.66rem] font-black uppercase text-[var(--lime)]">Pro</span>
        </Link>

        <div className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-sm font-black text-white">Dr. Rafael Martins</p>
          <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">Nutrição esportiva</p>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[var(--green)]">
            <span className="size-2 rounded-full bg-[var(--green)]" />
            Carteira ativa
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-1" aria-label="LevelFit Pro">
          {proNav.map((item) => <ProNavLink key={item.href} {...item} />)}
        </nav>

        <div className="mt-auto space-y-3">
          <Link href="/pro/clients" className="primary-button w-full">
            <UserPlus size={18} /> Convidar cliente
          </Link>
          <Link href="/pro/settings" className="flex min-h-11 items-center gap-3 rounded-[7px] px-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-white">
            <Settings size={18} /> Configurações <ChevronRight className="ml-auto" size={17} />
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-[var(--border)] bg-[rgba(8,11,15,0.92)] px-4 backdrop-blur lg:ml-[280px]">
        <div className="flex min-w-0 items-center gap-3">
          <button className="icon-button lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <Link href="/pro" className="lg:hidden">
            <LevelFitLogo compact />
          </Link>
          <div className="hidden min-w-0 items-center gap-2 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)] md:flex">
            <Search size={17} />
            <span>Buscar cliente, retorno ou plano</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pro/agenda" className="secondary-button hidden sm:inline-flex">
            <CalendarDays size={18} /> Novo retorno
          </Link>
          <Link href="/pro/clients" className="primary-button">
            <UserPlus size={18} /> Cliente
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.72)] backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true" aria-label="Menu LevelFit Pro">
          <div className="ml-auto flex h-full w-[min(88vw,360px)] flex-col border-l border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between">
              <Link href="/pro" onClick={() => setMenuOpen(false)}><LevelFitLogo /></Link>
              <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {proNav.map((item) => <ProNavLink key={item.href} {...item} onClick={() => setMenuOpen(false)} />)}
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

