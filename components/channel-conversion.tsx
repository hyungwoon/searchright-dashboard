"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { inquiryFunnel as staticInquiryFunnel } from "@/lib/data";

type ChannelAttrRow = { channel: string; [k: string]: unknown };

export default function ChannelConversion({ data: propData }: { data?: ChannelAttrRow[] }) {
  const raw = propData ?? staticInquiryFunnel.channelAttribution;
  const data = raw.map((r) => {
    const rec = r as Record<string, unknown>;
    return {
      channel: String(rec.channel ?? ""),
      pageView: Number(rec.pageView ?? rec.inquiry_page_view ?? 0),
      formStart: Number(rec.formStart ?? rec.inquiry_form_start ?? 0),
      lead: Number(rec.lead ?? rec.inquiry_generate_lead ?? 0),
    };
  });

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-1">문의 채널 기여도</h2>
      <p className="text-xs text-[#64748b] mb-4">어떤 채널이 문의를 만들어내는가</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="channel" stroke="#64748b" tick={{ fontSize: 11 }} width={110} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
          <Legend />
          <Bar dataKey="pageView" name="페이지 진입" fill="#3b82f6" radius={[0, 4, 4, 0]} stackId="a" />
          <Bar dataKey="formStart" name="폼 입력" fill="#8b5cf6" radius={[0, 4, 4, 0]} stackId="a" />
          <Bar dataKey="lead" name="리드" fill="#22c55e" radius={[0, 4, 4, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="p-2 bg-[#0f172a] rounded-lg text-xs">
          <span className="text-[#94a3b8]">최고 문의 채널</span>
          <div className="text-[#3b82f6] font-semibold">Organic Social (12건)</div>
          <div className="text-[#64748b] text-xs">페이지 진입 기준</div>
        </div>
        <div className="p-2 bg-[#0f172a] rounded-lg text-xs">
          <span className="text-[#94a3b8]">최고 전환 채널</span>
          <div className="text-[#22c55e] font-semibold">Paid Search (리드 1건)</div>
          <div className="text-[#64748b] text-xs">페이지 진입 대비 100% 전환</div>
        </div>
      </div>
    </div>
  );
}
