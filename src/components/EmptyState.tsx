import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { TRENDING, CATEGORIES } from "../lib/siteProfile";

export function EmptyState({
  value,
  setValue,
  onSubmit,
}: {
  value: string;
  setValue: (v: string) => void;
  onSubmit: (domain: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left: search + pitch */}
      <div className="lg:col-span-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-d)] bg-[var(--ink-2)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] blink" />
          2.4M sites indexed · refreshed hourly
        </div>
        <h1 className="mt-5 font-display text-[56px] leading-[0.98] font-semibold tracking-tight sm:text-[84px]">
          Put any<br />
          website on<br />
          the <span className="italic text-[var(--lime)]">scope</span>.
        </h1>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--ink-text)]/65">
          Drop in a domain and Pulse crawls its traffic, audience, tech stack and competitors — then watches it live. No account, no setup. Just signal.
        </p>

        <div className="mt-7 max-w-xl">
          <SearchBar value={value} setValue={setValue} onSubmit={() => onSubmit(value)} size="lg" autoFocus />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">try</span>
            {TRENDING.map((t) => (
              <button
                key={t.domain}
                onClick={() => {
                  setValue(t.domain);
                  onSubmit(t.domain);
                }}
                className="rounded-full border border-[var(--line-d)] bg-[var(--ink-2)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-text)]/80 transition hover:border-[var(--lime)]/40 hover:text-[var(--lime)]"
              >
                {t.domain}
              </button>
            ))}
          </div>
        </div>

        {/* category tiles */}
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.values(CATEGORIES).map((c) => (
            <div key={c.key} className="rounded-lg border border-[var(--line-d)] bg-[var(--ink-2)] p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: c.accent }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">{c.label}</span>
              </div>
              <div className="mt-2 font-display text-lg font-semibold tnum">
                {c.base >= 1000 ? (c.base / 1000).toFixed(1) + "M" : c.base + "K"}
                <span className="ml-1 text-xs font-normal text-[var(--ink-mute)]">avg visits</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: live globe + floating cards */}
      <div className="relative lg:col-span-5">
        <Globe />
        <div className="pointer-events-none absolute left-2 top-6 rounded-lg border border-[var(--line-d)] bg-[var(--ink-2)]/90 px-3 py-2 backdrop-blur fade-up" style={{ animationDelay: "200ms" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">tracking now</div>
          <div className="font-display text-2xl font-semibold tnum text-[var(--lime)]">2,418,902</div>
        </div>
        <div className="pointer-events-none absolute bottom-4 right-0 rounded-lg border border-[var(--line-d)] bg-[var(--ink-2)]/90 px-3 py-2 backdrop-blur fade-up" style={{ animationDelay: "420ms" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">events / sec</div>
          <div className="font-display text-2xl font-semibold tnum">318</div>
        </div>
      </div>
    </div>
  );
}

function Globe() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);
  const dots = Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + tick * 0.01;
    const r = 120 + Math.sin(i * 1.3) * 30;
    const x = 160 + Math.cos(a) * r;
    const y = 160 + Math.sin(a) * r * 0.45;
    return { x, y, i };
  });
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[var(--line-d)] bg-gradient-to-b from-[var(--ink-2)] to-[var(--ink)]">
      <svg viewBox="0 0 320 320" className="h-full w-full">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#355bff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#355bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="160" cy="160" r="130" fill="url(#glow)" />
        {[40, 70, 100, 130].map((r) => (
          <circle key={r} cx="160" cy="160" r={r} fill="none" stroke="rgba(255,255,255,0.08)" />
        ))}
        {[0, 30, 60, 90, 120, 150].map((rot) => (
          <ellipse key={rot} cx="160" cy="160" rx="130" ry={130 * Math.abs(Math.cos((rot * Math.PI) / 180))} fill="none" stroke="rgba(255,255,255,0.06)" transform={`rotate(${rot} 160 160)`} />
        ))}
        {dots.map((d) => (
          <circle key={d.i} cx={d.x} cy={d.y} r={d.i % 5 === 0 ? 2.4 : 1.2} fill={d.i % 5 === 0 ? "#d6ff3a" : "rgba(236,235,227,0.55)"} />
        ))}
        <circle cx="160" cy="160" r="3" fill="#d6ff3a" />
      </svg>
      <div className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ink-mute)]">
        global edge · 38 regions
      </div>
    </div>
  );
}
