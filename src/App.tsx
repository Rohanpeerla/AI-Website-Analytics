import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "./components/TopBar";
import { KpiRow } from "./components/KpiRow";
import { TrafficChart } from "./components/TrafficChart";
import { RealtimePanel } from "./components/RealtimePanel";
import { SegmentPanel } from "./components/SegmentPanel";
import { TopPagesTable } from "./components/TopPagesTable";
import { EventStream } from "./components/EventStream";
import { AiInsights } from "./components/AiInsights";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { SiteHeader } from "./components/SiteHeader";
import {
  buildInsights,
  buildKpis,
  buildPages,
  buildSegments,
  buildSeries,
  type RangeKey,
} from "./lib/data";
import { buildProfile, normalizeDomain, type SiteProfile } from "./lib/siteProfile";

type Status = "idle" | "loading" | "ready";

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [range, setRange] = useState<RangeKey>("30d");
  const [live, setLive] = useState(true);
  const [insightSalt, setInsightSalt] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [activeNow, setActiveNow] = useState(1284);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const series = useMemo(() => (profile ? buildSeries(range, profile.seed) : null), [profile, range]);
  const kpis = useMemo(() => (profile ? buildKpis(range) : null), [profile, range]);
  const pages = useMemo(() => (profile ? buildPages(range, profile.pages, profile.seed) : null), [profile, range]);
  const segments = useMemo(() => (profile ? buildSegments(range) : null), [profile, range]);
  const insights = useMemo(
    () => (profile ? buildInsights(range, insightSalt + profile.seed, profile.domain) : null),
    [profile, range, insightSalt]
  );

  const showToast = (msg: string) => {
    setToast(msg);
    const id = window.setTimeout(() => setToast(null), 2600);
    timers.current.push(id);
  };

  const submit = (raw: string) => {
    const d = normalizeDomain(raw);
    if (!d || !d.includes(".")) {
      showToast("Enter a valid domain like stripe.com");
      return;
    }
    clearTimers();
    setDomain(d);
    setQuery(d);
    setProfile(buildProfile(d));
    setStatus("loading");
    const id = window.setTimeout(() => setStatus("ready"), 950);
    timers.current.push(id);
  };

  const goHome = () => {
    clearTimers();
    setStatus("idle");
    setDomain("");
    setQuery("");
    setProfile(null);
  };

  const regenerate = () => {
    setRegenerating(true);
    const id = window.setTimeout(() => {
      setInsightSalt((s) => s + 1);
      setRegenerating(false);
      showToast("Insights regenerated · 3 new findings");
    }, 700);
    timers.current.push(id);
  };

  const onExport = () => showToast(`Exporting ${domain} · ${range} report as PDF…`);

  const onSearchFromBar = (d: string) => (d && d.trim() ? submit(d) : goHome());

  return (
    <div className="ink-grid min-h-screen">
      <TopBar
        range={range}
        setRange={setRange}
        live={live}
        setLive={setLive}
        onExport={onExport}
        activeNow={activeNow}
        domain={domain}
        ready={status === "ready"}
        onSearch={onSearchFromBar}
      />

      <main className="mx-auto max-w-[1480px] px-6 py-8">
        {status === "idle" && <EmptyState value={query} setValue={setQuery} onSubmit={submit} />}

        {status === "loading" && <LoadingState domain={domain} />}

        {status === "ready" && profile && series && kpis && pages && segments && insights && (
          <div className="space-y-4">
            <SiteHeader profile={profile} />

            <KpiRow kpis={kpis} />

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <TrafficChart
                  range={range}
                  labels={series.labels}
                  data={{ users: series.users, sessions: series.sessions, events: series.events }}
                />
              </div>
              <div className="lg:col-span-4">
                <RealtimePanel live={live} onActive={setActiveNow} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SegmentPanel users={segments.users} devices={segments.devices} geo={segments.geo} />
              </div>
              <div className="lg:col-span-8">
                <TopPagesTable pages={pages} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <EventStream live={live} pages={profile.pages} country={profile.countryCode} />
              </div>
              <div className="lg:col-span-7">
                <AiInsights insights={insights} onRegenerate={regenerate} regenerating={regenerating} />
              </div>
            </div>

            <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-d)] pt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">
              <div>pulse analytics lab · report for {profile.domain}</div>
              <div className="flex items-center gap-4">
                <span>events sampled · {series.events.reduce((a, b) => a + b, 0).toLocaleString()}</span>
                <span>status · <span className="text-[var(--lime)]">operational</span></span>
              </div>
            </footer>
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 toast-in">
          <div className="flex items-center gap-3 rounded-lg border border-[var(--line-d)] bg-[var(--ink-2)] px-4 py-3 shadow-2xl shadow-black/40">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--lime)] text-[var(--ink)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </span>
            <span className="text-sm text-[var(--ink-text)]">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
