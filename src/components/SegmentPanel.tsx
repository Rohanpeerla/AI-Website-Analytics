import { Donut } from "./charts";
import type { Segment } from "../lib/data";

export function SegmentPanel({
  users,
  devices,
  geo,
}: {
  users: Segment[];
  devices: Segment[];
  geo: Segment[];
}) {
  const totalUsers = users.reduce((a, b) => a + b.value, 0);
  return (
    <section className="paper lift flex flex-col rounded-xl border border-[var(--line-l)] p-5 fade-up" style={{ animationDelay: "180ms" }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--panel-ink)]/60">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--panel-ink)]" />
            segmentation
          </div>
          <h2 className="mt-1 font-display text-[22px] font-semibold tracking-tight">Who's here</h2>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--panel-ink)]/50">cohort</div>
      </div>

      {/* stacked bar */}
      <div className="mt-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--panel-ink)]/55">
          user lifecycle
        </div>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full">
          {users.map((u) => (
            <div
              key={u.name}
              title={`${u.name} · ${Math.round((u.value / totalUsers) * 100)}%`}
              style={{ width: `${(u.value / totalUsers) * 100}%`, background: u.color, transition: "width 0.6s cubic-bezier(0.2,0.7,0.2,1)" }}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {users.map((u) => (
            <div key={u.name} className="rounded-md border border-[var(--line-l)] bg-white/40 p-2">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--panel-ink)]/60">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.color }} />
                {u.name}
              </div>
              <div className="font-display text-xl font-semibold tnum">{Math.round((u.value / totalUsers) * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hairline my-5 !bg-black/10" />

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 flex items-center justify-center">
          <Donut
            data={devices}
            size={140}
            thickness={16}
            centerValue={`${devices[0].value}%`}
            centerLabel="DESKTOP"
          />
        </div>
        <div className="col-span-3 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--panel-ink)]/55">devices</div>
          {devices.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
              <span className="font-mono text-sm tnum font-medium">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hairline my-5 !bg-black/10" />

      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--panel-ink)]/55">top geos</div>
      <div className="mt-3 space-y-1.5">
        {geo.slice(0, 5).map((g) => (
          <div key={g.name} className="flex items-center gap-3 text-sm">
            <div className="w-24 truncate">{g.name}</div>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${g.value * 2.6}%`, background: g.color }} />
            </div>
            <div className="w-8 text-right font-mono tnum font-medium">{g.value}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}
