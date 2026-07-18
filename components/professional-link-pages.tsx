"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  ArrowRight,
  Check,
  ClipboardList,
  Dumbbell,
  GlassWater,
  Link2,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  acceptProfessionalInvite,
  listProfessionalConnections,
  previewProfessionalInvite,
  revokeProfessionalConnection,
  updateProfessionalPermissions,
  type ProfessionalConnection,
  type ProfessionalInvitePreview,
  type ProfessionalKind,
} from "@/lib/level-fit-api";
import { PageHeader } from "./page-header";

type Notice = { tone: "success" | "error"; message: string } | null;

const permissionOptions = [
  { id: "nutrition", label: "Alimentação", detail: "Refeições, metas e checklist.", icon: Apple },
  { id: "hydration", label: "Hidratação", detail: "Meta e registros de água.", icon: GlassWater },
  { id: "workouts", label: "Treinos", detail: "Planos, sessões e histórico.", icon: Dumbbell },
  { id: "run_checkins", label: "Check-ins TAF", detail: "Ritmo, execução e evolução física.", icon: ClipboardList },
  { id: "body_checkins", label: "Medidas privadas", detail: "Check-ins corporais sem fotos.", icon: ShieldCheck },
  { id: "progress_photos", label: "Fotos privadas", detail: "Somente se você permitir.", icon: LockKeyhole },
  { id: "notes", label: "Notas do dia", detail: "Observações curtas de rotina.", icon: UserCheck },
];

const kindCopy: Record<ProfessionalKind, { label: string; tone: string; cta: string }> = {
  nutrition: { label: "Nutri Pro", tone: "text-[var(--green)]", cta: "Abrir alimentação" },
  run: { label: "TAF Pro", tone: "text-[var(--coral)]", cta: "Abrir treinos" },
};

function NoticeBlock({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <div className={`mb-4 rounded-[8px] border p-4 text-sm font-bold ${notice.tone === "success" ? "border-[rgba(183,255,42,0.35)] bg-[rgba(183,255,42,0.08)] text-white" : "border-[rgba(255,79,119,0.35)] bg-[rgba(255,79,119,0.08)] text-white"}`} role="status" aria-live="polite">
      {notice.message}
    </div>
  );
}

