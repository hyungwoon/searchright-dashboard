"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { newVsReturning as staticNewVsReturning } from "@/lib/data";

type NvRRow = { name: string; sessions: number; users: number; engRate: number; avgDuration: number; color: string };

export default function UserTypeChart({ data }: { data?: NvRRow[] }) {
  const newVsReturning = data ?? staticNewVsReturning;
  const total = newVsReturning.reduce((s, d) => s + d.sessions, 0);
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">신규 vs 재방문</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={newVsReturning}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="sessions"
            stroke="none"
          >
            {newVsReturning.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {newVsReturning.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
              <span>{d.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono">{((d.sessions / total) * 100).toFixed(1)}%</span>
              <span className="text-[#64748b] text-xs">참여 {d.engRate}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 bg-[#0f172a] rounded-lg text-xs text-[#94a3b8]">
        재방문자 평균 체류 <span className="text-[#8b5cf6] font-semibold">12분 23초</span> — 신규 대비 5.6배
      </div>
    </div>
  );
}
