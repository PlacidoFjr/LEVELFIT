import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-5"><div className="app-card max-w-md p-7 text-center"><span className="mx-auto grid size-14 place-items-center rounded-[8px] bg-[var(--surface-soft)] text-[var(--text-muted)]"><MapPinOff size={28} /></span><h1 className="mt-5 text-xl font-black text-white">Tela nao encontrada</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Este caminho nao existe ou foi movido.</p><Link href="/" className="primary-button mt-6"><ArrowLeft size={18} /> Voltar para hoje</Link></div></main>;
}
