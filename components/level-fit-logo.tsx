"use client";

type LevelFitLogoProps = {
  className?: string;
  compact?: boolean;
};

export function LevelFitLogo({ className = "", compact = false }: LevelFitLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 text-white ${className}`} aria-hidden="true">
      <svg viewBox="0 0 44 44" className="size-9 shrink-0" role="img" focusable="false">
        <defs>
          <linearGradient id="levelfit-mark-fill" x1="10" y1="34" x2="34" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8eea00" />
            <stop offset="1" stopColor="#b7ff2a" />
          </linearGradient>
        </defs>
        <rect width="44" height="44" rx="10" fill="#111820" />
        <path
          d="M12 13.5c0-1.2 1-2.2 2.2-2.2h4.2v19.5h16.4c1 0 1.5 1.2.8 1.9l-3.9 4H16.2c-2.3 0-4.2-1.9-4.2-4.2v-19Z"
          fill="#f8fbff"
        />
        <path
          d="M17.1 28.8 23.5 22h8.4l-8 8.7h-8.5c-1 0-1.5-1.2-.8-1.9h2.5Z"
          fill="url(#levelfit-mark-fill)"
        />
        <path d="M24.1 30.7 35 18.8h-8.2L16 30.7h8.1Z" fill="url(#levelfit-mark-fill)" />
      </svg>
      {!compact && <span className="font-black tracking-normal">LevelFit</span>}
    </span>
  );
}
