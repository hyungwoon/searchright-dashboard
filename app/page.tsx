"use client";
import { useState } from "react";
import { periodLabels } from "@/lib/period-data";
import { useAnalytics, type Period } from "@/lib/use-analytics";
import KpiCards from "@/components/kpi-cards";
import DailyTrend from "@/components/daily-trend";
import DatePicker from "@/components/date-picker";
import ChannelChart from "@/components/channel-chart";
import FunnelChart from "@/components/funnel-chart";
import TopPages from "@/components/top-pages";
import DeviceChart from "@/components/device-chart";
import UserTypeChart from "@/components/user-type-chart";
import HostnameChart from "@/components/hostname-chart";
import EventsChart from "@/components/events-chart";
import EngagementTrend from "@/components/engagement-trend";
import SourceMedium from "@/components/source-medium";
import ChannelConversion from "@/components/channel-conversion";
import PageConversion from "@/components/page-conversion";
import CountryChart from "@/components/country-chart";
import DayOfWeek from "@/components/day-of-week";
import FunnelTrend from "@/components/funnel-trend";
import LeadSourceSummary from "@/components/lead-source-summary";
import HomeFunnel from "@/components/home-funnel";
import LeadMagnetCard from "@/components/lead-magnet-card";
import BlogCardsCard from "@/components/blog-cards-card";
import { SummaryBanner, InsightBox } from "@/components/insight-box";
import { summaryInsight, reportMeta, sectionInsights } from "@/lib/insights";
import PasswordGate from "@/components/password-gate";

function SourceBadge({ source, loading }: { source: "live" | "static"; loading: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md bg-white/5 border border-white/10 text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
        Loading
      </span>
    );
  }
  if (source === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 live-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md bg-white/5 border border-white/10 text-white/30">
      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
      Static
    </span>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("30d");
  const analytics = useAnalytics(period);

  return (
    <PasswordGate>
    <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-semibold text-lg shadow-lg shadow-blue-500/25">S</div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-white/90">SearcHRight Analytics</h1>
              <SourceBadge source={analytics.source} loading={analytics.loading} />
            </div>
            <p className="text-[13px] text-white/30 mt-0.5">{periodLabels[period]} · vs 전기 동일 기간 비교</p>
          </div>
        </div>
        <DatePicker value={period} onChange={setPeriod} />
      </header>

      <div className="space-y-5">
        <SummaryBanner
          {...summaryInsight}
          analyzedAt={
            analytics.source === "live" && analytics.fetchedAt
              ? `${new Date(analytics.fetchedAt).toLocaleString("ko-KR", {
                  timeZone: "Asia/Seoul",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })} KST · 데이터 라이브 (분석 코멘트는 ${reportMeta.analyzedAt} 기준)`
              : `${reportMeta.analyzedAt} (정적)`
          }
        />
        <KpiCards data={analytics.kpis} />
        <InsightBox comments={sectionInsights.find(s => s.section === "kpi")?.comments ?? []} />

        <DailyTrend data={analytics.dailyTrend} />

        {/* 리드 인입 종합 — 홈 인라인 폼 vs 문의 페이지 */}
        <LeadSourceSummary data={analytics.leadSummary} />

        {/* 리드 퍼널 심화 섹션 (홈 + 문의 통합) */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-blue-500/15 rounded-[24px] p-1.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-xl font-semibold text-amber-400/90">리드 퍼널 심층 분석</h2>
            <p className="text-[13px] text-white/30 mt-1">
              홈 인라인 폼 (Hero 섹션) · 문의 페이지(/request) — 출처별 분리 진단
            </p>
          </div>
          <div className="space-y-5 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <HomeFunnel data={analytics.homeFunnel} />
              <FunnelChart period={period} data={analytics.funnel} />
            </div>
            <ChannelConversion data={analytics.channelConversion} />
            <InsightBox comments={sectionInsights.find(s => s.section === "funnel")?.comments ?? []} />
            <FunnelTrend data={analytics.dailyFunnel} />
            <PageConversion data={analytics.pageConversion} />
            <InsightBox comments={sectionInsights.find(s => s.section === "page_conversion")?.comments ?? []} />
          </div>
        </div>

        <InsightBox comments={sectionInsights.find(s => s.section === "channel_conversion")?.comments ?? []} />

        {/* 트래픽 분석 */}
        <EngagementTrend data={analytics.dailyTrend} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SourceMedium data={analytics.sourceMedium} />
          <ChannelChart period={period} data={analytics.channels} />
        </div>
        <InsightBox comments={sectionInsights.find(s => s.section === "source")?.comments ?? []} />

        <TopPages data={analytics.topPages} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <DeviceChart period={period} data={analytics.devices} />
          <UserTypeChart data={analytics.newVsReturning} />
          <DayOfWeek data={analytics.dayOfWeek} />
        </div>
        <InsightBox comments={sectionInsights.find(s => s.section === "device")?.comments ?? []} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <HostnameChart data={analytics.hostnames} />
          <CountryChart data={analytics.countries} />
        </div>

        {/* 홈 콘텐츠 성과 — LeadMagnet + Blog 카드 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <LeadMagnetCard data={analytics.leadMagnet} />
          <BlogCardsCard data={analytics.blogCards} />
        </div>

        <EventsChart period={period} data={analytics.events} />
      </div>

      <footer className="mt-16 text-center text-[11px] text-white/20 pb-10 tracking-wide">
        Google Analytics 4 · Property 452138811
        {analytics.source === "live" && analytics.fetchedAt
          ? ` · ${new Date(analytics.fetchedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`
          : ` · ${reportMeta.analyzedAt}`}
        {" "}· SearcHRight AI
      </footer>
    </main>
    </PasswordGate>
  );
}
