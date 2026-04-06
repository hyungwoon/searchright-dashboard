"use client";
import { topPages as staticTopPages } from "@/lib/data";

type PageRow = { path: string; label: string; views: number; users: number; engRate: number };

export default function TopPages({ data }: { data?: PageRow[] }) {
  const topPages = data ?? staticTopPages;
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">인기 페이지 TOP 13</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#94a3b8] border-b border-[#334155]">
              <th className="text-left py-2 pr-4">페이지</th>
              <th className="text-right py-2 px-3">페이지뷰</th>
              <th className="text-right py-2 px-3">사용자</th>
              <th className="text-right py-2 px-3">참여율</th>
              <th className="text-right py-2 pl-3">비율</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map((p, i) => (
              <tr key={p.path} className="border-b border-[#1e293b] hover:bg-[#334155]/30">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748b] text-xs w-5">{i + 1}</span>
                    <div>
                      <div className="font-medium">{p.label}</div>
                      <div className="text-xs text-[#64748b]">{p.path}</div>
                    </div>
                  </div>
                </td>
                <td className="text-right px-3 font-mono">{p.views.toLocaleString()}</td>
                <td className="text-right px-3 font-mono text-[#94a3b8]">{p.users}</td>
                <td className="text-right px-3">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: p.engRate > 80 ? "#10b98120" : p.engRate > 50 ? "#f59e0b20" : "#f43f5e20",
                      color: p.engRate > 80 ? "#10b981" : p.engRate > 50 ? "#f59e0b" : "#f43f5e",
                    }}
                  >
                    {p.engRate}%
                  </span>
                </td>
                <td className="text-right pl-3">
                  <div className="w-20 ml-auto">
                    <div className="bg-[#0f172a] rounded-full h-1.5">
                      <div
                        className="h-full rounded-full bg-[#3b82f6]"
                        style={{ width: `${(p.views / topPages[0].views) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