function PermissionToggle({ id, selected, onToggle }: { id: string; selected: boolean; onToggle: () => void }) {
  const option = permissionOptions.find((item) => item.id === id) ?? permissionOptions[0];
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex min-h-[74px] items-start gap-3 rounded-[8px] border p-3 text-left transition-colors ${selected ? "border-[rgba(183,255,42,0.65)] bg-[rgba(183,255,42,0.1)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-[7px] ${selected ? "bg-[var(--lime)] text-[var(--lime-ink)]" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"}`}>
        {selected ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-white">{option.label}</span>
        <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{option.detail}</span>
      </span>
    </button>
  );
}

function ConnectionCard({ connection, onChanged }: { connection: ProfessionalConnection; onChanged: () => void }) {
  const [permissions, setPermissions] = useState(connection.permissions);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const active = connection.status === "active";
  const copy = kindCopy[connection.kind];

  function toggle(permission: string) {
    setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]);
  }

  async function savePermissions() {
    setSaving(true);
    setNotice(null);
    try {
      await updateProfessionalPermissions(connection.id, permissions);
      setNotice({ tone: "success", message: "Permissões atualizadas com segurança." });
      onChanged();
    } catch {
      setNotice({ tone: "error", message: "Não foi possível atualizar as permissões agora." });
    } finally {
      setSaving(false);
    }
  }

  async function revoke() {
    setSaving(true);
    setNotice(null);
    try {
      await revokeProfessionalConnection(connection.id);
      setNotice({ tone: "success", message: "Acesso revogado. O profissional não verá novos dados." });
      onChanged();
    } catch {
      setNotice({ tone: "error", message: "Não foi possível revogar o acesso agora." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="app-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`text-xs font-black uppercase ${copy.tone}`}>{copy.label}</p>
          <h2 className="mt-2 text-xl font-black text-white">{connection.professionalName}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{connection.professionalRole}</p>
        </div>
        <span className={`inline-flex min-h-8 items-center rounded-[6px] px-3 text-xs font-black ${active ? "bg-[rgba(56,217,121,0.12)] text-[var(--green)]" : "bg-[rgba(148,163,184,0.12)] text-[var(--text-muted)]"}`}>
          {active ? "ATIVO" : "REVOGADO"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="eyebrow">Plano atual</p>
          <p className="mt-2 text-sm font-black text-white">{connection.planTitle}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{connection.nextEventLabel ?? "Sem próximo retorno definido."}</p>
        </div>
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="eyebrow">Controle</p>
          <p className="mt-2 text-sm font-black text-white">Você decide o que compartilha</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Fotos e dados sensíveis precisam de permissão explícita.</p>
        </div>
      </div>
      {active && (
        <>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {permissionOptions.map((option) => <PermissionToggle key={option.id} id={option.id} selected={permissions.includes(option.id)} onToggle={() => toggle(option.id)} />)}
          </div>
          <NoticeBlock notice={notice} />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button onClick={savePermissions} disabled={saving} className="primary-button">{saving ? "Salvando..." : "Salvar permissões"}</button>
            <button onClick={revoke} disabled={saving} className="secondary-button text-[var(--danger)]"><Trash2 size={17} /> Revogar acesso</button>
            <Link href="/my-plan" className="ghost-button sm:ml-auto">Ver meu plano <ArrowRight size={17} /></Link>
          </div>
        </>
      )}
    </article>
  );
}

export function ProfessionalsPage() {
  const [connections, setConnections] = useState<ProfessionalConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<ProfessionalInvitePreview | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const activeConnections = connections.filter((item) => item.status === "active");

  async function loadConnections() {
    setLoading(true);
    try {
      const result = await listProfessionalConnections();
      setConnections(result.data);
    } catch {
      setNotice({ tone: "error", message: "Não foi possível carregar suas conexões agora." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => void loadConnections(), 0);
    return () => window.clearTimeout(id);
  }, []);

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setPreview(null);
    try {
      const result = await previewProfessionalInvite(code);
      setPreview(result);
      setPermissions(result.defaultPermissions);
    } catch {
      setNotice({ tone: "error", message: "Código não encontrado ou expirado." });
    }
  }

  function togglePermission(permission: string) {
    setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]);
  }

  async function acceptInvite() {
    if (!preview) return;
    setNotice(null);
    try {
      await acceptProfessionalInvite(preview.code, permissions);
      setNotice({ tone: "success", message: `${preview.professionalName} conectado ao seu LevelFit.` });
      setCode("");
      setPreview(null);
      await loadConnections();
    } catch {
      setNotice({ tone: "error", message: "Não foi possível aceitar esse convite agora." });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader title="Profissionais conectados" description="Conecte Nutri Pro ou TAF Pro apenas quando quiser compartilhar seus dados com alguém de confiança." />
      <NoticeBlock notice={notice} />
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.4fr]">
        <form onSubmit={handlePreview} className="app-card p-4 sm:p-5">
          <p className="eyebrow text-[var(--lime)]">Convite</p>
          <h2 className="mt-2 text-xl font-black text-white">Entrar com código</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">O profissional envia um código. Você revisa o acesso antes de conectar.</p>
          <label htmlFor="invite-code" className="mt-5 block text-sm font-black text-white">Código recebido</label>
          <input id="invite-code" value={code} onChange={(event) => setCode(event.target.value)} className="field mt-2 uppercase" placeholder="LF-NUTRI-000" autoComplete="off" />
          <button className="primary-button mt-3 w-full"><Link2 size={18} /> Verificar convite</button>

          {preview && (
            <div className="mt-5 rounded-[8px] border border-[rgba(183,255,42,0.45)] bg-[rgba(183,255,42,0.08)] p-4">
              <p className="text-xs font-black uppercase text-[var(--lime)]">{kindCopy[preview.kind].label}</p>
              <h3 className="mt-2 text-lg font-black text-white">{preview.professionalName}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{preview.professionalRole}</p>
              <p className="mt-3 text-sm leading-6 text-white">{preview.headline}</p>
              <div className="mt-4 grid gap-2">
                {permissionOptions.map((option) => <PermissionToggle key={option.id} id={option.id} selected={permissions.includes(option.id)} onToggle={() => togglePermission(option.id)} />)}
              </div>
              <button type="button" onClick={acceptInvite} className="primary-button mt-4 w-full"><Check size={18} /> Aceitar e conectar</button>
            </div>
          )}
        </form>

        <div className="grid gap-4">
          {loading ? (
            <section className="app-card p-5"><p className="text-sm font-bold text-[var(--text-muted)]">Carregando conexões...</p></section>
          ) : activeConnections.length ? (
            activeConnections.map((connection) => <ConnectionCard key={connection.id} connection={connection} onChanged={loadConnections} />)
          ) : (
            <section className="app-card p-5 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-[8px] bg-[var(--surface-soft)] text-[var(--lime)]"><UserCheck size={24} /></span>
              <h2 className="mt-4 text-xl font-black text-white">Nenhum profissional conectado</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">Você pode continuar usando o LevelFit solo. Quando receber um código de Nutri ou TAF, conecte por aqui.</p>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

function TrackCard({ title, label, description, items, href, active }: { title: string; label: string; description: string; items: string[]; href: string; active: boolean }) {
  return (
    <article className={`app-card p-4 sm:p-5 ${active ? "border-[rgba(183,255,42,0.35)]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-black uppercase ${active ? "text-[var(--lime)]" : "text-[var(--text-dim)]"}`}>{label}</p>
          <h2 className="mt-2 text-xl font-black text-white">{title}</h2>
        </div>
        <span className={`inline-flex min-h-8 items-center rounded-[6px] px-3 text-xs font-black ${active ? "bg-[rgba(183,255,42,0.12)] text-[var(--lime)]" : "bg-[rgba(148,163,184,0.12)] text-[var(--text-muted)]"}`}>{active ? "ATIVO" : "NÃO CONECTADO"}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      <div className="mt-4 grid gap-2">
        {items.map((item) => <div key={item} className="flex min-h-10 items-center gap-2 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold text-white"><Check size={16} className="text-[var(--lime)]" /> {item}</div>)}
      </div>
      <Link href={href} className="ghost-button mt-4 w-full justify-center">Abrir área <ArrowRight size={17} /></Link>
    </article>
  );
}

