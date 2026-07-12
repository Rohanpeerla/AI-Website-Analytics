import { useState } from "react";
import { flagEmoji, fmtNum, type SiteProfile } from "../lib/siteProfile";

export function SiteHeader({ profile }: { profile: SiteProfile }) {
  const [imgErr, setImgErr] = useState(false);
  const [following, setFollowing] = useState(false);
  const accent = profile.category.accent;
  const src = profile.category.sources;
  const sources: { name: string; value: number; color: string }[] = [
    { name: "Organic", value: src.organic, color: "var(--lime)" },
    { name: "Direct", value: src.direct, color: "#ECEBE3" },
    { name: "Referral", value: src.referral, color: "var(--cobalt)" },
    { name: "Social", value: src.social, color: "var(--amber)" },
    { name: "Paid", value: src.paid, color: "var(--red)" },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-xl border border-[var(--line-d)] bg-[var(--ink-2)] p-5 fade-up"
      style={{ boxShadow: `inset 4px 0 0 ${accent}` }}
    >
      {/* top identity row */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--line-d)] bg-[var(--paper)]">
            {imgErr ? (
              <span className="font-display text-2xl font-bold text-[var(--panel-ink)]">{profile.displayName[0]}</span>
            ) : (
              <img src={profile.favicon} alt="" width={36} height={36} onError={() => setImgErr(true)} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[34px] leading-none font-semibold tracking-tight sm:text-[40px]">
                {profile.domain}
              </h1>
              <span className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ background: `${accent}22`, color: accent }}>
                {profile.category.label}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-mute)]">
              <span className="flex items-center gap-1.5">{flagEmoji(profile.countryCode)} {profile.country}</span>
              <span>rank <span className="text-[var(--ink-text)] tnum">#{profile.rank.toLocaleString()}</span></span>
              <span>est. <span className="text-[var(--ink-text)] tnum">{profile.founded}</span></span>
              <span className="flex items-center gap-1 text-[var(--lime)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] blink" /> live</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFollowing((v) => !v)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              following ? "border-[var(--lime)]/50 bg-[var(--lime)]/10 text-[var(--lime)]" : "border-[var(--line-d)] text-[var(--ink-text)] hover:border-white/30"
            }`}
          >
            {following ? "✓ Watching" : "+ Watch"}
          </button>
          <button className="rounded-md border border-[var(--line-d)] px-3 py-1.5 text-sm text-[var(--ink-text)]/80 transition hover:border-white/30">
            Compare
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[var(--line-d)] py-4 sm:grid-cols-4">
        <Headline label="monthly visits" value={fmtNum(profile.monthlyVisits)} accent={accent} />
        <Headline label="pages / visit" value={String(profile.pagesPerVisit)} />
        <Headline label="bounce rate" value={profile.bounceRate + "%"} />
        <Headline
          label="avg. duration"
          value={`${Math.floor(profile.avgDuration / 60)}m ${String(profile.avgDuration % 60).padStart(2, "0")}s`}
        />
      </div>

      {/* sources + stack + competitors */}
      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">traffic sources</div>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full">
            {sources.map((s) => (
              <div key={s.name} title={`${s.name} ${s.value}%`} style={{ width: `${s.value}%`, background: s.color, transition: "width 0.6s" }} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {sources.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--ink-text)]/80">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {s.name} <span className="tnum text-[var(--ink-mute)]">{s.value}%</span>
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">tech stack</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.stacks.map((s) => (
              <span key={s} className="rounded border border-[var(--line-d)] bg-[var(--ink-3)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-text)]/85">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">top keywords</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.keywords.slice(0, 4).map((k) => (
              <span key={k} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-[var(--ink-text)]/70">
                {k}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">competitors</div>
          <div className="mt-2 space-y-1.5">
            {profile.competitors.map((c) => (
              <div key={c} className="flex items-center justify-between rounded border border-[var(--line-d)] bg-[var(--ink-3)] px-2 py-1 text-sm">
                <span className="font-mono text-[12px] text-[var(--ink-text)]/85">{c}</span>
                <span className="font-mono text-[10px] text-[var(--ink-mute)]">view →</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />
    </section>
  );
}

function Headline({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">{label}</div>
      <div className="font-display text-[28px] font-semibold tnum tracking-tight" style={{ color: accent ?? "var(--ink-text)" }}>
        {value}
      </div>
    </div>
  );
}
