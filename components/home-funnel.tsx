"use client";
import type { HomeFunnelData } from "@/lib/ga4";

// 5 stages: 전체 방문자 → 홈화면 방문자 → 홈 폼 시작 → 이메일 진행 → 홈 리드 전환
const COLORS = ["#3b82f6", "#6366f1", "#38bdf8", "#0ea5e9", "#16a34a"];

export default function HomeFunnel({ data }: { data: HomeFunnelData }) {
  const funnel = data.stages;
  const hasData = funnel.length > 0 && funnel[0].value > 0;

  if (!hasData) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">🏠 홈 인라인 폼 퍼널</h2>
        <p className="text-xs text-[#64748b] mb-4">
          전체 방문 → 홈화면 → 폼 시작 → 이메일 → 제출
        </p>
        <div className="text-center text-sm text-[#64748b] py-12">
          선택 기간에 데이터가 없습니다.
        </div>
      </div>
    );
  }

  const overallRate =
    funnel[0].value > 0
      ? ((funnel[funnel.length - 1].value / funnel[0].value) * 100).toFixed(2)
      : "0";

  // Conversion from 홈화면 방문 → 리드 (funnel[1] is "홈화면 방문자")
  const homeToLeadRate =
    funnel.length >= 3 && funnel[1].value > 0
      ? ((funnel[funnel.length - 1].value / funnel[1].value) * 100).toFixed(2)
      : null;

  // Biggest drop-off
  let maxDropIdx = 1;
  let maxDropPct = 0;
  for (let i = 1; i < funnel.length; i++) {
    const drop =
      funnel[i - 1].value > 0
        ? ((funnel[i - 1].value - funnel[i].value) / funnel[i - 1].value) * 100
        : 0;
    if (drop > maxDropPct) {
      maxDropPct = drop;
      maxDropIdx = i;
    }
  }

  const stepConversion = (i: number) => {
    if (i === 0 || funnel[i - 1].value === 0) return null;
    return ((funnel[i].value / funnel[i - 1].value) * 100).toFixed(1);
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">🏠 홈 인라인 폼 퍼널</h2>
      <p className="text-xs text-[#64748b] mb-4">
        Hero 섹션 인라인 폼 — 첫 포커스 → 이메일 입력 → 제출
      </p>
      <div className="space-y-3">
        {funnel.map((step, i) => {
          const widthPct = Math.max((step.value / funnel[0].value) * 100, 8);
          const dropoff =
            i > 0 && funnel[i - 1].value > 0
              ? (((funnel[i - 1].value - step.value) / funnel[i - 1].value) * 100).toFixed(1)
              : null;
          const isBiggestDrop = i === maxDropIdx;
          const stepConv = stepConversion(i);
          return (
            <div key={step.stage}>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: COLORS[i] }}
                  />
                  {step.stage}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{step.value.toLocaleString()}</span>
                  {dropoff && (
                    <span
                      className={`text-xs ${isBiggestDrop ? "text-[#f43f5e] font-bold" : "text-[#f43f5e]"}`}
                    >
                      -{dropoff}%{isBiggestDrop && " !!"}
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-[#0f172a] rounded-full h-8 relative overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-3 transition-all"
                  style={{ width: `${widthPct}%`, background: COLORS[i] }}
                >
                  <span className="text-xs font-medium text-white">{step.rate}%</span>
                </div>
              </div>
              {stepConv && (
                <div className="text-right text-[10px] text-[#94a3b8] mt-0.5">
                  이전 단계 대비 {stepConv}% 전환
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-[#0f172a] rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[#94a3b8]">홈 리드 전환율</div>
            <div className="text-xs text-[#64748b]">전체 방문자 → 홈 리드 전환</div>
          </div>
          <div className="text-2xl font-bold text-[#16a34a]">{overallRate}%</div>
        </div>
        {homeToLeadRate && (
          <div className="mt-2 text-xs text-[#94a3b8]">
            홈화면 방문 → 리드 전환율:{" "}
            <span className="text-[#16a34a] font-semibold">{homeToLeadRate}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
