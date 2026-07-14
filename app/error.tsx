"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5"><div className="app-card max-w-md p-7 text-center"><span className="mx-auto grid size-14 place-items-center rounded-[8px] bg-[rgba(244,63,94,0.1)] text-[var(--danger)]"><AlertTriangle size={28} /></span><h1 className="mt-5 text-xl font-black text-white">Não conseguimos carregar esta tela</h1><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Seu progresso continua salvo. Tente novamente em alguns instantes.</p><button onClick={reset} className="primary-button mt-6"><RefreshCw size={18} /> Tentar novamente</button></div></main>;
}
