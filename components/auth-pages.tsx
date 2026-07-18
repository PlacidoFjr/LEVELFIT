"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Dumbbell, Eye, EyeOff, HeartPulse, Salad, ShieldCheck, Sparkles, Target } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ApiClientError, getDefaultRoute, loginUser, registerUser, requestPasswordReset, useAuthSession } from "@/lib/auth-client";
import { addMeasurement, updateMe, updateNotificationPreferences } from "@/lib/level-fit-api";
import { activityOptions } from "@/lib/mock-data";
import { LevelFitLogo } from "./level-fit-logo";
import { RevealGroup } from "./premium-motion";

function AuthBrand() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-3 text-white" aria-label="LevelFit">
      <LevelFitLogo className="text-lg" />
    </Link>
  );
}

function PasswordField({ id = "password", name = id, label = "Senha", placeholder = "Sua senha" }: { id?: string; name?: string; label?: string; placeholder?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <label htmlFor={id} className="block text-sm font-bold text-[var(--text-muted)]">
      {label}
      <span className="relative mt-2 block">
        <input id={id} name={name} type={visible ? "text" : "password"} className="field pr-12" placeholder={placeholder} required minLength={10} autoComplete={id.includes("register") ? "new-password" : "current-password"} />
        <button type="button" onClick={() => setVisible((value) => !value)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-[6px] text-[var(--text-muted)] hover:text-white" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} title={visible ? "Ocultar senha" : "Mostrar senha"}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}

function AuthFrame({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.92fr]">
      <section className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 sm:py-8">
        <div className="w-full max-w-md">
          <RevealGroup>
            <div data-reveal><AuthBrand /></div>
            <div className="mt-7 sm:mt-10" data-reveal>
              <p className="eyebrow text-[var(--lime)]">{eyebrow}</p>
              <h1 className="mt-3 text-[1.7rem] font-black leading-tight text-white sm:text-3xl">{title}</h1>
              <p className="mt-3 text-sm leading-5 text-[var(--text-muted)] sm:leading-6">{description}</p>
            </div>
            <div className="mt-6 sm:mt-8" data-reveal>{children}</div>
          </RevealGroup>
        </div>
      </section>
      <aside className="relative hidden min-h-screen overflow-hidden border-l border-[var(--border)] lg:block">
        <Image src="/assets/pulse-companion.png" alt="Pulse, companheiro LevelFit" fill priority sizes="46vw" className="pulse-idle object-cover object-[center_22%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b0f] via-transparent to-[rgba(8,11,15,0.15)]" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="max-w-md text-2xl font-black leading-9 text-white">Seu ritmo é seu. O LevelFit ajuda a torná-lo visível.</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">Sem punição por pausas e sem promessas irreais. Apenas o próximo passo possível.</p>
        </div>
      </aside>
    </main>
  );
}

function formError(error: unknown) {
  if (error instanceof ApiClientError && error.code === "EMAIL_VERIFICATION_REQUIRED") return "Confirme seu e-mail antes de entrar. Se não encontrar o link em alguns minutos, confira também Spam, Lixo eletrônico e Promoções.";
  if (error instanceof ApiClientError) return error.message;
  return "Não foi possível concluir agora. Verifique a API e tente novamente.";
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const data = new FormData(event.currentTarget);
    try {
      const user = await loginUser(String(data.get("email")), String(data.get("password")));
      window.location.assign(getDefaultRoute(user));
    } catch (err) {
      setError(formError(err));
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    const nextEmail = email.trim();
    setError(null);
    setMessage(null);
    if (!nextEmail) {
      setError("Informe seu e-mail para receber o link de redefinição de senha.");
      return;
    }

    setResetting(true);
    try {
      await requestPasswordReset(nextEmail);
      setMessage("Enviamos um link para redefinir sua senha. Confira também Spam, Lixo eletrônico e Promoções.");
    } catch (err) {
      setError(formError(err));
    } finally {
      setResetting(false);
    }
  }

  return (
    <AuthFrame eyebrow="Que bom te ver de volta" title="Entre no seu ritmo" description="Acesse seu plano de hoje e continue de onde parou.">
      <form onSubmit={submit} className="space-y-5">
        <label htmlFor="email" className="block text-sm font-bold text-[var(--text-muted)]">
          E-mail
          <input id="email" name="email" type="email" className="field mt-2" placeholder="voce@exemplo.com" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <PasswordField />
        {error && <div className="border-l-2 border-[var(--danger)] bg-[rgba(244,63,94,0.08)] p-3 text-sm leading-5 text-white" role="alert">{error}</div>}
        {message && <div className="border-l-2 border-[var(--lime)] bg-[rgba(183,255,42,0.08)] p-3 text-sm leading-5 text-white" role="status">{message}</div>}
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><input type="checkbox" className="size-4 accent-[var(--lime)]" defaultChecked /> Manter conectado</label>
          <button type="button" onClick={forgotPassword} disabled={resetting} className="text-sm font-bold text-[var(--lime)] disabled:opacity-60">{resetting ? "Enviando..." : "Esqueci a senha"}</button>
        </div>
        <button type="submit" disabled={loading} className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"} <ArrowRight size={18} />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">Ainda não tem conta? <Link href="/register" className="font-bold text-[var(--lime)]">Criar conta</Link></p>
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--text-dim)]"><ShieldCheck size={15} /> Conexão segura e dados privados</div>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorCode(null);
    setMessage(null);
    setLoading(true);

    const data = new FormData(event.currentTarget);
    try {
      const user = await registerUser({
        displayName: String(data.get("displayName")),
        email: String(data.get("email")),
        password: String(data.get("password")),
        gender: String(data.get("gender") || ""),
      });

      if (user) {
        router.replace("/onboarding");
        return;
      }

      setMessage("Conta criada. Confira sua caixa de entrada para confirmar o acesso. Se não aparecer em alguns minutos, olhe também Spam, Lixo eletrônico e Promoções.");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "EMAIL_UNAVAILABLE") {
        setError("Este e-mail já está cadastrado no LevelFit. Entre com ele ou recupere sua senha.");
        setErrorCode(err.code);
      } else {
        setError(formError(err));
        setErrorCode(err instanceof ApiClientError ? err.code : null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    const nextEmail = email.trim();
    setError(null);
    setErrorCode(null);
    setMessage(null);
    if (!nextEmail) {
      setError("Informe seu e-mail para receber o link de redefinição de senha.");
      return;
    }

    setResetting(true);
    try {
      await requestPasswordReset(nextEmail);
      setMessage("Enviamos um link para redefinir sua senha. Confira também Spam, Lixo eletrônico e Promoções.");
    } catch (err) {
      setError(formError(err));
      setErrorCode(err instanceof ApiClientError ? err.code : null);
    } finally {
      setResetting(false);
    }
  }


  return (
    <AuthFrame eyebrow="Comece com leveza" title="Crie sua conta" description="Leva menos de dois minutos. Suas preferências podem mudar depois.">
      <form onSubmit={submit} className="space-y-5">
        <label htmlFor="name" className="block text-sm font-bold text-[var(--text-muted)]">
          Como quer que a gente te chame?
          <input id="name" name="displayName" className="field mt-2" placeholder="Seu nome" required autoComplete="name" />
        </label>
        <label htmlFor="gender" className="block text-sm font-bold text-[var(--text-muted)]">
          Gênero <span className="font-medium text-[var(--text-dim)]">(opcional)</span>
          <select id="gender" name="gender" className="field mt-2" defaultValue="" autoComplete="sex">
            <option value="">Prefiro não informar</option>
            <option value="male_cis">Homem cis</option>
            <option value="female_cis">Mulher cis</option>
            <option value="male_trans">Homem trans</option>
            <option value="female_trans">Mulher trans</option>
          </select>
        </label>
        <label htmlFor="register-email" className="block text-sm font-bold text-[var(--text-muted)]">
          E-mail
          <input id="register-email" name="email" type="email" className="field mt-2" placeholder="voce@exemplo.com" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <PasswordField id="register-password" name="password" label="Crie uma senha" placeholder="Mínimo de 10 caracteres" />
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--text-muted)]">
          <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--lime)]" required />
          <span>Li e aceito os termos de uso e a política de privacidade.</span>
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-[var(--text-muted)]">
          <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--lime)]" required />
          <span>Autorizo o tratamento dos meus dados sensíveis de saúde para personalizar minha experiência no LevelFit.</span>
        </label>
        {error && (
          <div className="border-l-2 border-[var(--danger)] bg-[rgba(244,63,94,0.08)] p-3 text-sm leading-5 text-white" role="alert">
            <p>{error}</p>
            {errorCode === "EMAIL_UNAVAILABLE" && (
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/login" className="font-bold text-[var(--lime)]">Ir para login</Link>
                <button type="button" onClick={forgotPassword} disabled={resetting} className="font-bold text-[var(--lime)] disabled:opacity-60">{resetting ? "Enviando..." : "Esqueci a senha"}</button>
              </div>
            )}
          </div>
        )}
        {message && <div className="border-l-2 border-[var(--lime)] bg-[rgba(183,255,42,0.08)] p-3 text-sm leading-5 text-white" role="status">{message}</div>}
        <button type="submit" disabled={loading} className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Criando conta..." : "Continuar"} <ArrowRight size={18} />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">Já tem conta? <Link href="/login" className="font-bold text-[var(--lime)]">Entrar</Link></p>
    </AuthFrame>
  );
}

