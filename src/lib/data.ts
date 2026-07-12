// Synthetic but deterministic analytics data engine.
// Each range + seed produces a stable dataset so interactions feel real.

export type RangeKey = "24h" | "7d" | "30d" | "90d";

export const RANGES: { key: RangeKey; label: string; points: number; step: string }[] = [
  { key: "24h", label: "Last 24h", points: 24, step: "hour" },
  { key: "7d", label: "Last 7 days", points: 7, step: "day" },
  { key: "30d", label: "Last 30 days", points: 30, step: "day" },
  { key: "90d", label: "Last 90 days", points: 90, step: "day" },
];

// Mulberry32 PRNG
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(range: RangeKey, salt = 0) {
  const base = { "24h": 17, "7d": 53, "30d": 131, "90d": 271 }[range];
  return base + salt * 997;
}

export type Series = {
  labels: string[];
  users: number[];
  sessions: number[];
  events: number[];
};

export function buildSeries(range: RangeKey, salt = 0): Series {
  const def = RANGES.find((r) => r.key === range)!;
  const r = rng(seedFor(range, salt));
  const n = def.points;
  const labels: string[] = [];
  const users: number[] = [];
  const sessions: number[] = [];
  const events: number[] = [];

  const base = { "24h": 180, "7d": 4200, "30d": 5200, "90d": 6100 }[range];
  const vol = { "24h": 0.35, "7d": 0.22, "30d": 0.18, "90d": 0.15 }[range];

  let trend = base;
  for (let i = 0; i < n; i++) {
    // weekly seasonality + gentle upward trend + noise
    const week = Math.sin((i / 7) * Math.PI * 2) * 0.12;
    const day = Math.sin((i / 1) * 0.6) * 0.05;
    trend = trend * (1 + (r() - 0.48) * vol);
    const u = Math.max(20, Math.round(trend * (1 + week + day)));
    const s = Math.round(u * (1.25 + r() * 0.35));
    const e = Math.round(s * (3.2 + r() * 1.8));
    users.push(u);
    sessions.push(s);
    events.push(e);

    if (def.step === "hour") {
      labels.push(`${String(i).padStart(2, "0")}:00`);
    } else if (range === "7d") {
      labels.push(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7]);
    } else {
      const d = new Date();
      d.setDate(d.getDate() - (n - 1 - i));
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
  }

  // Inject an anomaly spike for 30d/90d to make anomaly detection meaningful
  if (range === "30d" || range === "90d") {
    const idx = Math.floor(n * 0.62);
    events[idx] = Math.round(events[idx] * 2.3);
    sessions[idx] = Math.round(sessions[idx] * 1.7);
    users[idx] = Math.round(users[idx] * 1.55);
  }

  return { labels, users, sessions, events };
}

export type Kpi = {
  key: string;
  label: string;
  value: string;
  raw: number;
  delta: number;
  spark: number[];
  unit?: string;
};

export function buildKpis(range: RangeKey): Kpi[] {
  const s = buildSeries(range);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const totalUsers = sum(s.users);
  const totalSessions = sum(s.sessions);
  const totalEvents = sum(s.events);
  const conv = (totalEvents / Math.max(1, totalSessions)) * 0.012; // synthetic %
  const avgDur = 182 + ((totalEvents % 60) - 30); // seconds

  const spark = (arr: number[]) => {
    const r = rng(seedFor(range) + arr.length);
    return arr.slice(-12).map((v) => v * (0.9 + r() * 0.2));
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  const dur = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s2 = sec % 60;
    return `${m}m ${String(s2).padStart(2, "0")}s`;
  };

  return [
    { key: "users", label: "Active users", value: fmt(totalUsers), raw: totalUsers, delta: 12.4, spark: spark(s.users) },
    { key: "sessions", label: "Sessions", value: fmt(totalSessions), raw: totalSessions, delta: 8.1, spark: spark(s.sessions) },
    { key: "conv", label: "Conversion rate", value: conv.toFixed(2) + "%", raw: conv, delta: -2.3, spark: spark(s.events.map((v) => v * 0.01)), unit: "%" },
    { key: "dur", label: "Avg. session", value: dur(avgDur), raw: avgDur, delta: 4.7, spark: spark(s.users.map((v) => 180 + (v % 40))) },
  ];
}

export type Page = {
  path: string;
  views: number;
  avg: string; // avg time
  bounce: number;
  trend: number[];
};

export function buildPages(range: RangeKey, paths?: string[], salt = 0): Page[] {
  const r = rng(seedFor(range) + 7 + salt);
  const list = paths ?? [
    "/home",
    "/pricing",
    "/docs/quickstart",
    "/blog/analytics-in-2026",
    "/dashboard",
    "/login",
    "/changelog",
    "/api/events",
  ];
  return list
    .map((p) => {
      const views = Math.round(800 + r() * 9000);
      const bounce = Math.round(28 + r() * 42);
      const avgSec = Math.round(45 + r() * 240);
      const trend = Array.from({ length: 10 }, () => Math.round(20 + r() * 80));
      return {
        path: p,
        views,
        bounce,
        avg: `${Math.floor(avgSec / 60)}m ${String(avgSec % 60).padStart(2, "0")}s`,
        trend,
      };
    })
    .sort((a, b) => b.views - a.views);
}

