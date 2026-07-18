"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Apple,
  Award,
  Bell,
  ChevronRight,
  CircleUserRound,
  Dumbbell,
  Gauge,
  GlassWater,
  Handshake,
  Menu,
  Route,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useAuthSession } from "@/lib/auth-client";
import { getUserProgress } from "@/lib/user-progress";
import { LevelFitLogo } from "./level-fit-logo";
import { WorkspaceSwitcherPanel } from "./workspace-switcher-panel";

const primaryNav = [
  { href: "/", label: "Hoje", icon: Gauge },
  { href: "/missions", label: "Missões", icon: Target },
  { href: "/workouts", label: "Treinos", icon: Dumbbell },
  { href: "/nutrition", label: "Alimentação", icon: Apple },
  { href: "/hydration", label: "Hidratação", icon: GlassWater },
  { href: "/my-plan", label: "Meu plano", icon: Route },
  { href: "/professionals", label: "Profissionais", icon: Handshake },
  { href: "/progress", label: "Progresso", icon: TrendingUp },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/achievements", label: "Conquistas", icon: Award },
];

const secondaryNav = [
  { href: "/profile", label: "Perfil", icon: CircleUserRound },
  { href: "/settings", label: "Configurações", icon: Settings },
];

const mobileNav = [
  { href: "/", label: "Hoje", icon: Gauge },
  { href: "/missions", label: "Missões", icon: Target },
  { href: "/workouts", label: "Treino", icon: Dumbbell },
  { href: "/my-plan", label: "Plano", icon: Route },
  { href: "/progress", label: "Progresso", icon: TrendingUp },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function Brand() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-3 text-white" aria-label="LevelFit - ir para hoje">
      <LevelFitLogo className="text-[1.15rem]" />
    </Link>
  );
}

function NavLink({ href, label, icon: Icon, pathname, onClick }: (typeof primaryNav)[number] & { pathname: string; onClick?: () => void }) {
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
      <Icon size={19} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
      <span>{label}</span>
      {active && <span className="ml-auto size-1.5 rounded-full bg-[var(--lime)]" aria-hidden="true" />}
    </Link>
  );
}

/* function WorkspaceLinks({ user, onClick }: { user?: AuthUser | null; onClick?: () => void }) {
  const workspaces = user?.availableWorkspaces?.filter((workspace) => workspace.type !== "user") ?? [];
  if (!workspaces.length) return null;

  return (
    <div className="rounded-[8px] border border-[rgba(183,255,42,0.2)] bg-[rgba(183,255,42,0.06)] p-3">
      <p className="mb-2 flex items-center gap-2 text-[0.68rem] font-black uppercase text-[var(--lime)]">
        <BriefcaseBusiness size={15} /> Trocar área
      </p>
      <div className="space-y-1">
        {workspaces.map((workspace) => (
          <Link key={workspace.type} href={workspace.route} onClick={onClick} className="flex min-h-10 items-center justify-between rounded-[6px] px-2 text-xs font-black text-white hover:bg-[var(--surface-soft)]">
            <span>{workspace.label}</span>
            <ChevronRight size={15} className="text-[var(--text-dim)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}

*/
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = getUserProgress(session.user);

  useEffect(() => {
    if (!session.loading && !session.authenticated) router.replace("/login");
    if (!session.loading && session.authenticated && !session.user?.onboardingCompleted) router.replace("/onboarding");
  }, [router, session.authenticated, session.loading, session.user?.onboardingCompleted]);

  if (session.loading || !session.authenticated) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <LevelFitLogo className="justify-center text-xl" />
          <p className="mt-5 text-sm font-bold text-[var(--text-muted)]">Verificando sua sessão...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="screen-reader-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:h-auto focus:w-auto focus:clip-auto focus:rounded focus:bg-[var(--lime)] focus:px-4 focus:py-3 focus:text-[var(--lime-ink)]">
        Pular para o conteúdo
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[var(--border)] bg-[rgba(8,11,15,0.96)] px-4 py-5 backdrop-blur lg:flex lg:flex-col">
        <div className="px-2"><Brand /></div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Navegacao principal">
          {primaryNav.map((item) => <NavLink key={item.href} {...item} pathname={pathname} />)}
        </nav>
        <div className="mt-auto">
          <div className="mb-4">
            <WorkspaceSwitcherPanel workspaces={session.user?.availableWorkspaces?.filter((workspace) => workspace.type !== "user") ?? []} title="Areas conectadas" />
          </div>
          <div className="mb-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
              <span>Nível {progress.level}</span>
              <span>{progress.currentXp} XP</span>
            </div>
            <div className="progress-track" aria-label={`${progress.currentXp} de ${progress.nextLevelXp} pontos de experiencia`}>
              <div className="progress-fill bg-[var(--lime)]" style={{ width: `${(progress.currentXp / progress.nextLevelXp) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--text-dim)]">{progress.nextLevelXp - progress.currentXp} XP para o próximo nível</p>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Conta">
            {secondaryNav.map((item) => <NavLink key={item.href} {...item} pathname={pathname} />)}
          </nav>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[var(--border)] bg-[rgba(8,11,15,0.92)] px-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="icon-button relative" aria-label="Abrir notificações" title="Notificações">
            <Bell size={19} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--coral)]" aria-hidden="true" />
          </Link>
          <button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu" title="Menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="ml-auto flex h-full w-[min(86vw,340px)] flex-col border-l border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between">
              <Brand />
              <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" title="Fechar">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Menu completo">
              {[...primaryNav, ...secondaryNav].map((item) => <NavLink key={item.href} {...item} pathname={pathname} onClick={() => setMenuOpen(false)} />)}
            </nav>
            <div className="mt-5">
              <WorkspaceSwitcherPanel workspaces={session.user?.availableWorkspaces?.filter((workspace) => workspace.type !== "user") ?? []} title="Areas conectadas" onClick={() => setMenuOpen(false)} />
            </div>
            <Link href="/onboarding" onClick={() => setMenuOpen(false)} className="mt-auto flex items-center gap-3 rounded-[7px] border border-[var(--border)] p-3 text-sm font-bold text-[var(--text-muted)]">
              <Sparkles size={18} /> Rever objetivos <ChevronRight className="ml-auto" size={18} />
            </Link>
          </div>
        </div>
      )}

      <main id="main-content" className="pb-[calc(88px+env(safe-area-inset-bottom))] lg:ml-[248px] lg:pb-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(68px+env(safe-area-inset-bottom))] grid-cols-6 border-t border-[var(--border)] bg-[rgba(8,11,15,0.96)] px-1.5 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navegação inferior">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[0.68rem] font-bold ${active ? "text-[var(--lime)]" : "text-[var(--text-dim)]"}`}>
              <Icon size={21} strokeWidth={active ? 2.7 : 2} aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMenuOpen(true)} className="flex min-w-0 flex-col items-center justify-center gap-1 text-[0.68rem] font-bold text-[var(--text-dim)]" aria-label="Abrir mais opções">
          <Menu size={21} aria-hidden="true" />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
}
