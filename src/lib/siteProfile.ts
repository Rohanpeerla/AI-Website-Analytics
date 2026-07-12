// Turns any user-entered domain into a stable, context-aware "site profile"
// so the dashboard feels like a real lookup, not a random demo.

export type CategoryKey =
  | "ecommerce"
  | "saas"
  | "media"
  | "docs"
  | "social"
  | "default";

export interface Category {
  key: CategoryKey;
  label: string;
  accent: string;
  stacks: string[];
  sources: { organic: number; direct: number; referral: number; social: number; paid: number };
  pages: string[];
  keywords: string[];
  base: number; // base monthly visits (thousands)
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  ecommerce: {
    key: "ecommerce",
    label: "E-commerce",
    accent: "#d6ff3a",
    stacks: ["Shopify", "Next.js", "Stripe", "Klaviyo", "Cloudflare"],
    sources: { organic: 38, direct: 22, referral: 8, social: 18, paid: 14 },
    pages: ["/", "/collections/all", "/products/featured", "/cart", "/checkout", "/account", "/sale", "/blog"],
    keywords: ["buy online", "free shipping", "deals", "shop", "new arrivals"],
    base: 5200,
  },
  saas: {
    key: "saas",
    label: "SaaS · Web App",
    accent: "#355bff",
    stacks: ["React", "Node.js", "PostgreSQL", "AWS", "Stripe"],
    sources: { organic: 46, direct: 28, referral: 10, social: 8, paid: 8 },
    pages: ["/", "/pricing", "/features", "/dashboard", "/login", "/docs/quickstart", "/blog", "/changelog"],
    keywords: ["software", "platform", "automation", "tool", "workflow"],
    base: 4200,
  },
  media: {
    key: "media",
    label: "Media & News",
    accent: "#ffb23d",
    stacks: ["WordPress", "Next.js", "Chartbeat", "Cloudflare", "GA4"],
    sources: { organic: 52, direct: 18, referral: 12, social: 14, paid: 4 },
    pages: ["/", "/world", "/business", "/technology", "/opinion", "/trending", "/search", "/newsletters"],
    keywords: ["breaking news", "analysis", "headline", "world", "politics"],
    base: 9800,
  },
  docs: {
    key: "docs",
    label: "Documentation",
    accent: "#8ae0ff",
    stacks: ["Docusaurus", "MDX", "Vercel", "Algolia"],
    sources: { organic: 64, direct: 22, referral: 8, social: 3, paid: 3 },
    pages: ["/", "/docs/introduction", "/docs/quickstart", "/api/reference", "/guides", "/changelog", "/community", "/search"],
    keywords: ["docs", "api reference", "tutorial", "guide", "sdk"],
    base: 2600,
  },
  social: {
    key: "social",
    label: "Social · Community",
    accent: "#ff5ea8",
    stacks: ["React", "Go", "Redis", "Kafka", "Kubernetes"],
    sources: { organic: 30, direct: 42, referral: 6, social: 18, paid: 4 },
    pages: ["/home", "/explore", "/messages", "/notifications", "/profile", "/trending", "/search"],
    keywords: ["community", "posts", "feed", "follow", "trending"],
    base: 15000,
  },
  default: {
    key: "default",
    label: "Web App",
    accent: "#d6ff3a",
    stacks: ["React", "Node.js", "PostgreSQL"],
    sources: { organic: 40, direct: 30, referral: 10, social: 12, paid: 8 },
    pages: ["/", "/about", "/pricing", "/dashboard", "/login", "/blog", "/contact", "/search"],
    keywords: ["website", "online", "platform", "app", "service"],
    base: 3000,
  },
};

export interface SiteProfile {
  domain: string;
  displayName: string;
  favicon: string;
  category: Category;
  country: string;
  countryCode: string;
  rank: number;
  monthlyVisits: number; // absolute
  pagesPerVisit: number;
  bounceRate: number;
  avgDuration: number; // seconds
  founded: number;
  stacks: string[];
  pages: string[];
  keywords: string[];
  competitors: string[];
  seed: number;
}

