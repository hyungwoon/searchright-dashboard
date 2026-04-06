"use client";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart, Area } from "recharts";
import { dailyFunnel as staticDailyFunnel } from "@/lib/data";

type DailyFunnelRow = { date: string; cta?: number; pageView?: number; formStart?: number; lead?: number; [k: string]: unknown };

export default function FunnelTrend({ data }: { data?: DailyFunnelRow[] }) {
  const raw = data ?? staticDailyFunnel;
  const dailyFunnel = raw.map((r) => {
    const rec = r as Record<string, unknown>;
    return {
      date: String(rec.date ?? ""),
      cta: Number(rec.cta ?? rec.Request_landing_cta_home ?? 0),
      pageView: Number(rec.pageView ?? rec.inquiry_page_view ?? 0),
      formStart: Number(rec.formStart ?? rec.inquiry_form_start ?? 0),
      lead: Number(rec.lead ?? rec.inquiry_generate_lead ?? 0),
    };
  });

  const totalCta = dailyFunnel.reduce((s, d) => s + d.cta, 0);
  const totalPV = dailyFunnel.reduce((s, d) => s + d.pageView, 0);
  const totalLead = dailyFunnel.reduce((s, d) => s + d.lead, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white/90">문의 전환 퍼널 시계열</h2>
          <p className="text-[13px] text-white/30 mt-0.5">CTA 클릭 → 문의 페이지 → 폼 입력 → 전환</p>
        </div>
        <div className="flex gap-3 text-[11px]">
          <div className="backdrop-blur-md bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-center">
            <div className="text-white/25">CTA</div>
            <div className="text-blue-400 font-semibold">{totalCta}</div>
          </div>
          <div className="backdrop-blur-md bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-center">
            <div className="text-white/25">문의진입</div>
            <div className="text-violet-400 font-semibold">{totalPV}</div>
          </div>
          <div className="backdrop-blur-md bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-center">
            <div className="text-white/25">전환</div>
            <div className="text-emerald-400 font-semibold">{totalLead}</div>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={dailyFunnel}>
          <defs>
            <linearGradient id="gCta" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "rgba(15,15,20,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14 }} />
          <Legend />
          <Area type="monotone" dataKey="cta" name="CTA 클릭" stroke="#3b82f6" fill="url(#gCta)" strokeWidth={2} />
          <Area type="monotone" dataKey="pageView" name="문의 진입" stroke="#8b5cf6" fill="url(#gPV)" strokeWidth={2} />
          <Line type="monotone" dataKey="formStart" name="폼 입력" stroke="#a78bfa" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: "#a78bfa" }} />
          <Line type="monotone" dataKey="lead" name="전환" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 5, fill: "#22c55e", stroke: "#000", strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-4 backdrop-blur-md bg-white/[0.025] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-white/40">
        <span className="text-amber-400/80 font-medium">3/30부터 inquiry 이벤트 측정 시작</span> — CTA 클릭({totalCta}회) 대비 문의 진입({totalPV}회)은 {totalCta > 0 ? ((totalPV / totalCta) * 100).toFixed(1) : 0}%.
        진입 후 전환율은 {totalPV > 0 ? ((totalLead / totalPV) * 100).toFixed(1) : 0}% ({totalLead}건).
      </div>
    </div>
  );
}
