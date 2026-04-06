"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { sourceMedium as staticSourceMedium } from "@/lib/data";

type SourceMediumRow = { source: string; medium: string; sessions: number; users: number; pageviews: number; engRate: number };

export default function SourceMedium({ data: propData }: { data?: SourceMediumRow[] }) {
  const raw = propData ?? staticSourceMedium;
  const data = raw.map((s) => ({
    name: `${s.source} / ${s.medium}`,
    sessions: s.sessions,
    engRate: s.engRate,
  }));
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">유입 소스/매체 상세</h2>
      <p className="text-xs text-[#64748b] mb-4">Organic Search를 Google / Naver 등으로 분리</p>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} width={140} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
          <Bar dataKey="sessions" name="세션" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
