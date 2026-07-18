"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Apple, BriefcaseBusiness, ChevronRight, LayoutDashboard, Route, ShieldCheck } from "lucide-react";
import type { AuthUser } from "@/lib/auth-client";

type Workspace = NonNullable<AuthUser["availableWorkspaces"]>[number];

const workspaceMeta = {
  user: { icon: LayoutDashboard, accent: "var(--lime)", label: "App" },
  nutri: { icon: Apple, accent: "var(--green)", label: "Nutri" },
  run: { icon: Route, accent: "var(--cyan)", label: "Run" },
  owner: { icon: ShieldCheck, accent: "var(--gold)", label: "Owner" },
};

export function WorkspaceSwitcherPanel({
  workspaces,
  activeType,
  title = "Trocar area",
  onClick,
}: {
  workspaces: Workspace[];
  activeType?: Workspace["type"];
  title?: string;
  onClick?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  if (workspaces.length <= 0) return null;

  return (
    <section className="overflow-hidden rounded-[10px] border border-[rgba(183,255,42,0.22)] bg-[linear-gradient(145deg,rgba(183,255,42,0.1),rgba(16,22,29,0.94)_42%,rgba(34,211,238,0.08))] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--lime)]">
          <BriefcaseBusiness size={15} /> {title}
        </p>
        <span className="rounded-full border border-[rgba(183,255,42,0.22)] bg-[rgba(183,255,42,0.08)] px-2 py-1 text-[0.62rem] font-black uppercase text-[var(--lime)]">
          {workspaces.length} areas
        </span>
      </div>

      <div className="space-y-2">
        {workspaces.map((workspace) => {
          const meta = workspaceMeta[workspace.type] ?? workspaceMeta.user;
          const Icon = meta.icon;
          const active = workspace.type === activeType;

          return (
            <motion.div
              key={workspace.type}
              whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <Link
                href={workspace.route}
                onClick={onClick}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-[58px] items-center gap-3 rounded-[8px] border p-2.5 transition-colors ${
                  active
                    ? "border-[rgba(183,255,42,0.38)] bg-[rgba(183,255,42,0.13)]"
                    : "border-[rgba(148,163,184,0.14)] bg-[rgba(8,11,15,0.36)] hover:border-[rgba(183,255,42,0.28)] hover:bg-[rgba(15,23,42,0.52)]"
                }`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-[rgba(255,255,255,0.04)]" style={{ color: meta.accent }}>
                  <Icon size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-black text-white">
                    {workspace.label}
                    <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[0.58rem] font-black uppercase text-[var(--text-muted)]">
                      {meta.label}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[0.7rem] leading-4 text-[var(--text-muted)]">{workspace.description}</span>
                </span>
                <ChevronRight size={16} className={active ? "text-[var(--lime)]" : "text-[var(--text-dim)] transition-colors group-hover:text-white"} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
