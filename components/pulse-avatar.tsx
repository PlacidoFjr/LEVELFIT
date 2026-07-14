import Image from "next/image";

type PulseStage = {
  id: string;
  name: string;
  image: string;
  accent: string;
  visualStyle: string;
};

const visualStyles: Record<string, { background: string; filter: string; scale: string; aura: string }> = {
  spark: {
    background: "radial-gradient(circle at 50% 70%, rgba(183,255,42,0.12), transparent 58%), #080d12",
    filter: "saturate(0.75) brightness(0.82)",
    scale: "scale(0.82)",
    aura: "rgba(183,255,42,0.18)",
  },
  core: {
    background: "radial-gradient(circle at 50% 66%, rgba(34,211,238,0.18), transparent 58%), #080d12",
    filter: "saturate(0.95) brightness(0.9) drop-shadow(0 0 18px rgba(34,211,238,0.24))",
    scale: "scale(0.9)",
    aura: "rgba(34,211,238,0.22)",
  },
  neo: {
    background: "radial-gradient(circle at 50% 60%, rgba(183,255,42,0.16), transparent 60%), #080d12",
    filter: "saturate(1.08) brightness(0.98) drop-shadow(0 0 18px rgba(183,255,42,0.22))",
    scale: "scale(1)",
    aura: "rgba(183,255,42,0.22)",
  },
  volt: {
    background: "radial-gradient(circle at 50% 58%, rgba(255,107,61,0.22), transparent 60%), linear-gradient(160deg, #080d12, #161014)",
    filter: "saturate(1.22) brightness(1.04) hue-rotate(-10deg) drop-shadow(0 0 20px rgba(255,107,61,0.28))",
    scale: "scale(1.04)",
    aura: "rgba(255,107,61,0.24)",
  },
  prime: {
    background: "radial-gradient(circle at 50% 56%, rgba(250,204,21,0.26), transparent 60%), linear-gradient(145deg, #080d12, #151208)",
    filter: "saturate(1.28) brightness(1.12) sepia(0.14) drop-shadow(0 0 24px rgba(250,204,21,0.32))",
    scale: "scale(1.08)",
    aura: "rgba(250,204,21,0.28)",
  },
};

export function PulseAvatar({ stage, alt, locked = false, className = "", imageClassName = "" }: { stage: PulseStage; alt: string; locked?: boolean; className?: string; imageClassName?: string }) {
  const style = visualStyles[stage.visualStyle] ?? visualStyles.neo;

  return (
    <div className={`relative overflow-hidden bg-[#080d12] ${className}`} style={{ background: style.background }}>
      <div className="absolute inset-x-[18%] bottom-[10%] h-[18%] rounded-full blur-xl" style={{ background: style.aura }} />
      <div className="absolute inset-4 rounded-full border opacity-35" style={{ borderColor: stage.accent }} />
      {(stage.visualStyle === "volt" || stage.visualStyle === "prime") && (
        <>
          <span className="absolute right-[18%] top-[20%] h-16 w-0.5 rotate-45 rounded-full opacity-70" style={{ background: stage.accent }} />
          <span className="absolute left-[20%] top-[28%] h-10 w-0.5 -rotate-45 rounded-full opacity-50" style={{ background: stage.accent }} />
        </>
      )}
      {stage.visualStyle === "prime" && <div className="absolute inset-6 rounded-full border border-[rgba(250,204,21,0.22)] shadow-[0_0_34px_rgba(250,204,21,0.16)]" />}
      <Image
        src={stage.image}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 320px"
        className={`object-contain object-bottom transition-transform ${locked ? "grayscale opacity-45" : "opacity-95"} ${imageClassName}`}
        style={{ filter: style.filter, transform: style.scale }}
      />
    </div>
  );
}
