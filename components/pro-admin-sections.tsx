"use client";

import Link from "next/link";
import { CheckCircle2, Copy, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  getAdminOverview,
  getAdminProducts,
  getAdminProfessionalInvites,
  getAdminProfessionals,
  getAdminRoles,
  getAdminSecurityEvents,
  getAdminSettings,
  getAdminUsers,
  confirmOwnerStepUp,
  createAdminProfessionalInvite,
  grantAdminRole,
  hasFreshOwnerStepUp,
  revokeAdminProfessionalInvite,
  revokeAdminRole,
  type AdminOverview,
  type AdminProfessionalInvite,
  type AdminProductRow,
  type AdminProfessionalRow,
  type AdminRoleAssignment,
  type AdminRoleName,
  type AdminSecurityEvent,
  type AdminUserRow,
} from "@/lib/level-fit-api";

function AdminHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="mb-5 rounded-[10px] border border-[rgba(183,255,42,0.18)] bg-[linear-gradient(135deg,rgba(183,255,42,0.1),rgba(16,22,29,0.92)_42%,rgba(34,211,238,0.08))] p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="eyebrow text-[var(--lime)]">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">{description}</p>
        </div>
        {action}
      </div>
    </header>
  );
}

function Notice({ message, tone = "neutral" }: { message: string | null; tone?: "neutral" | "error" | "success" }) {
  if (!message) return null;
  const color = tone === "error" ? "border-[rgba(255,107,61,0.35)] bg-[rgba(255,107,61,0.08)]" : tone === "success" ? "border-[rgba(56,217,121,0.28)] bg-[rgba(56,217,121,0.08)]" : "border-[rgba(34,211,238,0.24)] bg-[rgba(34,211,238,0.08)]";
  return <div className={`mb-5 rounded-[8px] border p-4 text-sm font-bold text-white ${color}`}>{message}</div>;
}

function MiniMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <section className="app-card p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{detail}</p>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-5 text-sm font-bold text-[var(--text-muted)]">{text}</div>;
}

type NoticeTone = "neutral" | "error" | "success";

