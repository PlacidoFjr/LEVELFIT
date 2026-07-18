"use client";

import { animate } from "animejs";
import { useEffect, useMemo, useRef, useState } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RevealGroup({
  children,
  className,
  delay = 0,
  staggerMs = 55,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!items.length) return;

    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(14px) scale(0.985)";
    });

    const animation = animate(items, {
      opacity: [0, 1],
      translateY: [14, 0],
      scale: [0.985, 1],
      delay: (_target, index) => delay + (index ?? 0) * staggerMs,
      duration: 520,
      ease: "outCubic",
    });

    return () => {
      animation.revert();
    };
  }, [delay, staggerMs]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  className,
  locale = "pt-BR",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  locale?: string;
}) {
  const [display, setDisplay] = useState(0);
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const frame = window.requestAnimationFrame(() => setDisplay(value));
      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const counter = { value: 0 };
    const animation = animate(counter, {
      value,
      duration: 720,
      ease: "outCubic",
      onRender: () => setDisplay(Math.round(counter.value)),
    });

    return () => {
      animation.revert();
    };
  }, [value]);

  return <span className={className}>{prefix}{formatter.format(display)}{suffix}</span>;
}

export function AnimatedProgressFill({
  value,
  className,
}: {
  value: number;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const target = `${Math.max(0, Math.min(100, value))}%`;
    if (prefersReducedMotion()) {
      element.style.width = target;
      return;
    }

    const animation = animate(element, {
      width: ["0%", target],
      duration: 680,
      ease: "outCubic",
    });

    return () => {
      animation.revert();
    };
  }, [value]);

  return <div ref={ref} className={className} style={{ width: 0 }} />;
}
