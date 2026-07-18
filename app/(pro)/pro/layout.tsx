import { ProShell } from "@/components/pro-shell";

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProShell>{children}</ProShell>;
}

