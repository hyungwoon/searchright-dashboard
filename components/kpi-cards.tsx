"use client";

type KpiData = {
  sessions: number; users: number; pageviews: number; engRate: number; bounceRate: number;
  prev: { sessions: number; users: number; pageviews: number; engRate: number; bounceRate: number };
};

function pct(curr: number, prev: number) {
  if (!prev) return null;
  return ((curr - prev) / prev * 100).toFixed(1);
}

export default function KpiCards({ data }: { data: KpiData }) {
  const p = data.prev;
  const cards = [
    { label: "총 세션", value: data.sessions.toLocaleString(), change: pct(data.sessions, p.sessions), color: "#3b82f6" },
    { label: "활성 사용자", value: data.users.toLocaleString(), change: pct(data.users, p.users), color: "#10b981" },
    { label: "페이지뷰", value: data.pageviews.toLocaleString(), change: pct(data.pageviews, p.pageviews), color: "#8b5cf6" },
    { label: "참여율", value: `${data.engRate}%`, change: (data.engRate - p.engRate).toFixed(1), unit: "pp", color: "#f59e0b" },
    { label: "이탈률", value: `${data.bounceRate}%`, change: (data.bounceRate - p.bounceRate).toFixed(1), unit: "pp", color: "#f43f5e", invert: true },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c) => {
        const n = Number(c.change);
        const positive = c.invert ? n <= 0 : n >= 0;
        return (
          <div key={c.label} className="kpi-card group">
            <div className="text-[11px] font-medium tracking-wider text-white/30 uppercase mb-2">{c.label}</div>
            <div className="text-2xl font-bold tracking-tight" style={{ color: c.color }}>{c.value}</div>
            {c.change != null && (
              <div className={`text-xs mt-1.5 font-semibold ${positive ? "text-emerald-400/80" : "text-red-400/80"}`}>
                {n >= 0 ? "+" : ""}{c.change}{c.unit || "%"} <span className="font-normal text-white/20">vs 전기</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
