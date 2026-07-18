"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Apple, BriefcaseBusiness, ChevronDown, LayoutDashboard, Route, ShieldCheck } from "lucide-react";
import type { AuthUser } from "@/lib/auth-client";

type Workspace = NonNullable<AuthUser["availableWorkspaces"]>[number];

const workspaceMeta = {
  user: { icon: LayoutDashboard, accent: "var(--lime)" },
  nutri: { icon: Apple, accent: "var(--green)" },
  run: { icon: Route, accent: "var(--cyan)" },
  owner: { icon: ShieldCheck, accent: "var(--gold)" },
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
    <details className="group/workspace relative rounded-[10px] border border-[rgba(183,255,42,0.22)] bg-[linear-gradient(145deg,rgba(183,255,42,0.1),rgba(16,22,29,0.94)_42%,rgba(34,211,238,0.08))] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-1 text-[0.66rem] font-black uppercase tracking-[0.06em] text-[var(--lime)] [&::-webkit-details-marker]:hidden">
        <BriefcaseBusiness size={15} />
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <span className="rounded-full border border-[rgba(183,255,42,0.22)] bg-[rgba(183,255,42,0.08)] px-2 py-1 text-[0.58rem]">{workspaces.length}</span>
        <ChevronDown size={14} className="transition-transform group-open/workspace:rotate-180" />
      </summary>

      <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 hidden space-y-1.5 rounded-[10px] border border-[rgba(183,255,42,0.22)] bg-[rgba(8,11,15,0.98)] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.38)] group-open/workspace:block group-hover/workspace:block group-focus-within/workspace:block">
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
                title={workspace.description}
                className={`group flex min-h-11 items-center gap-2 rounded-[8px] border px-2.5 py-2 transition-colors ${
                  active
                    ? "border-[rgba(183,255,42,0.38)] bg-[rgba(183,255,42,0.13)]"
                    : "border-[rgba(148,163,184,0.14)] bg-[rgba(8,11,15,0.36)] hover:border-[rgba(183,255,42,0.28)] hover:bg-[rgba(15,23,42,0.52)]"
                }`}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-[7px] border border-white/10 bg-[rgba(255,255,255,0.04)]" style={{ color: meta.accent }}>
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-black text-white">
                  {workspace.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </details>
  );
}