const goals = [
  { id: "consistency", label: "Criar constância", detail: "Uma rotina que cabe na vida real", icon: Target, color: "var(--lime)" },
  { id: "strength", label: "Ganhar força", detail: "Evolução gradual e recuperação", icon: Dumbbell, color: "var(--coral)" },
  { id: "conditioning", label: "Ter mais energia", detail: "Movimento, sono e hidratação", icon: HeartPulse, color: "var(--cyan)" },
  { id: "nutrition", label: "Comer com mais equilíbrio", detail: "Variedade sem dieta extrema", icon: Salad, color: "var(--green)" },
];

export function OnboardingPage() {
  const router = useRouter();
  const session = useAuthSession();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("consistency");
  const [activity, setActivity] = useState("returning");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [modality, setModality] = useState("academia");
  const [customModality, setCustomModality] = useState("");
  const [workoutTime, setWorkoutTime] = useState("18:30");
  const [reminders, setReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.loading && !session.authenticated) router.replace("/login");
  }, [router, session.authenticated, session.loading]);

  async function finish() {
    if (step < 3) {
      setStep((value) => value + 1);
      return;
    }
    if (!session.authenticated) {
      router.replace("/login");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const ageNumber = Number(age);
      const birthDate = ageNumber >= 10 && ageNumber <= 100 ? `${new Date().getFullYear() - ageNumber}-01-01` : undefined;
      const heightNumber = Number(heightCm);
      const weightNumber = Number(weightKg);
      await Promise.all([
        updateMe({
          fitnessGoal: goal,
          activityLevel: activity,
          birthDate,
          heightCm: heightNumber >= 80 && heightNumber <= 250 ? heightNumber : undefined,
        }),
        updateNotificationPreferences({
          workoutRemindersEnabled: reminders,
          preferredWorkoutTime: reminders ? workoutTime : undefined,
        }),
        weightNumber >= 20 && weightNumber <= 500
          ? addMeasurement({ weightKg: weightNumber, notes: `Check-in inicial. Modalidade: ${modality === "other" ? customModality || "outra" : modality}.` })
          : Promise.resolve(),
      ]);
      window.location.assign("/");
    } catch (err) {
      setError(formError(err));
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-3 py-5 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between"><AuthBrand /><span className="text-sm font-bold text-[var(--text-muted)]">Etapa {step} de 3</span></div>
        <div className="mt-6 grid grid-cols-3 gap-2" aria-label={`Etapa ${step} de 3`}>
          {[1, 2, 3].map((item) => <span key={item} className={`h-1.5 rounded-[3px] ${item <= step ? "bg-[var(--lime)]" : "bg-[var(--surface-soft)]"}`} />)}
        </div>

        <section className="mt-8 sm:mt-10">
          <p className="eyebrow text-[var(--lime)]">{step === 1 ? "Seu foco" : step === 2 ? "Seu momento" : "Sua rotina"}</p>
          <h1 className="mt-3 text-[1.7rem] font-black leading-tight text-white sm:text-3xl">{step === 1 ? "O que você quer construir?" : step === 2 ? "Como está sua atividade hoje?" : "Quando prefere receber um lembrete?"}</h1>
          <p className="mt-3 text-sm leading-5 text-[var(--text-muted)] sm:leading-6">{step === 1 ? "Escolha o objetivo que mais importa agora. Ele pode mudar depois." : step === 2 ? "Isso ajuda a sugerir um primeiro plano confortável." : "Lembretes são opcionais e respeitam seu horário silencioso."}</p>
        </section>

        {step === 1 && <div className="mt-8 grid gap-3 sm:grid-cols-2">{goals.map(({ id, label, detail, icon: Icon, color }) => <button key={id} onClick={() => setGoal(id)} className={`app-card flex min-h-[112px] items-center gap-4 p-4 text-left ${goal === id ? "border-[var(--lime)]" : ""}`}><span className="grid size-11 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-soft)]" style={{ color }}><Icon size={22} /></span><span className="flex-1"><strong className="block text-sm text-white">{label}</strong><span className="mt-1 block text-xs text-[var(--text-muted)]">{detail}</span></span>{goal === id && <span className="grid size-6 place-items-center rounded-full bg-[var(--lime)] text-[var(--lime-ink)]"><Check size={15} strokeWidth={3} /></span>}</button>)}</div>}

        {step === 2 && <div className="mt-8 grid gap-3 sm:grid-cols-2">{[{ id: "beginner", label: "Estou começando", detail: "Quero aprender o básico" }, { id: "returning", label: "Estou voltando", detail: "Tive uma pausa e quero retomar" }, { id: "occasional", label: "Faço às vezes", detail: "Quero ganhar regularidade" }, { id: "active", label: "Já tenho rotina", detail: "Quero organizar e evoluir" }].map((item, index) => { const Icon = activityOptions[index]?.icon ?? Sparkles; return <button key={item.id} onClick={() => setActivity(item.id)} className={`app-card flex min-h-[104px] items-center gap-4 p-4 text-left ${activity === item.id ? "border-[var(--lime)]" : ""}`}><span className="grid size-11 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--lime)]"><Icon size={22} /></span><span className="flex-1"><strong className="block text-sm text-white">{item.label}</strong><span className="mt-1 block text-xs text-[var(--text-muted)]">{item.detail}</span></span>{activity === item.id && <Check className="text-[var(--lime)]" size={19} />}</button>; })}</div>}

        {step === 3 && <div className="mt-8 space-y-4"><div className="app-card p-5"><label htmlFor="workout-time" className="text-sm font-bold text-white">Horário preferido de treino</label><input id="workout-time" type="time" className="field mt-3" value={workoutTime} onChange={(event) => setWorkoutTime(event.target.value)} /></div><div className="app-card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-[7px] bg-[rgba(183,255,42,0.1)] text-[var(--lime)]"><Sparkles size={22} /></span><div className="flex-1"><p className="text-sm font-bold text-white">Lembrete gentil</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">No máximo uma vez no horário escolhido.</p></div><button role="switch" aria-checked={reminders} onClick={() => setReminders((value) => !value)} className={`relative h-7 w-12 rounded-full ${reminders ? "bg-[var(--lime)]" : "bg-[var(--surface-soft)]"}`}><span className={`absolute top-1 size-[18px] rounded-full transition-transform ${reminders ? "left-1 translate-x-5 bg-[var(--lime-ink)]" : "left-1 bg-[var(--text-muted)]"}`} /></button></div><div className="flex gap-3 border-l-2 border-[var(--cyan)] bg-[rgba(34,211,238,0.06)] p-4 text-xs leading-5 text-[var(--text-muted)]"><ShieldCheck size={19} className="shrink-0 text-[var(--cyan)]" /> Dados de saúde são privados. Ranking e compartilhamento permanecem desativados.</div></div>}

        {step === 3 && <div className="mt-4 space-y-4"><div className="app-card p-5"><p className="text-sm font-bold text-white">Dados iniciais opcionais</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Ajudam a ajustar o plano sem aparecer no ranking.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><input className="field" type="number" min={10} max={100} placeholder="Idade" value={age} onChange={(event) => setAge(event.target.value)} /><input className="field" type="number" min={80} max={250} placeholder="Altura cm" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} /><input className="field" type="number" min={20} max={500} step="0.1" placeholder="Peso kg" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} /></div></div><div className="app-card p-5"><label htmlFor="modality" className="text-sm font-bold text-white">Modalidade principal</label><select id="modality" className="field mt-3" value={modality} onChange={(event) => setModality(event.target.value)}><option value="academia">Academia</option><option value="casa">Treino em casa</option><option value="corrida">Corrida ou caminhada</option><option value="luta">Luta ou arte marcial</option><option value="esporte">Esporte</option><option value="other">Outra</option></select>{modality === "other" && <input className="field mt-3" placeholder="Qual modalidade?" value={customModality} onChange={(event) => setCustomModality(event.target.value)} />}</div></div>}

        {error && <div className="mt-6 border-l-2 border-[var(--danger)] bg-[rgba(244,63,94,0.08)] p-3 text-sm leading-5 text-white" role="alert">{error}</div>}

        <div className="mt-8 flex items-center justify-between gap-3 sm:mt-10">
          <button onClick={() => step > 1 ? setStep((value) => value - 1) : router.replace("/")} disabled={saving} className="secondary-button disabled:opacity-60"><ArrowLeft size={18} /> Voltar</button>
          <button onClick={finish} disabled={saving || session.loading} className="primary-button disabled:opacity-60">{saving ? "Salvando..." : step < 3 ? "Continuar" : "Entrar no LevelFit"} <ArrowRight size={18} /></button>
        </div>
      </div>
    </main>
  );
}
