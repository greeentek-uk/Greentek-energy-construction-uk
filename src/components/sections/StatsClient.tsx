"use client";

import { CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { StatsContent } from "@/data/pageContent";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, visible };
}

// Icons stay code-owned, zipped by index against the fetched items.
const STAT_ICONS: LucideIcon[] = [Wrench, ShieldCheck, CheckCircle2];

type Stat = StatsContent["items"][number] & { icon: LucideIcon };

function CountUp({
  target,
  suffix = "",
  visible,
}: {
  target: number;
  suffix?: string;
  visible: boolean;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const fade = useFadeIn(delay);
  const Icon = stat.icon;

  const numericMatch = stat.value.match(/(\d+(\.\d+)?)/);
  const target = numericMatch ? parseFloat(numericMatch[0]) : null;
  const suffix = numericMatch ? stat.value.replace(numericMatch[0], "") : "";
  const isDecimal = numericMatch ? numericMatch[0].includes(".") : false;

  return (
    <div
      ref={fade.ref}
      className={`bg-[#000000] rounded-2xl px-8 py-7 md:px-8 md:py-8 transition-all duration-700 ${
        fade.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="shrink-0 grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-[#c5eb02]">
          <Icon className="h-8 w-8 sm:h-10  sm:w-10" strokeWidth={1.75} />
        </span>

        <div className="min-w-0">
          <div className="text-3xl sm:text-5xl font-bold text-white leading-none">
            {target !== null ? (
              isDecimal ? (
                <span>
                  {(fade.visible ? target : 0).toFixed(1)}
                  {suffix}
                </span>
              ) : (
                <CountUp
                  target={target}
                  suffix={suffix}
                  visible={fade.visible}
                />
              )
            ) : (
              stat.value
            )}
          </div>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold uppercase text-[#c5eb02]">
            {stat.label}
          </p>
        </div>
      </div>

      {stat.description && (
        <p className="mt-6 text-sm sm:text-base text-white/80 leading-relaxed">
          {stat.description}
        </p>
      )}
    </div>
  );
}

export default function StatsClient({ items }: StatsContent) {
  const stats: Stat[] = items.map((item, i) => ({
    ...item,
    icon: STAT_ICONS[i] ?? Wrench,
  }));

  return (
    <section className="py-12 md:py-14 lg:py-18">
      <div className="mx-auto max-w-7xl px-3 py-3 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#101314]">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}
