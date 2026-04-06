"use client";
import { pageConversion as staticPageConversion } from "@/lib/data";

type PageConvRow = (typeof staticPageConversion)[number];
const val = (p: PageConvRow, key: string) => (p as Record<string, unknown>)[key] as number | undefined;

export default function PageConversion({ data }: { data?: PageConvRow[] }) {
  const pageConversion = data ?? staticPageConversion;
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">페이지별 전환 기여</h2>
      <p className="text-xs text-[#64748b] mb-4">어떤 페이지에서 문의/전환 이벤트가 발생하는가</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#94a3b8] border-b border-[#334155]">
              <th className="text-left py-2 pr-3">페이지</th>
              <th className="text-right py-2 px-2">CTA</th>
              <th className="text-right py-2 px-2">데모</th>
              <th className="text-right py-2 px-2">폼/입력</th>
              <th className="text-right py-2 px-2">리드</th>
              <th className="text-right py-2 pl-2">사용자</th>
            </tr>
          </thead>
          <tbody>
            {pageConversion.map((p) => {
              const cta = val(p, "cta");
              const demo = val(p, "demo");
              const form = val(p, "form") ?? val(p, "formStart");
              const lead = val(p, "lead");
              const pageView = val(p, "pageView");
              const blogView = val(p, "blogView");
              return (
                <tr key={p.path} className="border-b border-[#1e293b] hover:bg-[#334155]/30">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{p.page}</div>
                    <div className="text-xs text-[#64748b]">{p.path}</div>
                  </td>
                  <td className="text-right px-2 font-mono">
                    {cta ? <span className="text-[#3b82f6]">{cta}</span>
                      : pageView ? <span className="text-[#6366f1]">{pageView}<span className="text-[10px] text-[#64748b]"> 진입</span></span>
                      : blogView ? <span className="text-[#a855f7]">{blogView}<span className="text-[10px] text-[#64748b]"> 뷰</span></span>
                      : <span className="text-[#334155]">-</span>}
                  </td>
                  <td className="text-right px-2 font-mono">
                    {demo ? <span className="text-[#a855f7]">{demo}</span> : <span className="text-[#334155]">-</span>}
                  </td>
                  <td className="text-right px-2 font-mono">
                    {form ? <span className="text-[#8b5cf6]">{form}</span> : <span className="text-[#334155]">-</span>}
                  </td>
                  <td className="text-right px-2 font-mono">
                    {lead ? <span className="text-[#22c55e] font-semibold">{lead}</span> : <span className="text-[#334155]">-</span>}
                  </td>
                  <td className="text-right pl-2 font-mono text-[#94a3b8]">{p.users}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 p-2 bg-[#0f172a] rounded-lg text-xs text-[#94a3b8]">
        <span className="text-[#22c55e] font-semibold">/request/ 페이지</span>: 진입 30회 → 폼 입력 5회 → 리드 4회 (진입 대비 13.3% 전환).
        <span className="text-[#f59e0b] font-semibold"> 블로그 포스트</span> 205회 뷰 — CTA 14회로 블로그 내 문의 유도 강화 필요
      </div>
    </div>
  );
}
