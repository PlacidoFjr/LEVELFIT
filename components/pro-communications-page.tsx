"use client";

import { BellRing, CheckCircle2, Clock3, MessageSquareText, Send, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  listProfessionalMessageHistory,
  listProfessionalMessageRecipients,
  sendProfessionalMessage,
  type ProfessionalKind,
  type ProfessionalMessageCategory,
  type ProfessionalMessageHistoryItem,
  type ProfessionalMessageRecipient,
} from "@/lib/level-fit-api";

type Notice = { tone: "success" | "error" | "neutral"; message: string } | null;

const categoryLabels: Record<ProfessionalMessageCategory, string> = {
  reminder: "Lembrete",
  checkin: "Check-in",
  plan_update: "Plano atualizado",
  encouragement: "Incentivo",
  appointment: "Agenda",
  free: "Mensagem livre",
};

const templates = {
  nutrition: [
    {
      category: "checkin" as const,
      title: "Check-in alimentar",
      body: "Passando para lembrar do seu check-in de hoje. Responda no seu ritmo, sem cobrança.",
      actionUrl: "/nutrition",
    },
    {
      category: "reminder" as const,
      title: "Lembrete do Nutri Pro",
      body: "Tente manter uma refeição simples com proteína e cor hoje. Pequenas escolhas também contam.",
      actionUrl: "/nutrition",
    },
    {
      category: "encouragement" as const,
      title: "Boa constância",
      body: "Você não precisa acertar tudo. O foco é voltar para o plano possível na próxima refeição.",
      actionUrl: "/my-plan",
    },
  ],
  run: [
    {
      category: "reminder" as const,
      title: "Treino TAF de hoje",
      body: "Seu treino está pronto. Faça no ritmo combinado e priorize técnica antes de intensidade.",
      actionUrl: "/workouts",
    },
    {
      category: "checkin" as const,
      title: "Check-in pós-treino",
      body: "Quando terminar, registre como foi o treino. Isso ajuda o ajuste da próxima sessão.",
      actionUrl: "/workouts",
    },
    {
      category: "encouragement" as const,
      title: "Recuperação também é treino",
      body: "Se o corpo estiver pesado, mantenha o combinado leve. Constância vence excesso.",
      actionUrl: "/workouts",
    },
  ],
} satisfies Record<ProfessionalKind, Array<{ category: ProfessionalMessageCategory; title: string; body: string; actionUrl: string }>>;

