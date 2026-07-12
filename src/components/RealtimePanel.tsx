import { useEffect, useRef, useState } from "react";

export function RealtimePanel({ live, onActive }: { live: boolean; onActive: (n: number) => void }) {
  const [active, setActive] = useState(1284);
  const [history, setHistory] = useState<number[]>(() => Array.from({ length: 40 }, (_, i) => 900 + Math.round(Math.sin(i / 3) * 120 + Math.random() * 140)));
  const [topPages, setTopPages] = useState([
    { path: "/home", v: 312 },
    { path: "/pricing", v: 188 },
    { path: "/dashboard", v: 142 },
    { path: "/docs/quickstart", v: 96 },
    { path: "/checkout", v: 54 },
  ]);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setActive((prev) => {
        const delta = Math.round((Math.random() - 0.45) * 42);
        const next = Math.max(420, prev + delta);
        setHistory((h) => [...h.slice(1), next]);
        onActiveRef.current(next);
        return next;
      });
      setTopPages((ps) =>
        [...ps.map((p) => ({ ...p, v: Math.max(10, p.v + Math.round((Math.random() - 0.5) * 18)) }))].sort(
          (a, b) => b.v - a.v
        )
      );
    }, 1400);
    return () => clearInterval(id);
  }, [live]);

  const max = Math.max(...history);
  const maxPage = Math.max(...topPages.map((p) => p.v));

  return (
    <section className="lift relative flex flex-col overflow-hidden rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] p-5 fade-up" style={{ animationDelay: "120ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">
          <span className={`relative inline-flex h-2 w-2 ${live ? "pulse-ring" : ""}`}>
            <span className={`h-2 w-2 rounded-full ${live ? "bg-[var(--lime)]" : "bg-[var(--ink-mute)]"}`} />
          </span>
          real-time
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">
          {live ? "streaming" : "paused"}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <div className="font-display text-[64px] leading-none font-semibold tnum tracking-tight text-[var(--lime)]">
          {active.toLocaleString()}
        </div>
        <div className="pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          active<br />users now
        </div>
      </div>

      {/* streaming bars */}
      <div className="mt-4 flex h-16 items-end gap-[2px]">
        {history.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-[height,background] duration-500"
            style={{
              height: `${(v / max) * 100}%`,
              background: i === history.length - 1 ? "var(--lime)" : "rgba(214,255,58,0.28)",
            }}
          />
        ))}
      </div>

      <div className="hairline my-4" />

      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">top pages right now</div>
      <div className="mt-3 space-y-2.5">
        {topPages.map((p) => (
          <div key={p.path} className="flex items-center gap-3">
            <div className="w-32 truncate font-mono text-[12px] text-[var(--ink-text)]/80">{p.path}</div>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--cobalt)] to-[var(--lime)] transition-[width] duration-700"
                style={{ width: `${(p.v / maxPage) * 100}%` }}
              />
            </div>
            <div className="w-10 text-right font-mono text-[12px] tnum text-[var(--ink-text)]/70">{p.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
