"use client";

import { useEffect, useMemo, useState } from "react";
import { Apple, BicepsFlexed, Check, HeartPulse, Plus, Search, Target, Trash2, Utensils } from "lucide-react";
import { ApiClientError } from "@/lib/auth-client";
import {
  addFoodLog,
  getNutritionGoal,
  getNutritionToday,
  searchFoods,
  updateNutritionGoal,
  type Food,
  type NutritionGoal,
  type NutritionToday,
} from "@/lib/level-fit-api";
import { PageHeader } from "./page-header";
import { ProgressRing } from "./progress-ring";

type PlateItem = {
  food: Food;
  quantityG: number;
};

type ChecklistId = "hasProtein" | "hasFruitOrVegetable" | "avoidedSkippingMeal" | "mindfulChoice";

const checklist: Array<{ id: ChecklistId; label: string; icon: typeof BicepsFlexed }> = [
  { id: "hasProtein", label: "Fonte de proteína", icon: BicepsFlexed },
  { id: "hasFruitOrVegetable", label: "Fruta, vegetal ou legume", icon: Apple },
  { id: "avoidedSkippingMeal", label: "Não pulei refeição importante", icon: Utensils },
  { id: "mindfulChoice", label: "Comi com atenção", icon: HeartPulse },
];

function Notice({ message, tone = "lime" }: { message: string | null; tone?: "lime" | "danger" }) {
  if (!message) return null;
  const color = tone === "danger" ? "var(--danger)" : "var(--lime)";
  return <div className="mb-4 border-l-2 bg-[rgba(183,255,42,0.06)] p-3 text-sm font-bold text-white" style={{ borderColor: color }}>{message}</div>;
}

function LoadingCard() {
  return <div className="app-card grid min-h-[240px] place-items-center p-6 text-sm font-bold text-[var(--text-muted)]">Carregando dados seguros...</div>;
}

function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) return error.message;
  return "Não foi possível concluir agora. Tente novamente.";
}

