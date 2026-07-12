import type { Insight } from "../lib/data";

const STYLE: Record<Insight["kind"], { color: string; icon: string }> = {
  forecast: { color: "var(--cobalt)", icon: "M3 17l6-6 4 4 8-8" },
  anomaly: { color: "var(--red)", icon: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" },
  report: { color: "var(--lime)", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" },
};

export function AiInsights({ insights, onRegenerate, regenerating }: { insights: Insight[]; onRegenerate: () => void; regenerating: boolean }) {
  return (
    <section className="lift flex flex-col overflow-hidden rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] p-5 fade-up" style={{ animationDelay: "260ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--cobalt)]/15 text-[var(--cobalt)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" /><path d="M19 15l.8 2 2 .8-2 .8L19 21l-.8-2-2-.8 2-.8z" />
            </svg>
          </span>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">copilot · gpt-pulse</div>
            <h2 className="font-display text-[20px] font-semibold tracking-tight">AI insights</h2>
          </div>
        </div>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 rounded-md border border-[var(--line-d)] px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-text)]/80 transition hover:border-[var(--lime)]/40 hover:text-[var(--lime)] disabled:opacity-50"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: regenerating ? "spin 0.9s linear infinite" : undefined }}
          >
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
          </svg>
          regenerate
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {insights.map((ins, i) => {
          const s = STYLE[ins.kind];
          return (
            <article
              key={`${ins.kind}-${i}-${insights.length}`}
              className="group relative overflow-hidden rounded-lg border border-[var(--line-d)] bg-[var(--ink-3)] p-4 fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: s.color }} />
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: s.color }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
                {ins.tag}
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{ins.title}</h3>
              {ins.metric && (
                <div className="mt-1 font-mono text-sm tnum" style={{ color: s.color }}>
                  {ins.metric}
                </div>
              )}
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-text)]/70">{ins.body}</p>
              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40" style={{ background: s.color }} />
            </article>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
