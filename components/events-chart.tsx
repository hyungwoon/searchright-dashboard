"use client";
import { Period, getEvents, type EventRow } from "@/lib/period-data";

export default function EventsChart({ period, data }: { period: Period; data?: EventRow[] }) {
  const events = data ?? getEvents(period);
  const maxCount = events[0]?.count ?? 1;
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">커스텀 이벤트</h2>
      <p className="text-xs text-[#64748b] mb-4">이벤트 정의 및 발생 현황</p>
      <div className="space-y-2.5">
        {events.map((e) => (
          <div key={e.key}>
            <div className="flex justify-between text-sm mb-0.5">
              <div>
                <span className="font-medium">{e.name}</span>
                <span className="text-[#64748b] text-xs ml-2">{e.desc}</span>
              </div>
              <span className="font-mono font-medium" style={{ color: e.color }}>{e.count.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[#0f172a] rounded-full h-2">
              <div className="h-full rounded-full" style={{ width: `${(e.count / maxCount) * 100}%`, background: e.color }} />
            </div>
            <div className="text-xs text-[#64748b] mt-0.5">{e.users}명 · 인당 {(e.count / Math.max(e.users, 1)).toFixed(1)}회</div>
          </div>
        ))}
      </div>
    </div>
  );
}
