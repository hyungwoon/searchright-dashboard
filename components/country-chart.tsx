"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { countries as staticCountries } from "@/lib/data";

type CountryRow = { name: string; sessions: number; users: number };

export default function CountryChart({ data }: { data?: CountryRow[] }) {
  const countries = data ?? staticCountries;
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">국가별 트래픽</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={countries.slice(0, 6)} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} width={70} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
          <Bar dataKey="sessions" name="세션" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 p-2 bg-[#0f172a] rounded-lg text-xs text-[#94a3b8]">
        한국 비율 <span className="text-[#3b82f6] font-semibold">88.2%</span> — 해외 트래픽 11.8%
      </div>
    </div>
  );
}
