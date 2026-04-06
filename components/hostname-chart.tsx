"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { hostnames as staticHostnames } from "@/lib/data";

type HostnameRow = { name: string; sessions: number; users: number; pageviews: number };

export default function HostnameChart({ data }: { data?: HostnameRow[] }) {
  const hostnames = data ?? staticHostnames;
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">도메인별 트래픽</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={hostnames}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
          <Legend />
          <Bar dataKey="sessions" name="세션" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pageviews" name="페이지뷰" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