export function MyPlanPage() {
  const [connections, setConnections] = useState<ProfessionalConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const activeConnections = useMemo(() => connections.filter((item) => item.status === "active"), [connections]);
  const nutri = activeConnections.find((item) => item.kind === "nutrition");
  const run = activeConnections.find((item) => item.kind === "run");

  useEffect(() => {
    async function load() {
      try {
        const result = await listProfessionalConnections();
        setConnections(result.data);
      } catch {
        setNotice({ tone: "error", message: "Não foi possível carregar seu plano agora." });
      } finally {
        setLoading(false);
      }
    }
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader title="Meu plano" description="Veja o que é seu plano solo e o que veio de um profissional conectado." action={<Link href="/professionals" className="secondary-button"><UserCheck size={18} /> Profissionais</Link>} />
      <NoticeBlock notice={notice} />
      {loading ? (
        <section className="app-card p-5"><p className="text-sm font-bold text-[var(--text-muted)]">Carregando plano...</p></section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-3">
          <TrackCard
            title="LevelFit Solo"
            label="Base do app"
            description="Missões, hidratação, treinos e progresso continuam funcionando mesmo sem profissional."
            items={["Missões diárias", "Treino do dia", "Água e alimentação", "XP e conquistas"]}
            href="/"
            active
          />
          <TrackCard
            title={nutri?.planTitle ?? "Nutri Pro"}
            label="Nutrição"
            description={nutri ? `${nutri.professionalName} acompanha os dados que você autorizou.` : "Conecte um nutricionista para receber ajustes e plano alimentar no app."}
            items={nutri ? ["Plano alimentar", "Check-ins de alimentação", nutri.nextEventLabel ?? "Retorno a combinar"] : ["Aguardando código", "Permissões sob seu controle", "Sem compartilhamento ativo"]}
            href={nutri ? "/nutrition" : "/professionals"}
            active={Boolean(nutri)}
          />
          <TrackCard
            title={run?.planTitle ?? "TAF Pro"}
            label="Treino e corrida"
            description={run ? `${run.professionalName} acompanha seu treino e evolução TAF autorizados.` : "Conecte um coach para receber rotina TAF sem GPS nesta fase."}
            items={run ? ["Treinos TAF", "Check-ins de execução", run.nextEventLabel ?? "Sessão a combinar"] : ["Aguardando código", "Planilhas e rotinas do coach", "Histórico controlado por você"]}
            href={run ? "/workouts" : "/professionals"}
            active={Boolean(run)}
          />
        </section>
      )}

      <section className="app-card mt-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Privacidade</p>
            <h2 className="mt-2 text-lg font-black text-white">O usuário continua no controle</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Conexões profissionais não dão acesso automático a fotos, medidas ou notas. Cada permissão pode ser alterada ou revogada.</p>
          </div>
          <Link href="/settings/security" className="secondary-button"><ShieldCheck size={18} /> Segurança</Link>
        </div>
      </section>
    </div>
  );
}
