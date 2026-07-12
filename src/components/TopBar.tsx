import { useEffect, useState } from "react";
import { RANGES, type RangeKey } from "../lib/data";
import { SearchBar } from "./SearchBar";

export function TopBar({
  range,
  setRange,
  live,
  setLive,
  onExport,
  activeNow,
  domain,
  ready,
  onSearch,
}: {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  live: boolean;
  setLive: (v: boolean) => void;
  onExport: () => void;
  activeNow: number;
  domain: string;
  ready: boolean;
  onSearch: (d: string) => void;
}) {
  const [q, setQ] = useState(domain);
  useEffect(() => setQ(domain), [domain]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line-d)] bg-[var(--ink)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1480px] items-center gap-3 px-6 py-3">
        {/* Brand */}
        <button onClick={() => onSearch("")} className="flex items-center gap-3">
          <div className="relative grid h-9 w-9 place-items-center rounded-md bg-[var(--lime)] text-[var(--ink)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h4l2-7 4 14 2-7h6" />
            </svg>
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--cobalt)] ring-2 ring-[var(--ink)]" />
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="font-display text-[19px] font-semibold tracking-tight">
              Pulse<span className="text-[var(--lime)]">.</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">analytics lab</div>
          </div>
        </button>

        {/* Compact search when a site is loaded */}
        {ready && (
          <div className="ml-2 hidden w-full max-w-md md:block">
            <SearchBar
              value={q}
              setValue={setQ}
              onSubmit={() => onSearch(q)}
              size="sm"
              placeholder="search another site…"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setLive(!live)}
            disabled={!ready}
            className={`group flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition disabled:opacity-35 ${
              live ? "border-[var(--lime)]/40 bg-[var(--lime)]/10 text-[var(--lime)]" : "border-[var(--line-d)] text-[var(--ink-mute)] hover:text-white"
            }`}
          >
            <span className={`relative inline-flex h-2 w-2 ${live ? "pulse-ring" : ""}`}>
              <span className={`h-2 w-2 rounded-full ${live ? "bg-[var(--lime)]" : "bg-[var(--ink-mute)]"}`} />
            </span>
            {live ? "live" : "paused"}
          </button>

          <div className={`flex items-center gap-0.5 rounded-md border border-[var(--line-d)] bg-[var(--ink-2)] p-0.5 transition ${ready ? "" : "opacity-35"}`}>
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => ready && setRange(r.key)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
                  range === r.key ? "bg-[var(--paper)] text-[var(--panel-ink)]" : "text-[var(--ink-mute)] hover:text-white"
                }`}
              >
                {r.key}
              </button>
            ))}
          </div>

          <button
            onClick={onExport}
            disabled={!ready}
            className="flex items-center gap-1.5 rounded-md bg-[var(--paper)] px-3 py-1.5 text-sm font-medium text-[var(--panel-ink)] transition hover:bg-white lift disabled:opacity-35"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Ticker */}
      {ready && (
        <div className="relative overflow-hidden border-t border-[var(--line-d)] bg-[var(--ink-2)]">
          <div className="ticker flex w-max whitespace-nowrap py-1.5 font-mono text-[11px] text-[var(--ink-mute)]">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex items-center gap-6 px-6">
                <span className="text-[var(--lime)]">● {activeNow.toLocaleString()} active on {domain}</span>
                <span>p95 latency 142ms</span>
                <span>events / sec 318</span>
                <span>error rate 0.04%</span>
                <span>uptime 99.982%</span>
                <span className="text-[var(--amber)]">anomaly cleared · /checkout</span>
                <span>build #4821 · stable</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
