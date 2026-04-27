"use client";
import type { LeadSummaryData } from "@/lib/ga4";

function changeStr(curr: number, prev: number): { text: string; color: string } {
  if (prev === 0) {
    return curr > 0 ? { text: "NEW", color: "text-emerald-400" } : { text: "—", color: "text-[#64748b]" };
  }
  const delta = ((curr - prev) / prev) * 100;
  const sign = delta >= 0 ? "+" : "";
  const arrow = delta > 0 ? " ▲" : delta < 0 ? " ▼" : "";
  const color = delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-[#64748b]";
  return { text: `${sign}${delta.toFixed(1)}%${arrow}`, color };
}

function Cell({
  label,
  value,
  prev,
  accent,
  sub,
}: {
  label: string;
  value: number;
  prev: number;
  accent: string;
  sub?: string;
}) {
  const change = changeStr(value, prev);
  return (
    <div className="flex-1 px-4 py-3">
      <div className="text-xs text-[#94a3b8] mb-1.5">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${accent}`}>{value.toLocaleString()}</span>
        <span className="text-xs text-[#64748b]">건</span>
      </div>
      <div className={`text-[11px] mt-1 ${change.color}`}>전기 대비 {change.text}</div>
      {sub && <div className="text-[10px] text-[#64748b] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function LeadSourceSummary({ data }: { data: LeadSummaryData }) {
  const homeShare = data.total > 0 ? Math.round((data.home / data.total) * 100) : 0;
  const requestShare = data.total > 0 ? 100 - homeShare : 0;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">리드 인입 종합</h2>
      <p className="text-xs text-[#64748b] mb-4">
        홈 인라인 폼 vs 문의 페이지(/request) — 같은 SubmitForm, 진입 출처만 다름
      </p>

      <div className="flex divide-x divide-[#1e293b] bg-[#0f172a] rounded-lg overflow-hidden">
        <Cell
          label="🏠 홈 인라인 폼"
          value={data.home}
          prev={data.prev.home}
          accent="text-sky-400"
          sub={data.total > 0 ? `전체 리드 중 ${homeShare}%` : undefined}
        />
        <Cell
          label="📋 문의 페이지"
          value={data.request}
          prev={data.prev.request}
          accent="text-violet-400"
          sub={data.total > 0 ? `전체 리드 중 ${requestShare}%` : undefined}
        />
        <Cell
          label="💎 합계"
          value={data.total}
          prev={data.prev.total}
          accent="text-emerald-400"
          sub="중복 dedup은 Meta CAPI에서 처리"
        />
      </div>

      {data.total === 0 && (
        <p className="text-[11px] text-[#64748b] mt-3 text-center">
          선택 기간에 리드가 없습니다. 이벤트 발사 여부를 확인하세요.
        </p>
      )}
    </div>
  );
}
