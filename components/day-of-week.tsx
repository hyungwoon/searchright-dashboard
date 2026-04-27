"use client";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dayOfWeek as staticDayOfWeek } from "@/lib/data";

type DowRow = { day: string; sessions: number; users: number; pageviews: number };

const WEEKEND_DAYS = new Set(["일", "토"]);

function avgOf(rows: DowRow[]): number {
  if (rows.length === 0) return 0;
  return Math.round(rows.reduce((s, d) => s + d.sessions, 0) / rows.length);
}

export default function DayOfWeek({ data }: { data?: DowRow[] }) {
  const dayOfWeek = data ?? staticDayOfWeek;
  const overallAvg = avgOf(dayOfWeek);
  const weekdayAvg = avgOf(dayOfWeek.filter((d) => !WEEKEND_DAYS.has(d.day)));
  const weekendAvg = avgOf(dayOfWeek.filter((d) => WEEKEND_DAYS.has(d.day)));
  const ratio = weekendAvg > 0 ? `${(weekdayAvg / weekendAvg).toFixed(1)}x` : "—";

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
              <Cell
                key={d.day}
                fill={
                  WEEKEND_DAYS.has(d.day)
                    ? "#64748b"
                    : d.sessions > overallAvg
                    ? "#3b82f6"
                    : "#475569"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-2">
        <div className="flex-1 p-2 bg-[#0f172a] rounded-lg text-xs text-center">
          <div className="text-[#94a3b8]">평일 평균</div>
          <div className="text-[#3b82f6] font-semibold">{weekdayAvg.toLocaleString()}</div>
        </div>
        <div className="flex-1 p-2 bg-[#0f172a] rounded-lg text-xs text-center">
          <div className="text-[#94a3b8]">주말 평균</div>
          <div className="text-[#94a3b8] font-semibold">{weekendAvg.toLocaleString()}</div>
        </div>
        <div className="flex-1 p-2 bg-[#0f172a] rounded-lg text-xs text-center">
          <div className="text-[#94a3b8]">평일/주말 비</div>
          <div className="text-[#f59e0b] font-semibold">{ratio}</div>
        </div>
      </div>
    </div>
  );
}
