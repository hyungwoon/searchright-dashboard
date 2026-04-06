"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Period, periodDevices, type DeviceRow } from "@/lib/period-data";

export default function DeviceChart({ period, data }: { period: Period; data?: DeviceRow[] }) {
  const devices = data ?? periodDevices[period];
  const total = devices.reduce((s, d) => s + d.value, 0);
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">디바이스</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={devices}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            stroke="none"
          >
            {devices.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {devices.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
              <span>{d.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono">{((d.value / total) * 100).toFixed(1)}%</span>
              <span className="text-[#64748b] text-xs">참여 {d.engRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
