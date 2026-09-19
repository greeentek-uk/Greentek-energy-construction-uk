"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { StatsContent } from "@/data/pageContent";
import { parseStat, type ParsedStat } from "@/lib/stats";


// Icons stay code-owned, zipped by index against the fetched items.
const STAT_ICONS: LucideIcon[] = [Wrench, ShieldCheck, CheckCircle2];

type Stat = StatsContent["items"][number] & { icon: LucideIcon };

function CountUp({
  stat,
  visible,
}: {
  stat: ParsedStat;
  visible: boolean;
}) {
  const { target, decimals, grouped, prefix, suffix } = stat;
  // Starts at 0 on the server and in the browser alike, so hydration matches.
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    // Reduced motion: zero duration, so the first frame lands on the real
    // figure — no animation, but still set from a frame callback, not
    // synchronously in the effect.
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2000;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      // Ease out, so it slows into the final figure rather than stopping dead.
      setCount(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, target]);

  const shown = grouped
    ? count.toLocaleString("en-GB", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : count.toFixed(decimals);

  return (
    <span>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const [fadeRef, fadeVisible] = useFadeIn(delay);
  const Icon = stat.icon;

  const parsed = parseStat(stat.value);

  return (
    <div
      ref={fadeRef}
      className={`bg-[#000000] rounded-2xl px-8 py-7 md:px-8 md:py-8 transition-all duration-700 ${
        fadeVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="shrink-0 grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-[#c5eb02]">
          <Icon className="h-8 w-8 sm:h-10  sm:w-10" strokeWidth={1.75} />
        </span>

        <div className="min-w-0">
          <div className="text-3xl sm:text-5xl font-bold text-white leading-none">
            {parsed ? <CountUp stat={parsed} visible={fadeVisible} /> : stat.value}
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
    <section className="py-10 md:py-20 lg:py-24">
      {/* The tray sits inside the shared container rather than being it, so
          it keeps the same side margins as every other section on a phone
          instead of running to the screen edge. */}
      <div className="site-container">
        <div className="px-3 py-3 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#101314]">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