function NoticeBlock({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const color = notice.tone === "error" ? "border-[rgba(255,107,61,0.35)] bg-[rgba(255,107,61,0.08)]" : notice.tone === "success" ? "border-[rgba(56,217,121,0.28)] bg-[rgba(56,217,121,0.08)]" : "border-[rgba(34,211,238,0.24)] bg-[rgba(34,211,238,0.08)]";
  return <div className={`mb-5 rounded-[8px] border p-4 text-sm font-bold text-white ${color}`}>{notice.message}</div>;
}

function recipientLabel(recipient?: ProfessionalMessageRecipient) {
  if (!recipient) return "Selecione um usuario conectado";
  return `${recipient.displayName} - ${recipient.planTitle}`;
}

export function ProCommunicationsPage({ kind }: { kind: ProfessionalKind }) {
  const [recipients, setRecipients] = useState<ProfessionalMessageRecipient[]>([]);
  const [history, setHistory] = useState<ProfessionalMessageHistoryItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [category, setCategory] = useState<ProfessionalMessageCategory>("reminder");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionUrl, setActionUrl] = useState(kind === "run" ? "/workouts" : "/nutrition");
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const productLabel = kind === "run" ? "Run Pro" : "Nutri Pro";
  const selected = useMemo(() => recipients.find((item) => item.userId === selectedUserId), [recipients, selectedUserId]);

  async function loadHistory() {
    const result = await listProfessionalMessageHistory(kind);
    setHistory(result.data);
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      Promise.all([listProfessionalMessageRecipients(kind), listProfessionalMessageHistory(kind)])
        .then(([recipientsResult, historyResult]) => {
          setRecipients(recipientsResult.data);
          setHistory(historyResult.data);
          setSelectedUserId((current) => current || recipientsResult.data[0]?.userId || "");
        })
        .catch(() => setNotice({ tone: "error", message: "Nao foi possivel carregar usuarios conectados e historico." }))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(id);
  }, [kind]);

  function applyTemplate(template: (typeof templates)[ProfessionalKind][number]) {
    setCategory(template.category);
    setTitle(template.title);
    setBody(template.body);
    setActionUrl(template.actionUrl);
    setNotice(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) {
      setNotice({ tone: "error", message: "Selecione um usuario conectado antes de enviar." });
      return;
    }
    setSending(true);
    setNotice(null);
    try {
      await sendProfessionalMessage({ kind, targetUserId: selectedUserId, category, title, body, actionUrl });
      setNotice({ tone: "success", message: "Toque enviado para o sino do usuario." });
      await loadHistory();
    } catch {
      setNotice({ tone: "error", message: "Nao foi possivel enviar o toque agora." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      <header className="mb-5 rounded-[10px] border border-[rgba(183,255,42,0.18)] bg-[linear-gradient(135deg,rgba(183,255,42,0.1),rgba(16,22,29,0.92)_42%,rgba(34,211,238,0.08))] p-5">
        <p className="eyebrow text-[var(--lime)]">{productLabel}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">Toques Pro</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">Envie lembretes internos gentis para usuarios conectados. Nada de dados sensiveis em push ou e-mail nesta fase.</p>
      </header>

      <NoticeBlock notice={notice} />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="app-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-[8px] bg-[rgba(183,255,42,0.1)] text-[var(--lime)]"><UsersRound size={21} /></span>
            <div>
              <p className="eyebrow">Destinatario</p>
              <h2 className="mt-2 text-xl font-black text-white">{recipientLabel(selected)}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{loading ? "Carregando conexoes reais..." : `${recipients.length} usuarios conectados a ${productLabel}.`}</p>
            </div>
          </div>
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="mt-5 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[var(--lime)]">
            {recipients.map((recipient) => <option key={recipient.connectionId} value={recipient.userId}>{recipient.displayName} - {recipient.email}</option>)}
            {!recipients.length && <option value="">Nenhum usuario conectado</option>}
          </select>
          <div className="mt-5 space-y-3">
            {templates[kind].map((template) => (
              <button key={template.title} type="button" onClick={() => applyTemplate(template)} className="w-full rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.32)] p-4 text-left transition-colors hover:border-[rgba(183,255,42,0.5)]">
                <span className="text-xs font-black uppercase text-[var(--lime)]">{categoryLabels[template.category]}</span>
                <span className="mt-2 block text-sm font-black text-white">{template.title}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{template.body}</span>
              </button>
            ))}
          </div>
        </section>

        <form onSubmit={submit} className="app-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-[8px] bg-[rgba(34,211,238,0.1)] text-[var(--cyan)]"><MessageSquareText size={21} /></span>
            <div>
              <p className="eyebrow">Mensagem interna</p>
              <h2 className="mt-2 text-xl font-black text-white">Enviar toque ao app</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">A mensagem aparece no sino do LevelFit e fica registrada na auditoria da Gestao.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr]">
            <label className="block text-sm font-black text-[var(--text-muted)]">
              Tipo
              <select value={category} onChange={(event) => setCategory(event.target.value as ProfessionalMessageCategory)} className="mt-2 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[var(--lime)]">
                {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-black text-[var(--text-muted)]">
              Acao ao abrir
              <select value={actionUrl} onChange={(event) => setActionUrl(event.target.value)} className="mt-2 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[var(--lime)]">
                <option value="/nutrition">Alimentacao</option>
                <option value="/hydration">Hidratacao</option>
                <option value="/workouts">Treinos</option>
                <option value="/my-plan">Meu plano</option>
                <option value="/professionals">Profissionais</option>
              </select>
            </label>
          </div>

          <label className="mt-5 block text-sm font-black text-[var(--text-muted)]">
            Titulo
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} className="mt-2 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[var(--lime)]" placeholder="Ex: Check-in de hoje" required />
          </label>
          <label className="mt-5 block text-sm font-black text-[var(--text-muted)]">
            Mensagem
            <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} className="mt-2 min-h-36 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-bold leading-6 text-white outline-none focus:border-[var(--lime)]" placeholder="Escreva de forma leve, sem cobrança toxica." required />
          </label>

          <div className="mt-5 grid gap-3 rounded-[8px] border border-[var(--border)] bg-[rgba(8,11,15,0.3)] p-4 md:grid-cols-2">
            <div className="flex gap-3"><CheckCircle2 className="mt-0.5 text-[var(--lime)]" size={18} /><p className="text-xs leading-5 text-[var(--text-muted)]">Sem peso, medidas ou fotos no texto da notificacao.</p></div>
            <div className="flex gap-3"><BellRing className="mt-0.5 text-[var(--cyan)]" size={18} /><p className="text-xs leading-5 text-[var(--text-muted)]">Canal atual: somente notificacao interna do app.</p></div>
          </div>

          <button type="submit" disabled={sending || !recipients.length} className="primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"><Send size={18} /> {sending ? "Enviando..." : "Enviar toque"}</button>
        </form>
      </div>

      <section className="app-card mt-5 overflow-hidden">
        <div className="border-b border-[var(--border)] p-5">
          <p className="eyebrow">Historico</p>
          <h2 className="mt-2 text-xl font-black text-white">Ultimos Toques enviados</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Registro operacional do que saiu deste login profissional para usuarios conectados.</p>
        </div>
        {history.map((item) => (
          <article key={item.id} className="grid gap-3 border-b border-[var(--border)] p-4 last:border-b-0 lg:grid-cols-[190px_1fr_180px] lg:items-center">
            <div>
              <span className="rounded-[6px] bg-[rgba(183,255,42,0.1)] px-2 py-1 text-xs font-black uppercase text-[var(--lime)]">
                {categoryLabels[item.category as ProfessionalMessageCategory] ?? item.category}
              </span>
              <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">{item.targetName}</p>
            </div>
            <div>
              <p className="text-sm font-black text-white">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">{item.body || "Mensagem registrada."}</p>
            </div>
            <time className="flex items-center gap-2 text-xs font-bold text-[var(--text-dim)]" dateTime={item.createdAt}>
              <Clock3 size={15} /> {new Date(item.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </time>
          </article>
        ))}
        {!history.length && <div className="p-5 text-sm font-bold text-[var(--text-muted)]">Nenhum Toque enviado por este login ainda.</div>}
      </section>
    </div>
  );
}
