import type { Kpi } from "../lib/data";
import { Sparkline } from "./charts";

const COLORS: Record<string, string> = {
  users: "var(--lime)",
  sessions: "var(--cobalt)",
  conv: "var(--amber)",
  dur: "#ECEBE3",
};

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k, i) => {
        const up = k.delta >= 0;
        const color = COLORS[k.key] ?? "var(--lime)";
        return (
          <div
            key={k.key}
            className="lift group relative overflow-hidden rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] p-4 fade-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {/* corner tick */}
            <div className="absolute right-3 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">
              0{i + 1}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">{k.label}</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <div className="font-display text-[34px] leading-none font-semibold tnum tracking-tight">{k.value}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] ${
                      up ? "bg-[var(--lime)]/12 text-[var(--lime)]" : "bg-[var(--red)]/12 text-[var(--red)]"
                    }`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      {up ? <path d="M5 15l7-7 7 7" /> : <path d="M5 9l7 7 7-7" />}
                    </svg>
                    {Math.abs(k.delta).toFixed(1)}%
                  </span>
                  <span className="font-mono text-[10px] text-[var(--ink-mute)]">vs prev</span>
                </div>
              </div>
              <div className="opacity-80 transition group-hover:opacity-100">
                <Sparkline data={k.spark} color={color} width={96} height={44} />
              </div>
            </div>
            {/* hover sheen */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
        );
      })}
    </div>
  );
}
