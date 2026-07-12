import { useEffect, useState } from "react";

const LOGS = [
  "resolving DNS…",
  "fetching robots.txt & sitemap…",
  "sampling traffic panel…",
  "profiling tech stack…",
  "building audience segments…",
  "warming real-time stream…",
];

export function LoadingState({ domain }: { domain: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(LOGS.length, s + 1)), 140);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(100, (step / LOGS.length) * 100);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] p-5">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">
          <span>crawling · <span className="text-[var(--lime)]">{domain}</span></span>
          <span className="tnum">{Math.round(pct)}%</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--cobalt)] to-[var(--lime)] transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 space-y-0.5 font-mono text-[12px]">
          {LOGS.map((l, i) => (
            <div key={i} className={i < step ? "text-[var(--ink-text)]/70" : i === step ? "text-[var(--lime)]" : "text-[var(--ink-mute)]/40"}>
              {i < step ? "✓" : i === step ? "›" : "·"} {l}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="h-80 animate-pulse rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] lg:col-span-8" />
        <div className="h-80 animate-pulse rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] lg:col-span-4" />
      </div>
    </div>
  );
}
