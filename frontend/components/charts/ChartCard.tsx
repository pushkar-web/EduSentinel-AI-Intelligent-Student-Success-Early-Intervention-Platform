"use client";

import React, { useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = Record<string, string | number>;

const INK = "#181D26";
const GRID = "#EAECEF";
const MUTED = "#666D7A";
export const CHART_COLORS = ["#AA2D00", "#0A2E0E", "#D9A441", "#254FAD", "#059669", "#DC2626"];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Row[]) {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c] ?? "")).join(","))].join("\n");
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  /** Plain-language description for screen readers. */
  ariaLabel: string;
  /** Data backing the chart; powers the CSV export. */
  data: Row[];
  filename?: string;
  height?: number;
  className?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Card wrapper with accessible label plus CSV / PNG export for any chart. */
export function ChartCard({
  title,
  subtitle,
  ariaLabel,
  data,
  filename = "chart",
  height = 260,
  className = "",
  footer,
  children,
}: ChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const exportCsv = () =>
    downloadBlob(new Blob([toCsv(data)], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);

  const exportPng = () => {
    const svg = ref.current?.querySelector("svg.recharts-surface") as SVGSVGElement | null;
    if (!svg) return;
    const { width, height: h } = svg.getBoundingClientRect();
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => b && downloadBlob(b, `${filename}.png`));
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  };

  return (
    <section
      className={`rounded-[20px] border border-[#EAECEF] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col ${className}`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[#181D26]">{title}</h3>
          {subtitle && <p className="text-[12.5px] text-[#666D7A]">{subtitle}</p>}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={exportCsv}
            aria-label={`Download ${title} as CSV`}
            className="rounded-[8px] border border-[#DDDDDD] px-2 py-1 text-[11px] font-medium text-[#333840] hover:bg-[#F7F8FA] cursor-pointer"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={exportPng}
            aria-label={`Download ${title} as PNG`}
            className="rounded-[8px] border border-[#DDDDDD] px-2 py-1 text-[11px] font-medium text-[#333840] hover:bg-[#F7F8FA] cursor-pointer"
          >
            PNG
          </button>
        </div>
      </header>
      <div ref={ref} role="img" aria-label={ariaLabel} className="flex-1 flex items-center" style={{ minHeight: height }}>
        {children}
      </div>
      {footer && <div className="mt-3 pt-1">{footer}</div>}
    </section>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: `1px solid ${GRID}`,
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

export function TrendLineChart({
  data,
  xKey,
  series,
  height = 260,
}: {
  data: Row[];
  xKey: string;
  series: { key: string; label?: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label ?? s.key}
            stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarComparisonChart({
  data,
  xKey,
  series,
  height = 260,
}: {
  data: Row[];
  xKey: string;
  series: { key: string; label?: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F7F8FA" }} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label ?? s.key}
            fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            radius={[6, 6, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export const RISK_COLORS: Record<string, string> = {
  Critical: "#DC2626",
  High: "#D97706",
  Medium: "#D9A441",
  Low: "#059669",
  Stable: "#0A2E0E",
};

export function RiskDonutChart({
  data,
  height = 260,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={RISK_COLORS[d.name] ?? CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Tiny axis-less trend line for KPI cards. */
export function MiniSparkline({
  values,
  color = INK,
  width = 96,
  height = 32,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div role="img" aria-label={`Trend: ${values.join(", ")}`} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [String(v), ""]} labelFormatter={() => ""} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
