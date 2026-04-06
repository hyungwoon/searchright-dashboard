"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { dailyTrend as staticDailyTrend } from "@/lib/data";

type TrendRow = { date: string; engRate?: number; bounce?: number; [k: string]: unknown };

export default function EngagementTrend({ data }: { data?: TrendRow[] }) {
  const dailyTrend = data ?? staticDailyTrend;
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">참여율 vs 이탈률 추이</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dailyTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            formatter={(v) => `${Number(v).toFixed(1)}%`}
          />
          <Legend />
          <Line type="monotone" dataKey="engRate" name="참여율" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="bounce" name="이탈률" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
