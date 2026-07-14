"use client";

import Link from "next/link";
import { Bell, Flame, Search } from "lucide-react";
import { useState } from "react";
import { useAuthSession } from "@/lib/auth-client";
import { getUserProgress } from "@/lib/user-progress";

const quickLinks = [
  { label: "Missões", href: "/missions", keywords: "missao missões xp streak objetivo" },
  { label: "Treinos", href: "/workouts", keywords: "treino exercicio força cardio mobilidade" },
  { label: "Água", href: "/hydration", keywords: "agua hidratação copo ml lembrete" },
  { label: "Alimentação", href: "/nutrition", keywords: "comida refeição alimento checklist nutricao" },
  { label: "Progresso", href: "/progress", keywords: "medidas peso corpo evolução check-in" },
  { label: "Configurações", href: "/settings", keywords: "conta notificacoes segurança privacidade" },
];

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  const session = useAuthSession();
  const progress = getUserProgress(session.user);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow mb-2">Terça, 14 de julho</p>
        <h1 className="text-2xl font-black text-white sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>}
        {searchOpen && (
          <div className="mt-4 max-w-md">
            <label htmlFor="global-search" className="screen-reader-only">Buscar no LevelFit</label>
            <input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} className="field" placeholder="Buscar treino, missão, água..." autoFocus />
            {query && (
              <div className="mt-2 flex flex-wrap gap-2">
                {quickLinks
                  .filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(query.toLowerCase()))
                  .slice(0, 4)
                  .map((item) => <Link key={item.href} href={item.href} className="rounded-[6px] border border-[var(--border)] px-2.5 py-1.5 text-xs font-black text-[var(--text-muted)] hover:border-[var(--lime)] hover:text-[var(--lime)]">{item.label}</Link>)}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action}
        <div className="hidden h-11 items-center gap-2 rounded-[7px] border border-[rgba(250,204,21,0.25)] bg-[rgba(250,204,21,0.08)] px-3 text-sm font-black text-[var(--gold)] sm:flex" title="Sequência atual">
          <Flame size={18} fill="currentColor" aria-hidden="true" /> {progress.streak} dias
        </div>
        <span className="hidden sm:inline-flex">
          <button onClick={() => setSearchOpen((value) => !value)} className="icon-button" aria-label={searchOpen ? "Fechar busca" : "Buscar"} title={searchOpen ? "Fechar busca" : "Buscar"}>
            <Search size={19} />
          </button>
        </span>
        <span className="hidden sm:inline-flex">
          <Link href="/notifications" className="icon-button relative" aria-label="Abrir notificações" title="Notificações">
            <Bell size={19} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--coral)]" aria-hidden="true" />
          </Link>
        </span>
      </div>
    </header>
  );
}
