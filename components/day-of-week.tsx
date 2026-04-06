"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dayOfWeek as staticDayOfWeek } from "@/lib/data";

type DowRow = { day: string; sessions: number; users: number; pageviews: number };

export default function DayOfWeek({ data }: { data?: DowRow[] }) {
  const dayOfWeek = data ?? staticDayOfWeek;
  const avg = Math.round(dayOfWeek.reduce((s, d) => s + d.sessions, 0) / 7);
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">요일별 패턴</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dayOfWeek}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
          <Bar dataKey="sessions" name="세션" radius={[4, 4, 0, 0]}>
            {dayOfWeek.map((d) => (
              <rect key={d.day} fill={d.sessions > avg ? "#3b82f6" : "#334155"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-2">
        <div className="flex-1 p-2 bg-[#0f172a] rounded-lg text-xs text-center">
          <div className="text-[#94a3b8]">평일 평균</div>
          <div className="text-[#3b82f6] font-semibold">{Math.round((392 + 457 + 395 + 433 + 439) / 5)}</div>
        </div>
        <div className="flex-1 p-2 bg-[#0f172a] rounded-lg text-xs text-center">
          <div className="text-[#94a3b8]">주말 평균</div>
          <div className="text-[#64748b] font-semibold">{Math.round((125 + 143) / 2)}</div>
        </div>
        <div className="flex-1 p-2 bg-[#0f172a] rounded-lg text-xs text-center">
          <div className="text-[#94a3b8]">평일/주말 비</div>
          <div className="text-[#f59e0b] font-semibold">3.2x</div>
        </div>
      </div>
    </div>
  );
}
