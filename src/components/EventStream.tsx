import { useEffect, useRef, useState } from "react";
import { makeEvent, type LiveEvent } from "../lib/data";

const ACTION_COLORS: Record<string, string> = {
  clicked: "var(--cobalt)",
  viewed: "var(--lime)",
  submitted: "var(--amber)",
  scrolled: "#ECEBE3",
  downloaded: "var(--cobalt)",
  signed_up: "var(--lime)",
  upgraded: "var(--amber)",
  searched: "#ECEBE3",
};

export function EventStream({ live, pages, country }: { live: boolean; pages?: string[]; country?: string }) {
  const [events, setEvents] = useState<LiveEvent[]>(() => {
    const r = () => Math.random();
    return Array.from({ length: 8 }, () => makeEvent(r, pages, country));
  });
  const [perMin, setPerMin] = useState(318);
  const countRef = useRef(0);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const e = makeEvent(Math.random, pages, country);
      setEvents((prev) => [e, ...prev].slice(0, 30));
      countRef.current += 1;
    }, 1100);
    const pm = setInterval(() => setPerMin(280 + Math.floor(Math.random() * 90)), 3000);
    return () => {
      clearInterval(id);
      clearInterval(pm);
    };
  }, [live]);

  return (
    <section className="lift flex flex-col overflow-hidden rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] fade-up" style={{ animationDelay: "220ms" }}>
      <div className="flex items-center justify-between border-b border-[var(--line-d)] p-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${live ? "bg-[var(--lime)] blink" : "bg-[var(--ink-mute)]"}`} />
            event stream
          </div>
          <h2 className="mt-1 font-display text-[20px] font-semibold tracking-tight">Live activity</h2>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-semibold tnum text-[var(--lime)]">{perMin}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">events/min</div>
        </div>
      </div>

      <div className="relative max-h-[380px] overflow-y-auto">
        <div className="divide-y divide-[var(--line-d)]">
          {events.map((e) => {
            const color = ACTION_COLORS[e.action] ?? "#ECEBE3";
            return (
              <div key={e.id} className="flex items-center gap-3 px-5 py-2.5 slide-in">
                <span className="w-14 shrink-0 font-mono text-[11px] tnum text-[var(--ink-mute)]">{e.time}</span>
                <span
                  className="w-20 shrink-0 truncate rounded px-1.5 py-0.5 text-center font-mono text-[10px] uppercase tracking-[0.1em]"
                  style={{ background: `${color}1f`, color }}
                >
                  {e.action}
                </span>
                <span className="w-14 shrink-0 font-mono text-[12px] tnum text-[var(--ink-text)]/80">{e.user}</span>
                <span className="flex-1 truncate font-mono text-[12px] text-[var(--ink-text)]/90">{e.page}</span>
                <span className="shrink-0 rounded border border-[var(--line-d)] px-1.5 py-0.5 font-mono text-[10px] tnum text-[var(--ink-mute)]">
                  {e.country}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
