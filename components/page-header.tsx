import Link from "next/link";
import { Bell, Flame, Search } from "lucide-react";
import { user } from "@/lib/mock-data";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow mb-2">Terça, 14 de julho</p>
        <h1 className="text-2xl font-black text-white sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action}
        <div className="hidden h-11 items-center gap-2 rounded-[7px] border border-[rgba(250,204,21,0.25)] bg-[rgba(250,204,21,0.08)] px-3 text-sm font-black text-[var(--gold)] sm:flex" title="Sequência atual">
          <Flame size={18} fill="currentColor" aria-hidden="true" /> {user.streak} dias
        </div>
        <span className="hidden sm:inline-flex">
          <button className="icon-button" aria-label="Buscar" title="Buscar">
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
