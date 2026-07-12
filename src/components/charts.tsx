import { useId } from "react";

type Pt = { x: number; y: number };

// Catmull-Rom → cubic bezier smoothing
function smooth(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function Sparkline({
  data,
  color = "var(--lime)",
  height = 42,
  width = 140,
  fill = true,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  fill?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = Math.max(1, max - min);
  const pts: Pt[] = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / span) * (height - 6) - 3,
  }));
  const d = smooth(pts);
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#sg-${id})`} />}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.4} fill={color} />
    </svg>
  );
}

export function AreaChart({
  labels,
  series,
  activeIdx,
  onHover,
  height = 260,
}: {
  labels: string[];
  series: { key: string; values: number[]; color: string; active: boolean }[];
  activeIdx: number | null;
  onHover: (i: number | null, x: number) => void;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");
  const W = 900;
  const H = height;
  const pad = { t: 16, r: 12, b: 26, l: 40 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const activeSeries = series.find((s) => s.active) ?? series[0];
  const allVals = activeSeries.values;
  const max = Math.max(...allVals) * 1.1;
  const min = 0;
  const span = Math.max(1, max - min);

  const xAt = (i: number) => pad.l + (i / (labels.length - 1)) * innerW;
  const yAt = (v: number) => pad.t + innerH - ((v - min) / span) * innerH;

  const pts: Pt[] = activeSeries.values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const line = smooth(pts);
  const area = `${line} L ${xAt(labels.length - 1)} ${pad.t + innerH} L ${xAt(0)} ${pad.t + innerH} Z`;

  // y gridlines (4)
  const gridVals = Array.from({ length: 4 }, (_, i) => min + (span / 3) * i);

  // x labels (sparse)
  const step = Math.ceil(labels.length / 8);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRel = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((xRel - pad.l) / innerW) * (labels.length - 1));
    onHover(Math.max(0, Math.min(labels.length - 1, i)), e.clientX - rect.left);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height }}
      onMouseMove={handleMove}
      onMouseLeave={() => onHover(null, 0)}
    >
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={activeSeries.color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={activeSeries.color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* grid */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={yAt(v)}
            y2={yAt(v)}
            stroke="rgba(0,0,0,0.08)"
            strokeDasharray="2 4"
          />
          <text
            x={pad.l - 8}
            y={yAt(v) + 4}
            textAnchor="end"
            className="font-mono"
            style={{ fontSize: 10, fill: "rgba(16,18,16,0.55)" }}
          >
            {v >= 1000 ? (v / 1000).toFixed(1) + "k" : Math.round(v)}
          </text>
        </g>
      ))}

      {/* x labels */}
      {labels.map((l, i) =>
        i % step === 0 || i === labels.length - 1 ? (
          <text
            key={i}
            x={xAt(i)}
            y={H - 8}
            textAnchor="middle"
            className="font-mono"
            style={{ fontSize: 10, fill: "rgba(16,18,16,0.55)" }}
          >
            {l}
          </text>
        ) : null
      )}

      {/* area + line */}
      <path d={area} fill={`url(#area-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={activeSeries.color}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        key={activeSeries.key}
        style={{ ["--len" as string]: 2400 }}
        className="draw-line"
      />

      {/* crosshair */}
      {activeIdx != null && (
        <g>
          <line
            x1={xAt(activeIdx)}
            x2={xAt(activeIdx)}
            y1={pad.t}
            y2={pad.t + innerH}
            stroke="rgba(16,18,16,0.35)"
            strokeDasharray="2 3"
          />
          <circle cx={xAt(activeIdx)} cy={yAt(activeSeries.values[activeIdx])} r={5} fill={activeSeries.color} />
          <circle cx={xAt(activeIdx)} cy={yAt(activeSeries.values[activeIdx])} r={9} fill={activeSeries.color} fillOpacity={0.18} />
        </g>
      )}
    </svg>
  );
}

export function Donut({
  data,
  size = 150,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = frac * c;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.2,0.7,0.2,1)" }}
          />
        );
        offset += dash;
        return el;
      })}
      <g transform={`rotate(90 ${size / 2} ${size / 2})`}>
        {centerValue && (
          <text
            x={size / 2}
            y={size / 2 - 2}
            textAnchor="middle"
            className="font-display tnum"
            style={{ fontSize: 26, fontWeight: 600, fill: "#101210" }}
          >
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text
            x={size / 2}
            y={size / 2 + 16}
            textAnchor="middle"
            className="font-mono"
            style={{ fontSize: 10, fill: "rgba(16,18,16,0.6)", letterSpacing: "0.12em" }}
          >
            {centerLabel}
          </text>
        )}
      </g>
    </svg>
  );
}

export function MiniBars({ data, color = "var(--cobalt)", height = 22, width = 64 }: { data: number[]; color?: string; height?: number; width?: number }) {
  const max = Math.max(...data);
  const bw = width / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const h = (v / max) * (height - 2);
        return (
          <rect
            key={i}
            x={i * bw + 1}
            y={height - h}
            width={Math.max(1, bw - 2)}
            height={h}
            fill={color}
            rx={1}
            style={{ transition: "height 0.4s ease, y 0.4s ease" }}
          />
        );
      })}
    </svg>
  );
}