// Known domains → category, so popular lookups feel accurate.
const KNOWN: Record<string, CategoryKey> = {
  "stripe.com": "saas",
  "notion.so": "saas",
  "linear.app": "saas",
  "vercel.com": "saas",
  "figma.com": "saas",
  "github.com": "saas",
  "slack.com": "saas",
  "asana.com": "saas",
  "shopify.com": "ecommerce",
  "amazon.com": "ecommerce",
  "etsy.com": "ecommerce",
  "nytimes.com": "media",
  "bbc.com": "media",
  "cnn.com": "media",
  "reddit.com": "social",
  "x.com": "social",
  "discord.com": "social",
  "react.dev": "docs",
  "tailwindcss.com": "docs",
  "nextjs.org": "docs",
};

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function normalizeDomain(raw: string): string {
  let d = raw.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "");
  d = d.split("/")[0].split("?")[0].split("#")[0];
  return d;
}

const COUNTRIES = [
  ["United States", "US"],
  ["United Kingdom", "GB"],
  ["Germany", "DE"],
  ["India", "IN"],
  ["France", "FR"],
  ["Japan", "JP"],
  ["Brazil", "BR"],
  ["Canada", "CA"],
  ["Netherlands", "NL"],
  ["Australia", "AU"],
];

const COMPETITOR_POOL: Record<CategoryKey, string[]> = {
  ecommerce: ["shopify.com", "amazon.com", "etsy.com", "bigcommerce.com", "woocommerce.com"],
  saas: ["notion.so", "linear.app", "asana.com", "monday.com", "clickup.com", "stripe.com"],
  media: ["nytimes.com", "bbc.com", "reuters.com", "theguardian.com", "cnn.com"],
  docs: ["react.dev", "tailwindcss.com", "nextjs.org", "vuejs.org", "docusaurus.io"],
  social: ["reddit.com", "discord.com", "mastodon.social", "x.com", "bluesky.app"],
  default: ["example.com", "webflow.com", "squarespace.com", "wix.com"],
};

function classify(domain: string): CategoryKey {
  if (KNOWN[domain]) return KNOWN[domain];
  const d = domain;
  if (/shop|store|mart|buy|market/.test(d)) return "ecommerce";
  if (/news|times|post|daily|herald|press|journal/.test(d) || /\.(news|tv)$/.test(d)) return "media";
  if (/docs?|wiki|guide/.test(d) || /\.(dev|io|org)$/.test(d) && /doc|api|js|css|lang/.test(d)) return "docs";
  if (/reddit|twitter|discord|forum|community|chat|social|mastodon|bluesky/.test(d)) return "social";
  if (/\.(dev|app|io|ai|so)$/.test(d)) return "saas";
  if (/\.(store|shop)$/.test(d)) return "ecommerce";
  return "default";
}

export function buildProfile(raw: string): SiteProfile {
  const domain = normalizeDomain(raw);
  const cat = CATEGORIES[classify(domain)];
  const seed = hashString(domain);
  const r = mulberry(seed);

  const country = COUNTRIES[Math.floor(r() * COUNTRIES.length)];
  const rank = 80 + (seed % 9000);
  const monthly = Math.round(cat.base * (0.45 + r() * 1.8) * 1000);
  const pagesPerVisit = +(2 + r() * 5).toFixed(1);
  const bounceRate = Math.round(28 + r() * 38);
  const avgDuration = Math.round(60 + r() * 300);
  const founded = 2004 + (seed % 19);

  const pool = COMPETITOR_POOL[cat.key].filter((c) => c !== domain);
  const competitors: string[] = [];
  while (competitors.length < 3 && pool.length) {
    const idx = Math.floor(r() * pool.length);
    competitors.push(pool.splice(idx, 1)[0]);
  }

  return {
    domain,
    displayName: domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1),
    favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    category: cat,
    country: country[0],
    countryCode: country[1],
    rank,
    monthlyVisits: monthly,
    pagesPerVisit,
    bounceRate,
    avgDuration,
    founded,
    stacks: cat.stacks.slice(0, 3 + Math.floor(r() * 2)),
    pages: cat.pages,
    keywords: cat.keywords,
    competitors,
    seed,
  };
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function flagEmoji(cc: string): string {
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function fmtNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export const TRENDING: { domain: string; tag: string }[] = [
  { domain: "github.com", tag: "devtools" },
  { domain: "stripe.com", tag: "fintech" },
  { domain: "notion.so", tag: "productivity" },
  { domain: "nytimes.com", tag: "news" },
  { domain: "reddit.com", tag: "community" },
  { domain: "shopify.com", tag: "commerce" },
];
