"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Period, periodChannels, type ChannelRow } from "@/lib/period-data";

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#8b5cf6", "#f43f5e", "#ec4899", "#14b8a6", "#a855f7"];

export default function ChannelChart({ period, data }: { period: Period; data?: ChannelRow[] }) {
  const channels = data ?? periodChannels[period];
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">트래픽 채널</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={channels} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} width={110} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
          <Bar dataKey="sessions" name="세션" radius={[0, 4, 4, 0]}>
            {channels.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
