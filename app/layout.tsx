import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LevelFit",
  description: "Sua evolucao, um passo de cada vez.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/assets/pulse-evolved.png", apple: "/assets/pulse-evolved.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