function numberValue(value: unknown) {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function scaled(value: unknown, grams: number) {
  return Math.round((numberValue(value) * grams)) / 100;
}

function formatMacro(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function optionalFormNumber(form: FormData, key: string) {
  const raw = String(form.get(key) ?? "").trim();
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function hasPositiveValue(value?: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function NutritionSmartPage() {
  const [data, setData] = useState<NutritionToday | null>(null);
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [plate, setPlate] = useState<PlateItem[]>([]);
  const [manualChecks, setManualChecks] = useState<Record<ChecklistId, boolean>>({ hasProtein: false, hasFruitOrVegetable: false, avoidedSkippingMeal: false, mindfulChoice: false });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [todayResult, goalResult] = await Promise.allSettled([getNutritionToday(), getNutritionGoal()]);
      if (todayResult.status === "rejected") throw todayResult.reason;
      setData(todayResult.value);
      setGoal(goalResult.status === "fulfilled" ? goalResult.value : null);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id); }, []);

  useEffect(() => {
    let active = true;
    const term = query.trim();
    const timer = window.setTimeout(async () => {
      if (term.length < 2) {
        setFoods([]);
        return;
      }
      setSearching(true);
      try {
        const result = await searchFoods(term, 12);
        if (active) setFoods(result);
      } catch {
        if (active) setFoods([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  const totals = useMemo(() => plate.reduce((sum, item) => ({
    calories: sum.calories + Math.round(scaled(item.food.kcalPer100g, item.quantityG)),
    proteinG: sum.proteinG + scaled(item.food.proteinGPer100g, item.quantityG),
    carbsG: sum.carbsG + scaled(item.food.carbsGPer100g, item.quantityG),
    fatG: sum.fatG + scaled(item.food.fatGPer100g, item.quantityG),
    fiberG: sum.fiberG + scaled(item.food.fiberGPer100g, item.quantityG),
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }), [plate]);

  const logs = data?.data ?? [];
  const doneChecks = new Set<ChecklistId>();
  logs.forEach((item) => {
    if (item.hasProtein) doneChecks.add("hasProtein");
    if (item.hasFruitOrVegetable) doneChecks.add("hasFruitOrVegetable");
    if (item.avoidedSkippingMeal) doneChecks.add("avoidedSkippingMeal");
    if (item.mindfulChoice) doneChecks.add("mindfulChoice");
  });
  const targetChecks = goal?.checklistGoalCount ?? 3;
  const checkPercent = Math.min(100, Math.round((doneChecks.size / Math.max(1, targetChecks)) * 100));

  function addToPlate(food: Food) {
    setError(null);
    setNotice(null);
    setPlate((current) => {
      const existing = current.find((item) => item.food.id === food.id);
      if (existing) return current.map((item) => item.food.id === food.id ? { ...item, quantityG: item.quantityG + 50 } : item);
      return [...current, { food, quantityG: 100 }];
    });
    setQuery("");
    setFoods([]);
  }

  async function saveQuickCheck(id: ChecklistId) {
    if (saving || doneChecks.has(id)) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result = await addFoodLog({ description: "Checklist alimentar", [id]: true });
      setNotice(result.xpAwarded ? `Registro salvo. +${result.xpAwarded} XP.` : "Registro salvo.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitFood(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const trimmedDescription = String(form.get("description") ?? "").trim() || description.trim();
    const manualNumbers = {
      calories: plate.length ? undefined : optionalFormNumber(form, "calories"),
      proteinG: plate.length ? undefined : optionalFormNumber(form, "proteinG"),
      carbsG: plate.length ? undefined : optionalFormNumber(form, "carbsG"),
      fatG: plate.length ? undefined : optionalFormNumber(form, "fatG"),
    };
    const hasManualCheck = Object.values(manualChecks).some(Boolean);
    const hasManualNumber = Object.values(manualNumbers).some(hasPositiveValue);
    const hasMeaningfulEntry = Boolean(trimmedDescription || plate.length || hasManualCheck || hasManualNumber);

    if (!hasMeaningfulEntry) {
      setNotice(null);
      setError("Adicione um alimento, escreva uma descrição ou marque pelo menos uma escolha do checklist.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result = await addFoodLog({
        description: trimmedDescription || (plate.length ? plate.map((item) => item.food.name).join(", ") : "Refeição registrada"),
        hasProtein: manualChecks.hasProtein || undefined,
        hasFruitOrVegetable: manualChecks.hasFruitOrVegetable || undefined,
        avoidedSkippingMeal: manualChecks.avoidedSkippingMeal || undefined,
        mindfulChoice: manualChecks.mindfulChoice || undefined,
        calories: manualNumbers.calories,
        proteinG: manualNumbers.proteinG,
        carbsG: manualNumbers.carbsG,
        fatG: manualNumbers.fatG,
        items: plate.length ? plate.map((item) => ({ foodId: item.food.id, quantityG: item.quantityG })) : undefined,
      });
      setNotice(result.xpAwarded ? `Refeição salva. +${result.xpAwarded} XP.` : "Refeição salva.");
      setDescription("");
      setPlate([]);
      setManualChecks({ hasProtein: false, hasFruitOrVegetable: false, avoidedSkippingMeal: false, mindfulChoice: false });
      setShowAdd(false);
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function submitGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await updateNutritionGoal({
        dailyCalories: optionalFormNumber(form, "dailyCalories"),
        proteinG: optionalFormNumber(form, "proteinG"),
        carbsG: optionalFormNumber(form, "carbsG"),
        fatG: optionalFormNumber(form, "fatG"),
        checklistGoalCount: optionalFormNumber(form, "checklistGoalCount"),
      });
      setGoal(saved);
      setShowGoal(false);
      setNotice("Metas alimentares salvas.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return <div className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-6 lg:px-8 lg:py-7">
    <PageHeader title="Alimentação" description="Registre refeições sem transformar comida em prêmio ou culpa." action={<div className="flex flex-wrap gap-2"><button onClick={() => { setError(null); setNotice(null); setShowGoal(true); }} disabled={saving} className="secondary-button disabled:opacity-60"><Target size={18} /> Editar metas</button><button onClick={() => { setError(null); setNotice(null); setShowAdd(true); }} disabled={saving} className="primary-button disabled:opacity-60"><Plus size={18} /> Registrar refeição</button></div>} />
    <Notice message={notice} />
    <Notice message={error} tone="danger" />

    {showGoal && <form onSubmit={submitGoal} className="app-card mb-4 p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[var(--green)]">Metas flexíveis</p><h2 className="mt-2 text-lg font-black text-white">Ajuste sem dieta extrema</h2><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Use só o que fizer sentido. Checklist é mais importante que número perfeito.</p></div><button type="button" onClick={() => setShowGoal(false)} className="ghost-button">Fechar</button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-bold text-[var(--text-muted)]">Calorias opcionais<input className="field mt-2" name="dailyCalories" type="number" min={800} max={10000} defaultValue={goal?.dailyCalories ?? ""} placeholder="Ex: 2200" /></label>
        <label className="text-xs font-bold text-[var(--text-muted)]">Proteína g<input className="field mt-2" name="proteinG" type="number" min={0} max={1000} step="0.1" defaultValue={goal?.proteinG ? Number(goal.proteinG) : ""} placeholder="Opcional" /></label>
        <label className="text-xs font-bold text-[var(--text-muted)]">Carboidratos g<input className="field mt-2" name="carbsG" type="number" min={0} max={2000} step="0.1" defaultValue={goal?.carbsG ? Number(goal.carbsG) : ""} placeholder="Opcional" /></label>
        <label className="text-xs font-bold text-[var(--text-muted)]">Gorduras g<input className="field mt-2" name="fatG" type="number" min={0} max={1000} step="0.1" defaultValue={goal?.fatG ? Number(goal.fatG) : ""} placeholder="Opcional" /></label>
        <label className="text-xs font-bold text-[var(--text-muted)]">Itens do checklist<input className="field mt-2" name="checklistGoalCount" type="number" min={1} max={4} defaultValue={targetChecks} /></label>
      </div>
      <button disabled={saving} className="primary-button mt-4 bg-[var(--green)] text-[#052313] disabled:opacity-60">{saving ? "Salvando..." : "Salvar metas"}</button>
    </form>}

    {showAdd && <form onSubmit={submitFood} className="app-card mb-4 p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="eyebrow text-[var(--green)]">Nova refeição</p><h2 className="mt-2 text-lg font-black text-white">Monte o prato ou registre do seu jeito</h2><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">A estimativa é opcional e serve para orientar, não para cobrar perfeição.</p></div><button type="button" onClick={() => { setError(null); setShowAdd(false); }} className="ghost-button">Fechar</button></div>
      <textarea className="field mt-4 min-h-20 py-3" name="description" value={description} onChange={(event) => { setDescription(event.target.value); setError(null); }} placeholder="Ex: almoço com arroz, feijão, frango e salada" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <label className="text-xs font-bold text-[var(--text-muted)]">Busca de alimentos</label>
          <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-3 text-[var(--text-dim)]" size={18} /><input className="field" style={{ paddingLeft: 42 }} value={query} onChange={(event) => { setQuery(event.target.value); setError(null); }} placeholder="Arroz, feijão, banana..." /></div>
          <div className="mt-3 max-h-64 overflow-auto rounded-[8px] border border-[var(--border)]">
            {query.trim().length < 2 ? <p className="p-4 text-sm text-[var(--text-muted)]">Digite pelo menos 2 letras para buscar.</p> : searching ? <p className="p-4 text-sm text-[var(--text-muted)]">Buscando alimentos...</p> : foods.length ? foods.map((food) => <button key={food.id} type="button" onClick={() => addToPlate(food)} className="flex min-h-[64px] w-full items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2 text-left last:border-b-0 hover:bg-[rgba(255,255,255,0.03)]"><span><strong className="block text-sm text-white">{food.name}</strong><span className="mt-1 block text-xs text-[var(--text-muted)]">{food.category}</span></span><span className="shrink-0 text-xs font-black text-[var(--green)]">{food.kcalPer100g ?? "-"} kcal</span></button>) : <p className="p-4 text-sm text-[var(--text-muted)]">Nenhum alimento encontrado.</p>}
          </div>
        </section>
        <section className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between gap-3"><div><p className="eyebrow text-[var(--green)]">Prato</p><h3 className="mt-1 font-black text-white">Itens adicionados</h3></div><span className="text-xs font-black text-[var(--text-dim)]">{plate.length} itens</span></div>
          <div className="mt-3 divide-y divide-[var(--border)]">
            {plate.length ? plate.map((item) => <div key={item.food.id} className="flex min-h-[72px] flex-wrap items-center gap-3 py-3"><div className="min-w-[180px] flex-1"><p className="truncate text-sm font-black text-white">{item.food.name}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{Math.round(scaled(item.food.kcalPer100g, item.quantityG))} kcal estimadas</p></div><input className="field h-10 w-24 shrink-0" type="number" min={1} max={5000} value={item.quantityG} aria-label={`Quantidade em gramas de ${item.food.name}`} onChange={(event) => setPlate((current) => current.map((row) => row.food.id === item.food.id ? { ...row, quantityG: Math.max(1, Number(event.target.value) || 1) } : row))} /><span className="text-xs font-bold text-[var(--text-muted)]">g</span><button type="button" className="ghost-button px-2" aria-label={`Remover ${item.food.name}`} onClick={() => setPlate((current) => current.filter((row) => row.food.id !== item.food.id))}><Trash2 size={16} /></button></div>) : <p className="py-8 text-sm text-[var(--text-muted)]">Adicione alimentos pela busca ou salve só com descrição/checklist.</p>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="subtle-card p-3"><p className="text-xs font-bold text-[var(--text-muted)]">Kcal</p><p className="mt-1 font-black text-white">{totals.calories}</p></div>
            <div className="subtle-card p-3"><p className="text-xs font-bold text-[var(--text-muted)]">Proteína</p><p className="mt-1 font-black text-white">{formatMacro(totals.proteinG)}g</p></div>
            <div className="subtle-card p-3"><p className="text-xs font-bold text-[var(--text-muted)]">Carbo</p><p className="mt-1 font-black text-white">{formatMacro(totals.carbsG)}g</p></div>
            <div className="subtle-card p-3"><p className="text-xs font-bold text-[var(--text-muted)]">Gordura</p><p className="mt-1 font-black text-white">{formatMacro(totals.fatG)}g</p></div>
          </div>
        </section>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{checklist.map((item) => <label key={item.id} className="flex min-h-12 items-center gap-3 rounded-[7px] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold text-white"><input type="checkbox" checked={manualChecks[item.id]} onChange={(event) => { setManualChecks((current) => ({ ...current, [item.id]: event.target.checked })); setError(null); }} className="size-4 accent-[var(--green)]" /> {item.label}</label>)}</div>
      {!plate.length && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input className="field" name="calories" type="number" min={0} max={10000} placeholder="Calorias opcional" /><input className="field" name="proteinG" type="number" min={0} max={1000} step="0.1" placeholder="Proteína g" /><input className="field" name="carbsG" type="number" min={0} max={2000} step="0.1" placeholder="Carboidratos g" /><input className="field" name="fatG" type="number" min={0} max={1000} step="0.1" placeholder="Gorduras g" /></div>}
      <button disabled={saving} className="primary-button mt-4 bg-[var(--green)] text-[#052313] disabled:opacity-60">{saving ? "Salvando..." : "Salvar refeição"}</button>
    </form>}

    {loading ? <LoadingCard /> : <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
      <section className="app-card p-5"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow text-[var(--green)]">Checklist de hoje</p><h2 className="mt-2 text-lg font-black text-white">Escolhas que sustentam energia</h2><p className="mt-1 max-w-md text-xs leading-5 text-[var(--text-muted)]">{doneChecks.size} de {targetChecks} itens para concluir sua meta flexível.</p></div><ProgressRing value={checkPercent} size={82} stroke={7} color="var(--green)" label="Checklist alimentar" /></div><div className="divide-y divide-[var(--border)]">{checklist.map((item) => { const Icon = item.icon; const done = doneChecks.has(item.id); return <button key={item.id} onClick={() => saveQuickCheck(item.id)} disabled={done || saving} className="flex min-h-[72px] w-full items-center gap-3 text-left disabled:cursor-default disabled:opacity-70"><span className="grid size-10 place-items-center rounded-[7px] bg-[rgba(56,217,121,0.1)] text-[var(--green)]"><Icon size={20} /></span><span className={`flex-1 text-sm font-bold ${done ? "text-[var(--text-muted)]" : "text-white"}`}>{item.label}</span><span className={`grid size-8 place-items-center rounded-[6px] border ${done ? "border-[var(--green)] bg-[var(--green)] text-[#052313]" : "border-[var(--border-strong)] text-transparent"}`}><Check size={17} strokeWidth={3} /></span></button>; })}</div></section>
      <section className="app-card p-5"><p className="eyebrow">Refeições registradas</p><div className="mt-4 divide-y divide-[var(--border)]">{logs.length ? logs.map((item) => <div key={item.id} className="py-4"><div className="flex min-h-[56px] items-center gap-3"><span className="grid size-10 place-items-center rounded-[7px] bg-[var(--surface-soft)] text-[var(--green)]"><Utensils size={20} /></span><div className="min-w-0 flex-1"><p className="text-sm font-black text-white">{item.meal?.name ?? "Registro alimentar"}</p><p className="mt-1 truncate text-xs text-[var(--text-muted)]">{item.description || "Checklist salvo"}</p>{item.calories ? <p className="mt-1 text-xs font-bold text-[var(--green)]">{item.calories} kcal{item.proteinG ? ` · ${item.proteinG}g proteína` : ""}</p> : null}</div><span className="text-xs font-bold text-[var(--text-dim)]">{new Date(item.loggedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>{item.items?.length ? <div className="mt-3 flex flex-wrap gap-2 pl-13">{item.items.slice(0, 4).map((entry) => <span key={entry.id} className="rounded-[6px] bg-[rgba(56,217,121,0.08)] px-2 py-1 text-xs font-bold text-[var(--text-muted)]">{entry.nameSnapshot} · {Number(entry.quantityG).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}g</span>)}</div> : null}</div>) : <p className="py-8 text-sm text-[var(--text-muted)]">Nenhuma refeição registrada hoje.</p>}</div><div className="mt-4 border-l-2 border-[var(--green)] bg-[rgba(56,217,121,0.06)] p-4"><p className="text-sm font-bold text-white">Sem contagem obrigatória</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">As estimativas são opcionais. O foco é regularidade e bem-estar.</p></div></section>
    </div>}
  </div>;
}