function useOwnerStepUpDialog(
  setTone: (tone: NoticeTone) => void,
  setMessage: (message: string | null) => void,
) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  async function requestStepUp() {
    if (hasFreshOwnerStepUp()) return true;
    setPassword("");
    setError(null);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }

  function finish(confirmed: boolean) {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOpen(false);
    setSubmitting(false);
  }

  function cancelStepUp() {
    setTone("neutral");
    setMessage("Acao cancelada. Nenhuma alteracao foi feita.");
    finish(false);
  }

  async function submitStepUp(event: FormEvent) {
    event.preventDefault();
    if (!password.trim()) {
      setError("Digite sua senha Owner para continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await confirmOwnerStepUp(password);
      setTone("success");
      setMessage("Confirmacao de seguranca aprovada por 10 minutos.");
      finish(true);
    } catch {
      setSubmitting(false);
      setError("Nao foi possivel confirmar sua senha Owner.");
    }
  }

  const dialog = open ? (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="owner-step-up-title">
      <form onSubmit={submitStepUp} className="w-full max-w-md rounded-[12px] border border-[rgba(183,255,42,0.22)] bg-[linear-gradient(145deg,rgba(16,22,29,0.98),rgba(8,11,15,0.98))] p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(183,255,42,0.26)] bg-[rgba(183,255,42,0.1)] text-[var(--lime)]">
            <ShieldCheck size={22} />
          </span>
          <div>
            <p className="eyebrow text-[var(--lime)]">Seguranca Owner</p>
            <h2 id="owner-step-up-title" className="mt-1 text-xl font-black text-white">Confirme esta acao</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Acoes criticas da Gestao exigem uma confirmacao rapida. Ela vale por 10 minutos neste navegador.</p>
          </div>
        </div>
        <label className="mt-5 block text-sm font-black text-[var(--text-muted)]">Senha Owner</label>
        <input
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[var(--lime)]"
          placeholder="Digite sua senha"
          type="password"
          autoComplete="current-password"
        />
        {error ? <div className="mt-3 rounded-[8px] border border-[rgba(255,107,61,0.35)] bg-[rgba(255,107,61,0.08)] p-3 text-sm font-bold text-white">{error}</div> : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={cancelStepUp} className="secondary-button justify-center" disabled={submitting}>Cancelar</button>
          <button type="submit" className="primary-button justify-center disabled:opacity-60" disabled={submitting}>
            <ShieldCheck size={17} /> {submitting ? "Confirmando..." : "Confirmar"}
          </button>
        </div>
      </form>
    </div>
  ) : null;

  return { requestStepUp, dialog };
}

export function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(showMessage = false) {
    setLoading(true);
    try {
      const data = await getAdminOverview();
      setOverview(data);
      if (showMessage) setMessage("Dados da Gestao atualizados pela API.");
    } catch {
      setMessage("Nao foi possivel carregar a Gestao agora. Verifique seu acesso Owner e a API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <AdminHeader
        eyebrow="LevelFit Owner"
        title="Gestao LevelFit"
        description="Painel do dono para acompanhar produtos, usuarios, profissionais e permissoes sem misturar Nutri Pro e Run Pro."
        action={<button type="button" onClick={() => void load(true)} className="secondary-button" disabled={loading}><RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Atualizar</button>}
      />
      <Notice message={message} />
      {overview ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overview.stats.map((stat) => <MiniMetric key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />)}
          </div>
          <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="app-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Produtos</p>
                  <h2 className="mt-2 text-xl font-black text-white">Areas separadas</h2>
                </div>
                <Link href="/pro/admin/products" className="ghost-button">Ver produtos</Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {overview.products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
            <div className="app-card p-5">
              <p className="eyebrow">Checklist tecnico</p>
              <h2 className="mt-2 text-xl font-black text-white">Controle antes de escalar</h2>
              <div className="mt-4 space-y-3">
                {overview.checklist.map((item) => (
                  <div key={item.title} className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-3">
                    <CheckCircle2 size={20} className={item.done ? "text-[var(--lime)]" : "text-[var(--text-dim)]"} />
                    <div>
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : <EmptyState text="Aguardando dados reais da API de Gestao." />}
    </>
  );
}

function ProductCard({ product }: { product: AdminProductRow }) {
  return (
    <Link href={product.route} className="rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-4 transition-colors hover:border-[rgba(183,255,42,0.35)]">
      <p className="text-lg font-black text-white">{product.title}</p>
      <p className="mt-2 min-h-12 text-xs leading-5 text-[var(--text-muted)]">{product.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniMetric label="Usuarios" value={String(product.users)} detail="base ligada" />
        <MiniMetric label="Hoje" value={String(product.activeToday)} detail="atividade" />
      </div>
    </Link>
  );
}

export function AdminProductsPage() {
  const [rows, setRows] = useState<AdminProductRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { getAdminProducts().then((result) => setRows(result.data)).catch(() => setMessage("Nao foi possivel carregar produtos.")); }, []);
  return (
    <>
      <AdminHeader eyebrow="Produtos" title="Produtos LevelFit" description="Veja cada area do produto separada para manutencao, operacao e evolucao." />
      <Notice message={message} tone="error" />
      <div className="grid gap-4 xl:grid-cols-3">{rows.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      {!rows.length && <EmptyState text="Nenhum produto carregado ainda." />}
    </>
  );
}

export function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { getAdminUsers().then((result) => setRows(result.data)).catch(() => setMessage("Nao foi possivel carregar usuarios.")); }, []);
  return (
    <>
      <AdminHeader eyebrow="Usuarios" title="Base de usuarios" description="Lista operacional para verificar status, ultimo login, papeis ativos e atividade sem abrir dados sensiveis." />
      <Notice message={message} tone="error" />
      <div className="app-card overflow-hidden">
        {rows.map((user) => (
          <article key={user.id} className="grid gap-3 border-b border-[var(--border)] p-4 last:border-b-0 lg:grid-cols-[1fr_160px_220px] lg:items-center">
            <div>
              <p className="font-black text-white">{user.displayName}</p>
              <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{user.email}</p>
            </div>
            <p className="text-sm font-black text-[var(--lime)]">{user.status}</p>
            <div className="flex flex-wrap gap-2">
              {user.roles.length ? user.roles.map((role) => <span key={role} className="rounded-[5px] bg-[rgba(183,255,42,0.1)] px-2 py-1 text-[0.68rem] font-black text-[var(--lime)]">{role}</span>) : <span className="text-xs font-bold text-[var(--text-dim)]">Sem perfil Pro</span>}
            </div>
          </article>
        ))}
      </div>
      {!rows.length && <EmptyState text="Nenhum usuario carregado ainda." />}
    </>
  );
}

export function AdminProfessionalsPage() {
  const [rows, setRows] = useState<AdminProfessionalRow[]>([]);
  const [invites, setInvites] = useState<AdminProfessionalInvite[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"neutral" | "error" | "success">("neutral");
  const [savingInvite, setSavingInvite] = useState<"nutrition" | "run" | "revoke" | null>(null);
  const stepUp = useOwnerStepUpDialog(setTone, setMessage);

  async function load() {
    const [professionalsResult, invitesResult] = await Promise.all([getAdminProfessionals(), getAdminProfessionalInvites()]);
    setRows(professionalsResult.data);
    setInvites(invitesResult.data);
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      load().catch(() => {
        setTone("error");
        setMessage("Nao foi possivel carregar profissionais.");
      });
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function createInvite(kind: "nutrition" | "run") {
    if (!(await stepUp.requestStepUp())) return;
    setSavingInvite(kind);
    try {
      const isRun = kind === "run";
      await createAdminProfessionalInvite({
        kind,
        professionalKey: isRun ? "coach-taf" : "dr-rafael-martins",
        professionalName: isRun ? "Coach TAF" : "Dr. Rafael Martins",
        professionalRole: isRun ? "Run Pro" : "Nutri Pro",
        headline: isRun ? "Rotina TAF conectada ao LevelFit" : "Plano nutricional conectado ao LevelFit",
        planTitle: isRun ? "Acompanhamento Run Pro" : "Acompanhamento Nutri Pro",
        defaultPermissions: isRun ? ["workouts", "run_checkins", "notes"] : ["nutrition", "hydration", "body_checkins", "notes"],
      });
      setTone("success");
      setMessage("Convite criado com seguranca. Copie o codigo e envie ao usuario.");
      await load();
    } catch {
      setTone("error");
      setMessage("Nao foi possivel criar o convite agora.");
    } finally {
      setSavingInvite(null);
    }
  }

  async function copyInvite(code: string | null) {
    if (!code) return;
    await navigator.clipboard?.writeText(code);
    setTone("success");
    setMessage("Codigo copiado.");
  }

  async function revokeInvite(id: string) {
    if (!(await stepUp.requestStepUp())) return;
    setSavingInvite("revoke");
    try {
      await revokeAdminProfessionalInvite(id);
      setTone("success");
      setMessage("Convite revogado. O codigo nao podera mais ser usado.");
      await load();
    } catch {
      setTone("error");
      setMessage("Nao foi possivel revogar o convite agora.");
    } finally {
      setSavingInvite(null);
    }
  }

  return (
    <>
      {stepUp.dialog}
      <AdminHeader eyebrow="Profissionais" title="Nutri Pro e Run Pro" description="Acompanhe quais logins possuem papel profissional e quantos clientes/atletas estao ligados a cada produto." />
      <Notice message={message} tone={tone} />
      <section className="app-card mb-5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Convites seguros</p>
            <h2 className="mt-2 text-xl font-black text-white">Gerar codigo para conectar usuario</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Cada codigo nasce pela API, expira em 30 dias e aparece na auditoria da Gestao.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => void createInvite("nutrition")} disabled={savingInvite !== null} className="secondary-button disabled:opacity-50"><Plus size={17} /> Nutri Pro</button>
            <button type="button" onClick={() => void createInvite("run")} disabled={savingInvite !== null} className="primary-button disabled:opacity-50"><Plus size={17} /> Run Pro</button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {invites.slice(0, 6).map((invite) => (
            <article key={invite.id} className="flex flex-col gap-3 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black text-white">{invite.professionalName} <span className="text-[var(--text-dim)]">- {invite.kind === "run" ? "Run Pro" : "Nutri Pro"}</span></p>
                <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{invite.isActive ? `Expira em ${invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString("pt-BR") : "30 dias"}` : "Inativo ou expirado"}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={() => void copyInvite(invite.code)} disabled={!invite.code} className="secondary-button justify-center disabled:cursor-not-allowed disabled:opacity-50">
                  <Copy size={16} /> {invite.code ?? invite.codePreview}
                </button>
                <button type="button" onClick={() => void revokeInvite(invite.id)} disabled={!invite.isActive || savingInvite !== null} className="secondary-button justify-center disabled:cursor-not-allowed disabled:opacity-50">
                  <Trash2 size={16} /> Revogar
                </button>
              </div>
            </article>
          ))}
        </div>
        {!invites.length && <div className="mt-5"><EmptyState text="Nenhum convite ativo criado pela Gestao ainda." /></div>}
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((row) => (
          <section key={row.id} className="app-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{row.label}</p>
                <h2 className="mt-2 text-xl font-black text-white">{row.displayName}</h2>
                <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{row.email}</p>
              </div>
              <span className="rounded-[5px] bg-[rgba(34,211,238,0.1)] px-2 py-1 text-xs font-black text-[var(--cyan)]">{row.source}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniMetric label="Carteira" value={String(row.connectedClients)} detail="conexoes ativas" />
              <MiniMetric label="Produto" value={row.product} detail={row.professionalRole} />
            </div>
          </section>
        ))}
      </div>
      {!rows.length && <EmptyState text="Nenhum profissional Pro ativo ainda." />}
    </>
  );
}

export function AdminRolesPage() {
  const [rows, setRows] = useState<AdminRoleAssignment[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRoleName>("NUTRITIONIST");
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"neutral" | "error" | "success">("neutral");
  const [saving, setSaving] = useState(false);
  const stepUp = useOwnerStepUpDialog(setTone, setMessage);

  async function load() {
    const result = await getAdminRoles();
    setRows(result.data);
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      load().catch(() => { setTone("error"); setMessage("Nao foi possivel carregar papeis."); });
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!(await stepUp.requestStepUp())) return;
    setSaving(true);
    try {
      await grantAdminRole({ email, role });
      setEmail("");
      setTone("success");
      setMessage("Papel concedido com sucesso.");
      await load();
    } catch {
      setTone("error");
      setMessage("Nao foi possivel conceder o papel. Verifique se o usuario ja existe.");
    } finally {
      setSaving(false);
    }
  }

  async function revoke(id: string) {
    if (!(await stepUp.requestStepUp())) return;
    setSaving(true);
    try {
      await revokeAdminRole(id);
      setTone("success");
      setMessage("Papel revogado.");
      await load();
    } catch {
      setTone("error");
      setMessage("Nao foi possivel revogar. Papeis de ambiente devem ser removidos no Render.");
    } finally {
      setSaving(false);
    }
  }

  const counts = useMemo(() => ({
    owner: rows.filter((item) => item.role === "OWNER").length,
    nutri: rows.filter((item) => item.role === "NUTRITIONIST").length,
    run: rows.filter((item) => item.role === "RUN_COACH").length,
  }), [rows]);

  return (
    <>
      {stepUp.dialog}
      <AdminHeader eyebrow="Papeis" title="Controle de acesso" description="Conceda ou revogue Nutri Pro, Run Pro e Owner para logins existentes. Papeis vindos do Render continuam protegidos." />
      <Notice message={message} tone={tone} />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="app-card p-5">
          <p className="eyebrow">Novo acesso</p>
          <h2 className="mt-2 text-xl font-black text-white">Adicionar papel</h2>
          <label className="mt-5 block text-sm font-black text-[var(--text-muted)]">E-mail</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[var(--lime)]" placeholder="email@exemplo.com" type="email" required />
          <label className="mt-4 block text-sm font-black text-[var(--text-muted)]">Papel</label>
          <select value={role} onChange={(event) => setRole(event.target.value as AdminRoleName)} className="mt-2 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[var(--lime)]">
            <option value="NUTRITIONIST">Nutri Pro</option>
            <option value="RUN_COACH">Run Pro</option>
            <option value="OWNER">Owner</option>
          </select>
          <button type="submit" className="primary-button mt-5 w-full" disabled={saving}><Plus size={18} /> Conceder acesso</button>
        </form>
        <section className="app-card p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <MiniMetric label="Owner" value={String(counts.owner)} detail="acessos totais" />
            <MiniMetric label="Nutri Pro" value={String(counts.nutri)} detail="profissionais" />
            <MiniMetric label="Run Pro" value={String(counts.run)} detail="profissionais" />
          </div>
          <div className="mt-5 space-y-3">
            {rows.map((row) => (
              <article key={row.id} className="flex flex-col gap-3 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.28)] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-black text-white">{row.displayName}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{row.email}</p>
                  <p className="mt-2 text-xs font-black uppercase text-[var(--cyan)]">{row.label} · {row.source}</p>
                </div>
                <button type="button" onClick={() => void revoke(row.id)} disabled={!row.canRevoke || saving} className="secondary-button disabled:cursor-not-allowed disabled:opacity-50">
                  <Trash2 size={17} /> Revogar
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof getAdminSettings>> | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { getAdminSettings().then(setSettings).catch(() => setMessage("Nao foi possivel carregar configuracoes.")); }, []);
  return (
    <>
      <AdminHeader eyebrow="Tecnico" title="Configuracao da Gestao" description="Leitura protegida das configuracoes que determinam acesso e ambiente. Segredos continuam fora da interface." />
      <Notice message={message} tone="error" />
      {settings ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <MiniMetric label="OWNER_EMAILS" value={String(settings.ownerEmailsConfigured)} detail="emails configurados" />
          <MiniMetric label="NUTRITIONIST_EMAILS" value={String(settings.nutritionistEmailsConfigured)} detail="emails configurados" />
          <MiniMetric label="RUN_COACH_EMAILS" value={String(settings.runCoachEmailsConfigured)} detail="emails configurados" />
          <MiniMetric label="OWNER_DB_ROLES" value={settings.ownerDbRolesEnabled ? "ativo" : "bloqueado"} detail="Owner manual via banco" />
          <MiniMetric label="OWNER_GRANTS" value={settings.ownerRoleGrantsEnabled ? "ativo" : "bloqueado"} detail="Concessao manual de Owner" />
          <MiniMetric label="NODE_ENV" value={settings.nodeEnv} detail="ambiente da API" />
          <MiniMetric label="WEB_ORIGIN" value={settings.webOrigin ? "definido" : "vazio"} detail="origem web permitida" />
        </div>
      ) : <EmptyState text="Carregando configuracoes." />}
      <section className="app-card mt-5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-[var(--lime)]" size={22} />
          <div>
            <h2 className="text-xl font-black text-white">Como revogar acesso</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Papeis manuais sao revogados na aba Papeis. Papeis vindos do Render precisam ser removidos das variaveis de ambiente para evitar bloqueio acidental do dono.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function securityLabel(action: string) {
  return {
    professional_invite_previewed: "Codigo verificado",
    professional_invite_preview_failed: "Codigo recusado",
    professional_invite_created: "Convite criado",
    professional_invite_revoked: "Convite revogado",
    professional_connection_accepted: "Convite aceito",
    professional_permissions_updated: "Permissoes alteradas",
    professional_connection_revoked: "Conexao revogada",
    professional_touch_sent: "Toque enviado",
    admin_role_granted: "Papel concedido",
    admin_role_revoked: "Papel revogado",
    owner_step_up_success: "Owner confirmado",
    owner_step_up_failed: "Owner recusado",
  }[action] ?? action;
}

function securityTone(action: string) {
  if (action.includes("failed") || action.includes("revoked")) return "text-[var(--coral)] bg-[rgba(255,107,61,0.1)]";
  if (action.includes("accepted") || action.includes("granted")) return "text-[var(--lime)] bg-[rgba(183,255,42,0.1)]";
  return "text-[var(--cyan)] bg-[rgba(34,211,238,0.1)]";
}

export function AdminSecurityPage() {
  const [events, setEvents] = useState<AdminSecurityEvent[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getAdminSecurityEvents().then((result) => setEvents(result.data)).catch(() => setMessage("Nao foi possivel carregar eventos de auditoria."));
  }, []);

  return (
    <>
      <AdminHeader
        eyebrow="Auditoria"
        title="Convites Nutri Pro e Run Pro"
        description="Acompanhe verificacoes de codigo, aceite de convites, mudancas de permissao e revogacoes de Nutri Pro e Run Pro."
      />
      <Notice message={message} tone="error" />
      <section className="app-card overflow-hidden">
        {events.map((event) => (
          <article key={event.id} className="grid gap-3 border-b border-[var(--border)] p-4 last:border-b-0 lg:grid-cols-[190px_1fr_210px] lg:items-center">
            <span className={`w-fit rounded-[6px] px-3 py-1 text-xs font-black uppercase ${securityTone(event.action)}`}>{securityLabel(event.action)}</span>
            <div>
              <p className="text-sm font-black text-white">{event.actorName ?? event.actorEmail ?? "Usuario"}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                {event.targetEmail ? `Alvo: ${event.targetEmail}` : event.entityType}
                {" · "}
                {event.metadata?.kind ? `Produto: ${String(event.metadata.kind) === "run" ? "Run Pro" : "Nutri Pro"}` : "Produto: Gestao"}
              </p>
            </div>
            <time className="text-xs font-bold text-[var(--text-dim)]" dateTime={event.createdAt}>
              {new Date(event.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </time>
          </article>
        ))}
      </section>
      {!events.length && <EmptyState text="Nenhum evento de auditoria registrado ainda." />}
    </>
  );
}
