import { useMemo, useState } from "react";
import type { RangeKey } from "../lib/data";
import { AreaChart } from "./charts";

type Metric = "users" | "sessions" | "events";

const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: "users", label: "Users", color: "#355bff" },
  { key: "sessions", label: "Sessions", color: "#d6ff3a" },
  { key: "events", label: "Events", color: "#ffb23d" },
];

export function TrafficChart({
  range,
  labels,
  data,
}: {
  range: RangeKey;
  labels: string[];
  data: { users: number[]; sessions: number[]; events: number[] };
}) {
  const [metric, setMetric] = useState<Metric>("users");
  const [idx, setIdx] = useState<number | null>(null);

  const series = useMemo(
    () =>
      METRICS.map((m) => ({ key: m.key, values: data[m.key], color: m.color, active: m.key === metric })),
    [data, metric]
  );

  const current = data[metric];
  const total = current.reduce((a, b) => a + b, 0);
  const peak = Math.max(...current);
  const avg = Math.round(total / current.length);

  const fmt = (n: number) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  return (
    <section className="paper lift relative flex flex-col rounded-xl border border-[var(--line-l)] p-5 fade-up">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--panel-ink)]/60">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--panel-ink)]" />
            traffic · {range}
          </div>
          <h2 className="mt-1 font-display text-[28px] leading-none font-semibold tracking-tight">
            Audience over time
          </h2>
        </div>

        {/* metric toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-[var(--line-l)] bg-white/50 p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                metric === m.key ? "bg-[var(--panel-ink)] text-[var(--paper)]" : "text-[var(--panel-ink)]/70 hover:text-[var(--panel-ink)]"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* readout */}
      <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--panel-ink)]/55">
            {idx != null ? labels[idx] : "current"}
          </div>
          <div className="font-display text-[44px] leading-none font-semibold tnum tracking-tight">
            {fmt(idx != null ? current[idx] : current[current.length - 1])}
          </div>
        </div>
        <Stat label="total" value={fmt(total)} />
        <Stat label="peak" value={fmt(peak)} />
        <Stat label="avg / pt" value={fmt(avg)} />
      </div>

      <div className="mt-3">
        <AreaChart labels={labels} series={series} activeIdx={idx} onHover={(i) => setIdx(i)} />
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--panel-ink)]/50">
        <span>hover to inspect</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: METRICS.find((m) => m.key === metric)!.color }} />
          {metric} · live feed
        </span>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--panel-ink)]/55">{label}</div>
      <div className="font-display text-xl font-semibold tnum">{value}</div>
    </div>
  );
}
