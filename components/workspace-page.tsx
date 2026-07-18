"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, Route, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useEffect } from "react";
import { getDefaultRoute, useAuthSession } from "@/lib/auth-client";
import type { AuthUser } from "@/lib/auth-client";
import { LevelFitLogo } from "./level-fit-logo";
import { RevealGroup } from "./premium-motion";

const workspaceIcons = {
  user: UserRound,
  nutri: LayoutDashboard,
  run: Route,
  owner: ShieldCheck,
};

const workspaceTone = {
  user: "text-[var(--lime)] bg-[rgba(183,255,42,0.1)]",
  nutri: "text-[var(--green)] bg-[rgba(56,217,121,0.1)]",
  run: "text-[var(--coral)] bg-[rgba(255,105,69,0.1)]",
  owner: "text-[var(--violet)] bg-[rgba(167,139,250,0.1)]",
};

function WorkspaceCard({ workspace }: { workspace: NonNullable<AuthUser["availableWorkspaces"]>[number] }) {
  const Icon = workspaceIcons[workspace.type];

  return (
    <Link href={workspace.route} className="app-card group flex min-h-[132px] items-center gap-4 p-4 text-left transition-transform hover:-translate-y-0.5 hover:border-[var(--lime)] sm:p-5">
      <span className={`grid size-12 shrink-0 place-items-center rounded-[8px] ${workspaceTone[workspace.type]}`}>
        <Icon size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-base font-black text-white">{workspace.label}</strong>
        <span className="mt-2 block text-sm leading-5 text-[var(--text-muted)]">{workspace.description}</span>
      </span>
      <ArrowRight className="shrink-0 text-[var(--text-dim)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--lime)]" size={20} />
    </Link>
  );
}

export function WorkspacePage() {
  const router = useRouter();
  const session = useAuthSession();
  const workspaces = session.user?.availableWorkspaces ?? [];

  useEffect(() => {
    if (session.loading) return;
    if (!session.authenticated) {
      router.replace("/login");
      return;
    }
    if (workspaces.length <= 1) router.replace(getDefaultRoute(session.user));
  }, [router, session.authenticated, session.loading, session.user, workspaces.length]);

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
    <main className="min-h-screen px-4 py-6 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center">
        <RevealGroup className="w-full">
          <div className="flex items-center justify-between gap-4" data-reveal>
            <LevelFitLogo className="text-lg" />
            <span className="rounded-[6px] border border-[rgba(183,255,42,0.24)] bg-[rgba(183,255,42,0.08)] px-3 py-2 text-xs font-black uppercase text-[var(--lime)]">
              {workspaces.length} áreas
            </span>
          </div>

          <section className="mt-10 max-w-2xl" data-reveal>
            <p className="eyebrow text-[var(--lime)]">Escolha sua área</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">Para onde vamos agora?</h1>
            <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
              Sua conta tem mais de um acesso no LevelFit. Entre no app pessoal, na operação Pro ou na gestão do produto sem misturar contextos.
            </p>
          </section>

          <section className="mt-8 grid gap-3 md:grid-cols-2" data-reveal>
            {workspaces.map((workspace) => <WorkspaceCard key={workspace.type} workspace={workspace} />)}
          </section>

          <div className="mt-6 flex items-center gap-2 text-xs text-[var(--text-dim)]" data-reveal>
            <Sparkles size={16} className="text-[var(--lime)]" />
            Você pode trocar de área depois pelo menu lateral.
          </div>
        </RevealGroup>
      </div>
    </main>
  );
}
