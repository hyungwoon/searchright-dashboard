"use client";
import type { BlogCardsData } from "@/lib/ga4";

function deltaPct(curr: number, prev: number): { text: string; color: string } {
  if (prev === 0) {
    return curr > 0 ? { text: "NEW", color: "text-emerald-400" } : { text: "—", color: "text-[#64748b]" };
  }
  const d = ((curr - prev) / prev) * 100;
  return {
    text: `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`,
    color: d > 0 ? "text-emerald-400" : d < 0 ? "text-rose-400" : "text-[#64748b]",
  };
}

function deltaPp(curr: number, prev: number): { text: string; color: string } {
  const d = curr - prev;
  return {
    text: `${d >= 0 ? "+" : ""}${d.toFixed(1)}pp`,
    color: d > 0 ? "text-emerald-400" : d < 0 ? "text-rose-400" : "text-[#64748b]",
  };
}

export default function BlogCardsCard({ data }: { data: BlogCardsData }) {
  const impDelta = deltaPct(data.impressions, data.prev.impressions);
  const clkDelta = deltaPct(data.clicks, data.prev.clicks);
  const ctrDelta = deltaPp(data.ctr, data.prev.ctr);
  const hasData = data.impressions > 0 || data.clicks > 0;

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-lg font-semibold">📰 Blog 3카드 섹션</h2>
        <span className="text-[10px] text-[#64748b]">card_position 1·2·3 합산</span>
      </div>
      <p className="text-xs text-[#64748b] mb-4">
        각 카드 50% 뷰포트 노출 → 카드 클릭 → 블로그 글 진입
      </p>

      {hasData ? (
        <div className="grid grid-cols-3 gap-2 bg-[#0f172a] rounded-lg p-3">
          <div>
            <div className="text-[11px] text-[#94a3b8]">노출</div>
            <div className="text-2xl font-bold text-violet-400">{data.impressions.toLocaleString()}</div>
            <div className={`text-[11px] mt-0.5 ${impDelta.color}`}>{impDelta.text}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#94a3b8]">클릭</div>
            <div className="text-2xl font-bold text-purple-400">{data.clicks.toLocaleString()}</div>
            <div className={`text-[11px] mt-0.5 ${clkDelta.color}`}>{clkDelta.text}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#94a3b8]">CTR</div>
            <div className="text-2xl font-bold text-emerald-400">{data.ctr.toFixed(1)}%</div>
            <div className={`text-[11px] mt-0.5 ${ctrDelta.color}`}>{ctrDelta.text}</div>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-[#64748b] py-8 bg-[#0f172a] rounded-lg">
          선택 기간에 Blog 카드 이벤트가 없습니다.
        </div>
      )}

      <p className="text-[10px] text-[#64748b] mt-3">
        ※ blog_slug · card_position별 drilldown은 customDimension 등록 후 추가 예정.
      </p>
    </div>
  );
}