export type Segment = { name: string; value: number; color: string };

export function buildSegments(range: RangeKey): { users: Segment[]; devices: Segment[]; geo: Segment[] } {
  const r = rng(seedFor(range) + 21);
  const users = [
    { name: "New", value: Math.round(42 + r() * 8), color: "var(--cobalt)" },
    { name: "Returning", value: Math.round(34 + r() * 6), color: "var(--lime)" },
    { name: "Power", value: Math.round(12 + r() * 5), color: "var(--amber)" },
  ];
  const devices = [
    { name: "Desktop", value: Math.round(48 + r() * 6), color: "#ECEBE3" },
    { name: "Mobile", value: Math.round(36 + r() * 8), color: "var(--cobalt)" },
    { name: "Tablet", value: Math.round(8 + r() * 4), color: "var(--amber)" },
  ];
  const geo = [
    { name: "United States", value: 32, color: "var(--cobalt)" },
    { name: "India", value: 18, color: "var(--lime)" },
    { name: "Germany", value: 11, color: "var(--amber)" },
    { name: "Brazil", value: 9, color: "#ECEBE3" },
    { name: "Japan", value: 7, color: "var(--red)" },
    { name: "Other", value: 23, color: "#6b6f66" },
  ];
  return { users, devices, geo };
}

const ACTIONS = [
  "clicked",
  "viewed",
  "submitted",
  "scrolled",
  "downloaded",
  "signed_up",
  "upgraded",
  "searched",
];
const PAGES = ["/home", "/pricing", "/checkout", "/docs", "/dashboard", "/blog", "/login", "/api/events"];
const COUNTRIES = ["US", "IN", "DE", "BR", "JP", "UK", "FR", "CA", "AU", "NL"];

export type LiveEvent = {
  id: string;
  time: string;
  user: string;
  action: string;
  page: string;
  country: string;
};

export function makeEvent(r: () => number, pages: string[] = PAGES, countryBias?: string): LiveEvent {
  const d = new Date();
  const cc = countryBias && r() < 0.4 ? countryBias : COUNTRIES[Math.floor(r() * COUNTRIES.length)];
  return {
    id: Math.random().toString(36).slice(2, 9),
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`,
    user: "u_" + Math.floor(100 + r() * 899),
    action: ACTIONS[Math.floor(r() * ACTIONS.length)],
    page: pages[Math.floor(r() * pages.length)],
    country: cc,
  };
}

export type Insight = {
  kind: "forecast" | "anomaly" | "report";
  tag: string;
  title: string;
  body: string;
  metric?: string;
};

export function buildInsights(range: RangeKey, salt = 0, domain = ""): Insight[] {
  const s = buildSeries(range, salt);
  const r = rng(seedFor(range) + 500 + salt * 13);
  const last = s.events[s.events.length - 1];
  const forecast = Math.round(last * (1.08 + r() * 0.18));
  const anomalyIdx = s.events.indexOf(Math.max(...s.events));
  const anomalyDate = s.labels[anomalyIdx];

  const site = domain ? domain : "the site";
  const reports = [
    `Traffic to ${site} held steady week-over-week with a +8.1% lift in sessions. Mobile share expanded to 41%, driven by the new onboarding flow.`,
    `Conversion dipped 2.3% on ${site}/pricing; heatmaps suggest friction on the annual toggle. Recommend an A/B test on CTA copy.`,
    `Returning-user cohort on ${site} grew 6 points — retention campaigns are paying off. Power-user segment now drives 38% of events.`,
  ];
  const forecasts = [
    `Events are projected to reach ${forecast.toLocaleString()} next period (+${(8 + r() * 10).toFixed(1)}%) if current momentum holds.`,
    `Active-user forecast: ${(s.users.slice(-1)[0] * (1.05 + r() * 0.12)).toFixed(0)} (+${(5 + r() * 8).toFixed(1)}%) within 7 days.`,
    `Model confidence 0.87 — sessions trending upward; recommend scaling ad spend by ~12%.`,
  ];
  const anomalies = [
    `Anomaly detected on ${anomalyDate}: events spiked ${Math.round(80 + r() * 80)}% above baseline. Likely cause: campaign launch.`,
    `Unusual drop in /checkout conversions (−14%) flagged at ${s.labels[Math.floor(s.labels.length * 0.4)]}. Investigate payment provider latency.`,
    `Bounce rate on /pricing exceeded 2σ threshold. Correlates with a deploy at 14:20 UTC.`,
  ];

  const pick = (arr: string[], i: number) => arr[(i + salt) % arr.length];

  return [
    {
      kind: "forecast",
      tag: "PREDICTIVE",
      title: "Next-period forecast",
      body: pick(forecasts, 0),
      metric: forecast.toLocaleString(),
    },
    {
      kind: "anomaly",
      tag: "ANOMALY",
      title: "Spike flagged",
      body: pick(anomalies, 1),
      metric: anomalyDate,
    },
    {
      kind: "report",
      tag: "AUTO-REPORT",
      title: "Weekly digest",
      body: pick(reports, 2),
    },
  ];
}
