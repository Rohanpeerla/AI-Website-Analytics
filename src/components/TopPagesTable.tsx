import { useMemo, useState } from "react";
import type { Page } from "../lib/data";
import { MiniBars } from "./charts";

type SortKey = "views" | "bounce";

export function TopPagesTable({ pages }: { pages: Page[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "views", dir: "desc" });
  const [q, setQ] = useState("");

  const maxViews = Math.max(...pages.map((p) => p.views));

  const rows = useMemo(() => {
    const filtered = pages.filter((p) => p.path.toLowerCase().includes(q.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      const mul = sort.dir === "asc" ? 1 : -1;
      return (a[sort.key] - b[sort.key]) * mul;
    });
    return sorted;
  }, [pages, q, sort]);

  const toggle = (k: SortKey) =>
    setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "desc" }));

  const bounceColor = (b: number) => (b > 55 ? "var(--red)" : b > 40 ? "var(--amber)" : "var(--lime)");

  return (
    <section className="lift flex flex-col overflow-hidden rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] fade-up" style={{ animationDelay: "150ms" }}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--lime)]" />
            top pages
          </div>
          <h2 className="mt-1 font-display text-[22px] font-semibold tracking-tight">Where traffic lands</h2>
        </div>
        <div className="relative">
          <svg className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="filter paths…"
            className="w-56 rounded-md border border-[var(--line-d)] bg-[var(--ink-3)] py-1.5 pl-8 pr-3 font-mono text-xs text-[var(--ink-text)] placeholder:text-[var(--ink-mute)] focus:border-[var(--lime)]/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-[var(--line-d)] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]">
              <th className="px-5 py-2.5 text-left">#</th>
              <th className="px-5 py-2.5 text-left">path</th>
              <th className="px-5 py-2.5 text-left">
                <button onClick={() => toggle("views")} className="flex items-center gap-1 hover:text-white">
                  views <Arrow active={sort.key === "views"} dir={sort.dir} />
                </button>
              </th>
              <th className="hidden px-5 py-2.5 text-left md:table-cell">distribution</th>
              <th className="px-5 py-2.5 text-left">avg time</th>
              <th className="px-5 py-2.5 text-left">
                <button onClick={() => toggle("bounce")} className="flex items-center gap-1 hover:text-white">
                  bounce <Arrow active={sort.key === "bounce"} dir={sort.dir} />
                </button>
              </th>
              <th className="hidden px-5 py-2.5 text-left lg:table-cell">7-pt trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.path} className="group border-b border-[var(--line-d)] transition hover:bg-white/[0.03]">
                <td className="px-5 py-3 font-mono text-xs text-[var(--ink-mute)] tnum">{String(i + 1).padStart(2, "0")}</td>
                <td className="px-5 py-3 font-mono text-[13px] text-[var(--ink-text)] group-hover:text-[var(--lime)]">{p.path}</td>
                <td className="px-5 py-3 font-mono tnum font-medium">{p.views.toLocaleString()}</td>
                <td className="hidden px-5 py-3 md:table-cell">
                  <div className="relative h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-white/5">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--cobalt)] transition-[width] duration-700" style={{ width: `${(p.views / maxViews) * 100}%` }} />
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-[13px] tnum text-[var(--ink-text)]/80">{p.avg}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] tnum" style={{ background: `${bounceColor(p.bounce)}1f`, color: bounceColor(p.bounce) }}>
                    {p.bounce}%
                  </span>
                </td>
                <td className="hidden px-5 py-3 lg:table-cell">
                  <MiniBars data={p.trend} color="var(--lime)" />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center font-mono text-sm text-[var(--ink-mute)]">
                  no paths match "{q}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Arrow({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={active ? "#d6ff3a" : "currentColor"} strokeWidth="2.5" style={{ transform: dir === "asc" ? "rotate(180deg)" : undefined }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
